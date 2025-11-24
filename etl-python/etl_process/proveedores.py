from typing import Dict, List

import pyodbc

from db_destino import MARIADB_CONNECTION
from utils.dbf_data import VENDEDORES
from utils.dbf_utils import (
    DBF_PATH,
    create_connection,
    execute_query,
    get_dbf_connection_string,
)


# Extract
def get_proveedores():
    dbf_connection_string = get_dbf_connection_string(False)
    connection = create_connection(dbf_connection_string)
    cursor = connection.cursor()

    proveedores = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT codigo,
                nombre,
                telefono
                FROM {ruta}/proveedo
            """

            resultado = execute_query(cursor, query)

            proveedores[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer proveedores para el vendedor {carpeta}: {e}")

    return proveedores


# Transform
def clean_proveedores(proveedores: Dict[str, List[Dict[str, str]]]):
    cleaned_proveedores = list()

    for proveedores_vendedor in proveedores.values():
        for proveedor in proveedores_vendedor:
            codigo_proveedor = proveedor["codigo"].strip().upper()
            nombre = proveedor["nombre"].strip()
            telefono = (
                proveedor.get("telefono", "").strip()
                if proveedor.get("telefono")
                else None
            )

            # Si el teléfono está vacío, lo convertimos a None para permitir nulos
            if telefono == "":
                telefono = None

            cleaned_proveedor = {
                "codigo": codigo_proveedor,
                "nombre": nombre,
                "telefono": telefono,
            }

            cleaned_proveedores.append(cleaned_proveedor)

    return cleaned_proveedores


# Load
def load_proveedores(proveedores: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            insert_query = """
                INSERT INTO proveedores (codigo, nombre, telefono)
                VALUES (%s, %s, %s)
                """

            for proveedor in proveedores:
                try:
                    db_cursor.execute(
                        insert_query,
                        (
                            proveedor["codigo"],
                            proveedor["nombre"],
                            proveedor["telefono"],
                        ),
                    )
                except Exception as e:
                    print(f"Error al insertar el proveedor {proveedor['codigo']}: {e}")

        connection.commit()


def etl_proveedores():
    print("=" * 50)
    print("Iniciando proceso ETL para Proveedores...")

    print("Extrayendo datos de proveedores...")
    proveedores = get_proveedores()

    print("Transformando datos de proveedores...")
    cleaned_proveedores = clean_proveedores(proveedores)

    print("Cargando datos de proveedores en la base de datos de destino...")
    load_proveedores(cleaned_proveedores)

    print("Proceso ETL para Proveedores completado.")
