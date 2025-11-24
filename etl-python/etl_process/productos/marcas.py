from typing import Dict, List

import pyodbc

from db_destino import MARIADB_CONNECTION
from utils.dbf_data import VENDEDORES
from utils.dbf_utils import (
    DBF_CONNECTION_STRING,
    DBF_PATH,
    create_connection,
    execute_query,
)


# Extract
def get_marcas():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    marcas = dict()

    for vendedor in VENDEDORES:
        try:
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT *
                FROM {ruta}/marca
            """

            resultado = execute_query(cursor, query)

            for marca in resultado:
                codigo_marca = marca["marca"].strip().upper()

                if codigo_marca not in marcas:
                    marcas[codigo_marca] = marca
                else:
                    continue
        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer marcas para el vendedor {carpeta}: {e}")

    return marcas


# Transform
def clean_marcas(marcas: Dict[str, Dict[str, str]]):
    cleaned_marcas = []

    for marca in marcas.values():
        codigo = marca["marca"].strip().upper()
        descripcion = marca["descrip"].strip().title()

        cleaned_marca = {
            "codigo": codigo,
            "descripcion": descripcion,
        }

        cleaned_marcas.append(cleaned_marca)

    return cleaned_marcas


# Load
def load_marcas(marcas: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO marcas_producto (codigo, descripcion)
                VALUES (%s, %s)
                """

                for marca in marcas:
                    db_cursor.execute(
                        insert_query,
                        (
                            marca["codigo"],
                            marca["descripcion"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar las marcas: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_marcas():
    print("=" * 50)
    print("Iniciando proceso ETL para Marcas...")

    print("Extrayendo datos de marcas...")
    marcas = get_marcas()

    print("Transformando datos de marcas...")
    cleaned_marcas = clean_marcas(marcas)

    print("Cargando datos de marcas en la base de datos de destino...")
    load_marcas(cleaned_marcas)

    print("Proceso ETL para Marcas completado.")
