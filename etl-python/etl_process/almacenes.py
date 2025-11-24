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
def get_almacenes():
    dbf_connection_string = get_dbf_connection_string(False)
    connection = create_connection(dbf_connection_string)
    cursor = connection.cursor()

    almacenes = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT *
                FROM {ruta}/almacen
                WHERE codalm IN ('ALM1', 'AA', 'AAL')
            """

            resultado = execute_query(cursor, query)

            almacenes[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer marcas para el vendedor {carpeta}: {e}")

    return almacenes


# Transform
def clean_almacenes(almacenes: Dict[str, List[Dict[str, str]]]):
    vendedores = None

    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            select_query = """
                SELECT * FROM vendedores
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            vendedores = {vendedor["codigo"]: vendedor["id"] for vendedor in result}

    cleaned_almacenes = list()

    for codigo_vendedor, almacenes_vendedor in almacenes.items():
        vendedor_id = vendedores.get(codigo_vendedor, None)

        if not vendedor_id:
            print(
                f"Advertencia: El vendedor con código {codigo_vendedor} no existe en la base de datos destino. Se omiten sus almacenes."
            )
            continue

        for almacen in almacenes_vendedor:
            codigo_almacen = almacen["codalm"].strip().upper()
            descripcion = almacen["descrip"].strip()

            cleaned_almacen = {
                "codigo": codigo_almacen,
                "descripcion": descripcion,
                "vendedor_id": vendedor_id,
            }

            cleaned_almacenes.append(cleaned_almacen)

    return cleaned_almacenes


# Load
def load_almacenes(almacenes: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO almacenes (codigo, descripcion, vendedor_id)
                VALUES (%s, %s, %s)
                """

                for almacen in almacenes:
                    db_cursor.execute(
                        insert_query,
                        (
                            almacen["codigo"],
                            almacen["descripcion"],
                            almacen["vendedor_id"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar los almacenes: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_almacenes():
    print("=" * 50)
    print("Iniciando proceso ETL para Almacenes...")

    print("Extrayendo datos de almacenes...")
    almacenes = get_almacenes()

    print("Transformando datos de almacenes...")
    cleaned_almacenes = clean_almacenes(almacenes)

    print("Cargando datos de almacenes en la base de datos de destino...")
    load_almacenes(cleaned_almacenes)

    print("Proceso ETL para Almacenes completado.")
