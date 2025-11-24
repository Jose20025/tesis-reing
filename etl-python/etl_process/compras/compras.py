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
def get_compras():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    compras = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT tipotrans,
                numtrans,
                fecha,
                codprov,
                total,
                dcto,
                neto
                FROM {ruta}/almhead
                WHERE tipotrans IN ('COM')
            """

            resultado = execute_query(cursor, query)

            compras[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer compras para el vendedor {carpeta}: {e}")

    return compras


# Transform
def clean_compras(compras: Dict[str, List[Dict[str, str]]]):
    proveedores = None
    vendedores = None

    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            select_query = """
                SELECT id, codigo FROM proveedores
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            proveedores = {proveedor["codigo"]: proveedor["id"] for proveedor in result}

            select_query = """
                SELECT id, codigo FROM vendedores
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            vendedores = {vendedor["codigo"]: vendedor["id"] for vendedor in result}

    cleaned_compras = []

    ERRORS_CSV_PATH = "errores_compras.csv"

    def log_error(id_correlativo, codigo_vendedor, codigo_proveedor, razon):
        with open(ERRORS_CSV_PATH, mode="a", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow([id_correlativo, codigo_vendedor, codigo_proveedor, razon])

    # Antes del loop principal, puedes agregar el encabezado si el archivo no existe
    if not os.path.exists(ERRORS_CSV_PATH):
        with open(ERRORS_CSV_PATH, mode="w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(
                ["id_correlativo", "codigo_vendedor", "codigo_proveedor", "razon"]
            )

    for codigo_vendedor, compras_vendedor in compras.items():
        for compra in compras_vendedor:
            id_correlativo = int(compra["numtrans"])
            fecha_compra = compra["fecha"]
            total = float(compra["total"])
            descuento = float(compra["dcto"])
            neto = float(compra["neto"])

            if total == 0 or neto == 0:
                continue

            codigo_proveedor = compra["codprov"].strip().upper()
            proveedor_id = proveedores.get(codigo_proveedor, None)

            if not proveedor_id:
                log_error(
                    id_correlativo,
                    codigo_vendedor,
                    codigo_proveedor,
                    "proveedor no encontrado",
                )
                continue

            vendedor_id = vendedores.get(codigo_vendedor, None)
            if not vendedor_id:
                log_error(
                    id_correlativo,
                    codigo_vendedor,
                    codigo_proveedor,
                    "vendedor no encontrado",
                )
                continue

            cleaned_compra = {
                "id_correlativo": id_correlativo,
                "fecha": fecha_compra,
                "proveedor_id": proveedor_id,
                "vendedor_id": vendedor_id,
                "total": total,
                "descuento": descuento,
                "neto": neto,
            }

            cleaned_compras.append(cleaned_compra)

    return cleaned_compras


# Load
def load_compras(compras: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO compras (id_correlativo, fecha, proveedor_id, vendedor_id, total, descuento, neto)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """

                for compra in compras:
                    db_cursor.execute(
                        insert_query,
                        (
                            compra["id_correlativo"],
                            compra["fecha"],
                            compra["proveedor_id"],
                            compra["vendedor_id"],
                            compra["total"],
                            compra["descuento"],
                            compra["neto"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar las compras: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_compras():
    print("=" * 50)
    print("Iniciando proceso ETL para Compras...")

    print("Extrayendo datos de compras...")
    compras = get_compras()

    print("Transformando datos de compras...")
    cleaned_compras = clean_compras(compras)

    print("Cargando datos de compras en la base de datos de destino...")
    load_compras(cleaned_compras)

    print("Proceso ETL para Compras completado.")
