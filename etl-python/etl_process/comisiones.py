from typing import Dict, List

from db_destino import MARIADB_CONNECTION
from utils.dbf_utils import DBF_CONNECTION_STRING, create_connection, execute_query


# Extract
def get_comisiones():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    query = """
        SELECT *
        FROM DATAMASTER/comisiones
    """

    comisiones = execute_query(cursor, query)

    return comisiones


# Transform
def clean_comisiones(comisiones: List[Dict[str, str]]):
    cleaned_comisiones = []

    for comision in comisiones:
        codigo_comision = comision["idcomis"].strip()
        descripcion = comision["nombre"].strip().upper()

        periodo_1 = comision["dias1"]
        comision_1 = comision["p1"]
        periodo_2 = comision["dias2"]
        comision_2 = comision["p2"]
        periodo_3 = comision["dias3"]
        comision_3 = comision["p3"]

        cleaned_comision = {
            "codigo": codigo_comision,
            "descripcion": descripcion,
            "periodo_1": periodo_1,
            "comision_1": comision_1,
            "periodo_2": periodo_2,
            "comision_2": comision_2,
            "periodo_3": periodo_3,
            "comision_3": comision_3,
        }

        cleaned_comisiones.append(cleaned_comision)

    return cleaned_comisiones


# Load
def load_comisiones(comisiones: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO comisiones (codigo, descripcion, periodo_1, comision_1, periodo_2, comision_2, periodo_3, comision_3)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """

                for comision in comisiones:
                    db_cursor.execute(
                        insert_query,
                        (
                            comision["codigo"],
                            comision["descripcion"],
                            comision["periodo_1"],
                            comision["comision_1"],
                            comision["periodo_2"],
                            comision["comision_2"],
                            comision["periodo_3"],
                            comision["comision_3"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar las comisiones: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_comisiones():
    print("=" * 50)
    print("Iniciando proceso ETL para Comisiones...")

    print("Extrayendo datos de comisiones...")
    comisiones = get_comisiones()

    print("Transformando datos de comisiones...")
    cleaned_comisiones = clean_comisiones(comisiones)

    print("Cargando datos de comisiones en la base de datos de destino...")
    load_comisiones(cleaned_comisiones)

    print("Proceso ETL para Comisiones completado.")
