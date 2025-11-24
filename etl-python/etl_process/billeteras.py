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
def get_billeteras():
    dbf_connection_string = get_dbf_connection_string(False)
    connection = create_connection(dbf_connection_string)
    cursor = connection.cursor()

    billeteras = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT codigo,
                detalle,
                moneda
                FROM {ruta}/bancos
            """

            resultado = execute_query(cursor, query)

            billeteras[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer billeteras para el vendedor {carpeta}: {e}")

    return billeteras


# Transform
def clean_billeteras(billeteras: Dict[str, List[Dict[str, str]]]):
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

    cleaned_billeteras = list()

    for codigo_vendedor, billeteras_vendedor in billeteras.items():
        vendedor_id = vendedores.get(codigo_vendedor, None)

        if not vendedor_id:
            print(
                f"Advertencia: El vendedor con código {codigo_vendedor} no existe en la base de datos destino. Se omiten sus billeteras."
            )
            continue

        for billetera in billeteras_vendedor:
            codigo_billetera = billetera["codigo"].strip().upper()
            descripcion = billetera["detalle"].strip()

            moneda = billetera["moneda"].strip().upper()
            moneda = (
                "BOLIVIANOS" if moneda == "B" else "DOLARES" if moneda == "D" else None
            )

            if not moneda:
                print(
                    f"Advertencia: Moneda inválida '{billetera['moneda']}' para la billetera '{codigo_billetera}' del vendedor '{codigo_vendedor}'. Se omite esta billetera."
                )
                continue

            cleaned_billetera = {
                "codigo": codigo_billetera,
                "descripcion": descripcion,
                "moneda": moneda,
                "vendedor_id": vendedor_id,
            }

            cleaned_billeteras.append(cleaned_billetera)

    return cleaned_billeteras


# Load
def load_billeteras(billeteras: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            insert_query = """
                INSERT INTO billeteras (codigo, descripcion, moneda, vendedor_id)
                VALUES (%s, %s, %s, %s)
                """

            for billetera in billeteras:
                try:
                    db_cursor.execute(
                        insert_query,
                        (
                            billetera["codigo"],
                            billetera["descripcion"],
                            billetera["moneda"],
                            billetera["vendedor_id"],
                        ),
                    )
                except Exception as e:
                    print(f"Error al insertar la billetera {billetera['codigo']}: {e}")

        connection.commit()


def etl_billeteras():
    print("=" * 50)
    print("Iniciando proceso ETL para Billeteras...")

    print("Extrayendo datos de billeteras...")
    billeteras = get_billeteras()

    print("Transformando datos de billeteras...")
    cleaned_billeteras = clean_billeteras(billeteras)

    print("Cargando datos de billeteras en la base de datos de destino...")
    load_billeteras(cleaned_billeteras)

    print("Proceso ETL para Billeteras completado.")
