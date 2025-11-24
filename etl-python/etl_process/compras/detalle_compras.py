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
def get_detalle_compras():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    detalle_compras = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT numtrans,
                codalm,
                codmat,
                cantidad,
                punit,
                nrolote
                FROM {ruta}/almtrans
                WHERE tipotrans IN ('COM')
            """

            resultado = execute_query(cursor, query)

            detalle_compras[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(
                    f"Error al extraer detalle de compras para el vendedor {carpeta}: {e}"
                )

    return detalle_compras


# Transform
def clean_detalle_compras(detalle_compras: Dict[str, List[Dict[str, str]]]):
    productos = None
    lotes = None

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

    cleaned_detalle_compras = []

    ERRORS_CSV_PATH = "errores_detalle_compras.csv"

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

    for codigo_vendedor, detalle_compras_vendedor in detalle_compras.items():
        compras_vendedor = None
        almacenes_vendedor = None

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
                    SELECT id, id_correlativo FROM compras WHERE vendedor_id = %s
                """

                db_cursor.execute(
                    select_query,
                    (vendedor_id,),
                )

                result = db_cursor.fetchall()

                compras_vendedor = {
                    compra["id_correlativo"]: compra["id"] for compra in result
                }

                select_query = """
                    SELECT id, codigo FROM almacenes
                    WHERE vendedor_id = %s
                    """
                db_cursor.execute(
                    select_query,
                    (vendedor_id,),
                )
                result = db_cursor.fetchall()
                almacenes_vendedor = {
                    almacen["codigo"]: almacen["id"] for almacen in result
                }

        for detalle in detalle_compras_vendedor:
            id_correlativo = int(detalle["numtrans"])

            compra_id = compras_vendedor.get(id_correlativo, None)

            if not compra_id:
                log_error(
                    id_correlativo,
                    codigo_vendedor,
                    "",
                    "compra no encontrada",
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
            almacen_id = almacenes_vendedor.get(codigo_almacen, None)

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
                "compra_id": compra_id,
                "producto_id": producto_id,
                "almacen_id": almacen_id,
                "lote_id": lote_id,
                "cantidad": detalle["cantidad"],
                "precio_unitario": detalle["punit"],
            }

            cleaned_detalle_compras.append(cleaned_detalle)

    return cleaned_detalle_compras


# Load
def load_detalle_compras(detalle_compras: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO detalle_compra (compra_id, almacen_id, producto_id, cantidad, precio_unitario, lote_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                """

                # Preparar todos los datos en una lista de tuplas
                data_to_insert = [
                    (
                        detalle["compra_id"],
                        detalle["almacen_id"],
                        detalle["producto_id"],
                        detalle["cantidad"],
                        detalle["precio_unitario"],
                        detalle["lote_id"],
                    )
                    for detalle in detalle_compras
                ]

                # Usar executemany para insertar todos los registros de una vez
                db_cursor.executemany(insert_query, data_to_insert)

            except Exception as e:
                print(f"Error al cargar el detalle de compras: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_detalle_compras():
    print("=" * 50)
    print("Iniciando proceso ETL para Detalle de Compras...")

    print("Extrayendo datos de detalle de compras...")
    detalle_compras = get_detalle_compras()

    print("Transformando datos de detalle de compras...")
    cleaned_detalle_compras = clean_detalle_compras(detalle_compras)

    print("Cargando datos de detalle de compras en la base de datos de destino...")
    load_detalle_compras(cleaned_detalle_compras)

    print("Proceso ETL para Detalle de Compras completado.")
