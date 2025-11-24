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
    productos = None

    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            select_query = """
                SELECT * FROM productos
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            productos = {producto["codigo"]: producto["id"] for producto in result}

    cleaned_lotes = []

    for lote in lotes:
        id_lote = int(lote["id"])
        codigo_lote = lote["lote"].strip().upper()
        cantidad_importada = int(lote["cantidad"] or 0)

        fecha_ingreso = lote["fecha_alm"]

        mes_vencimiento = int(lote["vcto_mes"])
        year_vencimiento = int(lote["vcto_anio"])

        is_activo = int(lote["activo"]) == 1

        codigo_producto = lote["codmat"].strip().upper()
        producto_id = productos.get(codigo_producto, None)

        if not producto_id:
            print(
                f"Advertencia: El producto con código {codigo_producto} no existe en la base de datos destino. Se omite el lote {codigo_lote}."
            )
            continue

        cleaned_lote = {
            "id": id_lote,
            "producto_id": producto_id,
            "lote": codigo_lote,
            "cantidad_importada": cantidad_importada,
            "fecha_ingreso": fecha_ingreso,
            "mes_vencimiento": mes_vencimiento,
            "year_vencimiento": year_vencimiento,
            "is_activo": is_activo,
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
                INSERT INTO lotes_producto (id, producto_id, lote, cantidad_importada, fecha_ingreso, mes_vencimiento, year_vencimiento, is_activo)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """

                for lote in lotes:
                    db_cursor.execute(
                        insert_query,
                        (
                            lote["id"],
                            lote["producto_id"],
                            lote["lote"],
                            lote["cantidad_importada"],
                            lote["fecha_ingreso"],
                            lote["mes_vencimiento"],
                            lote["year_vencimiento"],
                            lote["is_activo"],
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
