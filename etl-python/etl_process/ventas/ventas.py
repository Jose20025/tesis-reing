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
def get_ventas():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    ventas = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT tipotrans,
                numtrans,
                fecha,
                codcli,
                total,
                dcto,
                neto
                FROM {ruta}/almhead
                WHERE tipotrans IN ('VCR', 'VCO')
            """

            resultado = execute_query(cursor, query)

            ventas[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer ventas para el vendedor {carpeta}: {e}")

    return ventas


# Transform
def clean_ventas(ventas: Dict[str, List[Dict[str, str]]]):
    clientes = None
    vendedores = None

    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            select_query = """
                SELECT id, codigo FROM clientes
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            clientes = {cliente["codigo"]: cliente["id"] for cliente in result}

            select_query = """
                SELECT id, codigo FROM vendedores
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            vendedores = {vendedor["codigo"]: vendedor["id"] for vendedor in result}

    cleaned_ventas = []

    for codigo_vendedor, ventas_vendedor in ventas.items():
        ERRORS_CSV_PATH = "errores_ventas.csv"

        def log_error(id_correlativo, codigo_vendedor, codigo_cliente, razon):
            with open(
                ERRORS_CSV_PATH, mode="a", newline="", encoding="utf-8"
            ) as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(
                    [id_correlativo, codigo_vendedor, codigo_cliente, razon]
                )

        # Antes del loop principal, puedes agregar el encabezado si el archivo no existe
        if not os.path.exists(ERRORS_CSV_PATH):
            with open(
                ERRORS_CSV_PATH, mode="w", newline="", encoding="utf-8"
            ) as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(
                    ["id_correlativo", "codigo_vendedor", "codigo_cliente", "razon"]
                )

        for venta in ventas_vendedor:
            id_correlativo = int(venta["numtrans"])
            tipo_transaccion = venta["tipotrans"].strip().upper()
            fecha_venta = venta["fecha"]
            total = float(venta["total"])
            descuento = float(venta["dcto"])
            neto = float(venta["neto"])

            if total == 0 or neto == 0:
                continue

            codigo_cliente = venta["codcli"].strip().upper()
            cliente_id = clientes.get(codigo_cliente, None)

            if not cliente_id:
                log_error(
                    id_correlativo,
                    codigo_vendedor,
                    codigo_cliente,
                    "cliente no encontrado",
                )
                continue

            vendedor_id = vendedores.get(codigo_vendedor, None)
            if not vendedor_id:
                log_error(
                    id_correlativo,
                    codigo_vendedor,
                    codigo_cliente,
                    "vendedor no encontrado",
                )
                continue

            cleaned_venta = {
                "id_correlativo": id_correlativo,
                "tipo_transaccion": tipo_transaccion,
                "fecha": fecha_venta,
                "cliente_id": cliente_id,
                "vendedor_id": vendedor_id,
                "total": total,
                "descuento": descuento,
                "neto": neto,
            }

            cleaned_ventas.append(cleaned_venta)

    return cleaned_ventas


# Load
def load_ventas(ventas: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO ventas (id_correlativo, tipo_transaccion, fecha, cliente_id, vendedor_id, total, descuento, neto)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """

                for venta in ventas:
                    db_cursor.execute(
                        insert_query,
                        (
                            venta["id_correlativo"],
                            venta["tipo_transaccion"],
                            venta["fecha"],
                            venta["cliente_id"],
                            venta["vendedor_id"],
                            venta["total"],
                            venta["descuento"],
                            venta["neto"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar las ventas: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_ventas():
    print("=" * 50)
    print("Iniciando proceso ETL para Ventas...")

    print("Extrayendo datos de ventas...")
    ventas = get_ventas()

    print("Transformando datos de ventas...")
    cleaned_ventas = clean_ventas(ventas)

    print("Cargando datos de ventas en la base de datos de destino...")
    load_ventas(cleaned_ventas)

    print("Proceso ETL para Ventas completado.")
