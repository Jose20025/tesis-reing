from typing import Dict, List

from db_destino import MARIADB_CONNECTION
from utils.dbf_utils import DBF_CONNECTION_STRING, create_connection, execute_query


# Extract
def get_zonas():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    query = """
        SELECT z.*, c.nombre AS nombre_ciudad
        FROM DATAMASTER/zonas z
        JOIN DATAMASTER/ciudad c ON z.ciudad = c.codigo
    """

    zonas = execute_query(cursor, query)

    return zonas


# Transform
def clean_zonas(zonas: List[Dict[str, str]]):
    cleaned_zonas = []

    for zona in zonas:
        nombre_ciudad = zona["nombre_ciudad"].strip().upper()
        codigo_zona = zona["codigo"].strip()
        nombre_zona = zona["nombre"].strip().upper()

        if nombre_zona.startswith("*"):
            print(f"Zona con asterisco encontrada: {nombre_zona}")
            nombre_zona = nombre_zona[1:].strip()
            print(f"Zona corregida: {nombre_zona}")

        cleaned_zona = {
            "codigo": codigo_zona,
            "nombre": nombre_zona,
            "ciudad": nombre_ciudad,
        }

        cleaned_zonas.append(cleaned_zona)

    return cleaned_zonas


# Load
def load_zonas(zonas: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO zonas (codigo, nombre, ciudad)
                VALUES (%s, %s, %s)
                """

                for zona in zonas:
                    db_cursor.execute(
                        insert_query,
                        (
                            zona["codigo"],
                            zona["nombre"],
                            zona["ciudad"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar las zonas: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_zonas():
    print("=" * 50)
    print("Iniciando proceso ETL para Zonas...")

    print("Extrayendo datos de zonas...")
    zonas = get_zonas()

    print("Transformando datos de zonas...")
    cleaned_zonas = clean_zonas(zonas)

    print("Cargando datos de zonas en la base de datos de destino...")
    load_zonas(cleaned_zonas)

    print("Proceso ETL para Zonas completado.")
