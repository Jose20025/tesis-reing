from typing import Dict, List

from db_destino import MARIADB_CONNECTION
from utils.dbf_utils import DBF_CONNECTION_STRING, create_connection, execute_query


# Extract
def get_lotes():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    query = """
        SELECT *
        FROM DATAMASTER/lotesmaster
    """

    lotes = execute_query(cursor, query)

    return lotes


# Transform
def clean_lotes(lotes: List[Dict[str, str]]):
    cleaned_lotes = []

    for lote in lotes:
        # Aquí irá la lógica de transformación de datos

        cleaned_lote = {
            # Aquí irán los campos del lote
        }

        cleaned_lotes.append(cleaned_lote)

    return cleaned_lotes


# Load
def load_lotes(lotes: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                
                """

                for lote in lotes:
                    db_cursor.execute(
                        insert_query,
                        (
                            # Aquí irán los parámetros del lote
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar los lotes: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_lotes():
    print("=" * 50)
    print("Iniciando proceso ETL para Lotes...")

    print("Extrayendo datos de lotes...")
    lotes = get_lotes()

    print("Transformando datos de lotes...")
    cleaned_lotes = clean_lotes(lotes)

    print("Cargando datos de lotes en la base de datos de destino...")
    load_lotes(cleaned_lotes)

    print("Proceso ETL para Lotes completado.")
