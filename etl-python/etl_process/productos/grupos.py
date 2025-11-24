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
def get_grupos():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    grupos = dict()

    for vendedor in VENDEDORES:
        try:
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT *
                FROM {ruta}/grupo
            """

            resultado = execute_query(cursor, query)

            for grupo in resultado:
                codigo_grupo = grupo["grupo"].strip().upper()

                if codigo_grupo not in grupos:
                    grupos[codigo_grupo] = grupo
                else:
                    continue
        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer grupos para el vendedor {carpeta}: {e}")

    return grupos


# Transform
def clean_grupos(grupos: Dict[str, Dict[str, str]]):
    cleaned_grupos = []

    for grupo in grupos.values():
        codigo = grupo["grupo"].strip().upper()
        descripcion = grupo["descrip"].strip().title()

        cleaned_grupo = {
            "codigo": codigo,
            "descripcion": descripcion,
        }

        cleaned_grupos.append(cleaned_grupo)

    return cleaned_grupos


# Load
def load_grupos(grupos: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO grupos_producto (codigo, descripcion)
                VALUES (%s, %s)
                """

                for grupo in grupos:
                    db_cursor.execute(
                        insert_query,
                        (
                            grupo["codigo"],
                            grupo["descripcion"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar los grupos: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_grupos():
    print("=" * 50)
    print("Iniciando proceso ETL para Grupos...")

    print("Extrayendo datos de grupos...")
    grupos = get_grupos()

    print("Transformando datos de grupos...")
    cleaned_grupos = clean_grupos(grupos)

    print("Cargando datos de grupos en la base de datos de destino...")
    load_grupos(cleaned_grupos)

    print("Proceso ETL para Grupos completado.")
