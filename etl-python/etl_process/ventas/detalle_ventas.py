from typing import Dict, List

import pyodbc

from db_destino import MARIADB_CONNECTION
from utils.dbf_data import VENDEDORES
import csv
import os
from utils.dbf_utils import (
    DBF_CONNECTION_STRING,
    DBF_PATH,
    create_connection,
    execute_query,
)


# Extract
def get_detalle_ventas():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    detalle_ventas = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT numtrans,
                codalm,
                codmat,
                (cantidad * -1) as cantidad,
                punit,
                nrolote
                FROM {ruta}/almtrans
                WHERE tipotrans IN ('VCR', 'VCO')
            """

            resultado = execute_query(cursor, query)

            detalle_ventas[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(
                    f"Error al extraer detalle de ventas para el vendedor {carpeta}: {e}"
                )

    return detalle_ventas


# Transform
def clean_detalle_ventas(detalle_ventas: Dict[str, List[Dict[str, str]]]):
    productos = None
    lotes = None
    almacenes = None

    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            select_query = """
                SELECT id, codigo FROM productos
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            productos = {producto["codigo"]: producto["id"] for producto in result}

            select_query = """
                SELECT id, lote from lotes_producto
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            lotes = {lote["lote"]: lote["id"] for lote in result}

            select_query = """
                SELECT id, codigo FROM almacenes
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            almacenes = {almacen["codigo"]: almacen["id"] for almacen in result}

    cleaned_detalle_ventas = []

    ERRORS_CSV_PATH = "errores_detalle_ventas.csv"

    def log_error(id_correlativo, codigo_vendedor, codigo_producto, razon):
        with open(ERRORS_CSV_PATH, mode="a", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow([id_correlativo, codigo_vendedor, codigo_producto, razon])

    # Antes del loop principal, puedes agregar el encabezado si el archivo no existe
    if not os.path.exists(ERRORS_CSV_PATH):
        with open(ERRORS_CSV_PATH, mode="w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(
                [
                    "id_correlativo",
                    "codigo_vendedor",
                    "codigo_producto",
                    "razon",
                ]
            )

    for codigo_vendedor, detalle_ventas_vendedor in detalle_ventas.items():
        ventas_vendedor = None

        with MARIADB_CONNECTION as connection:
            connection.connect()

            with connection.cursor() as db_cursor:
                select_query = """
                    SELECT id FROM vendedores WHERE codigo = %s
                    """

                db_cursor.execute(
                    select_query,
                    (codigo_vendedor,),
                )
                result = db_cursor.fetchone()

                if result:
                    vendedor_id = result["id"]
                else:
                    raise ValueError(
                        f"Vendedor con codigo {codigo_vendedor} no encontrado"
                    )

                select_query = """
                    SELECT id, id_correlativo FROM ventas WHERE vendedor_id = %s
                """

                db_cursor.execute(
                    select_query,
                    (vendedor_id,),
                )

                result = db_cursor.fetchall()

                ventas_vendedor = {
                    venta["id_correlativo"]: venta["id"] for venta in result
                }

        for detalle in detalle_ventas_vendedor:
            id_correlativo = detalle["numtrans"]

            venta_id = ventas_vendedor.get(id_correlativo, None)

            if not venta_id:
                log_error(
                    id_correlativo,
                    codigo_vendedor,
                    "",
                    "venta no encontrada",
                )
                continue

            codigo_producto = detalle["codmat"].strip().upper()
            producto_id = productos.get(codigo_producto, None)

            if not producto_id:
                log_error(
                    id_correlativo,
                    codigo_vendedor,
                    codigo_producto,
                    "producto no encontrado",
                )
                continue

            codigo_almacen = detalle["codalm"].strip().upper()
            almacen_id = almacenes.get(codigo_almacen, None)

            if not almacen_id:
                log_error(
                    id_correlativo,
                    codigo_vendedor,
                    codigo_producto,
                    "almacen no encontrado",
                )
                continue

            codigo_lote = detalle["nrolote"].strip().upper()
            lote_id = lotes.get(codigo_lote, None)

            cleaned_detalle = {
                "venta_id": venta_id,
                "producto_id": producto_id,
                "almacen_id": almacen_id,
                "lote_id": lote_id,
                "cantidad": detalle["cantidad"],
                "precio_unitario": detalle["punit"],
            }

            cleaned_detalle_ventas.append(cleaned_detalle)

    return cleaned_detalle_ventas


# Load
def load_detalle_ventas(detalle_ventas: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO detalle_venta (venta_id, almacen_id, producto_id, cantidad, precio_unitario, lote_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                """

                for detalle in detalle_ventas:
                    db_cursor.execute(
                        insert_query,
                        (
                            detalle["venta_id"],
                            detalle["almacen_id"],
                            detalle["producto_id"],
                            detalle["cantidad"],
                            detalle["precio_unitario"],
                            detalle["lote_id"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar el detalle de ventas: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_detalle_ventas():
    print("=" * 50)
    print("Iniciando proceso ETL para Detalle de Ventas...")

    print("Extrayendo datos de detalle de ventas...")
    detalle_ventas = get_detalle_ventas()

    print("Transformando datos de detalle de ventas...")
    cleaned_detalle_ventas = clean_detalle_ventas(detalle_ventas)

    print("Cargando datos de detalle de ventas en la base de datos de destino...")
    load_detalle_ventas(cleaned_detalle_ventas)

    print("Proceso ETL para Detalle de Ventas completado.")
