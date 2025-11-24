from typing import Dict, List

from db_destino import MARIADB_CONNECTION
from utils.dbf_utils import DBF_CONNECTION_STRING, create_connection, execute_query


# Extract
def get_clientes():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    query = """
        SELECT codcli,
        nombre,
        direccion,
        telefono,
        celular,
        zona
        FROM DATAMASTER/clientes c
    """

    clientes = execute_query(cursor, query)

    return clientes


# Transform
def clean_clientes(clientes: List[Dict[str, str]]):
    zonas = None

    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            select_query = """
                SELECT * FROM zonas
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            zonas = {zona["codigo"]: zona["id"] for zona in result}

    cleaned_clientes = []

    for cliente in clientes:
        codigo_cliente = cliente["codcli"].strip().upper()
        nombre_cliente = cliente["nombre"].strip().upper()

        telefono = cliente["telefono"]

        if not telefono or telefono.strip() == "":
            telefono = cliente["celular"]

            if not telefono:
                telefono = None

        if telefono:
            telefono = telefono.strip()

        direccion = cliente["direccion"].strip().upper()

        if direccion == "":
            direccion = None

        # Buscar la zona
        codigo_zona = cliente["zona"].strip().upper()

        zona_id = zonas.get(codigo_zona, None)

        if not zona_id:
            print(
                f"Advertencia: La zona con código {codigo_zona} no existe en la base de datos destino para el cliente {codigo_cliente}. Se omite este cliente."
            )
            continue

        cleaned_cliente = {
            "codigo_cliente": codigo_cliente,
            "nombre": nombre_cliente,
            "direccion": direccion,
            "telefono": telefono,
            "zona_id": zona_id,
        }

        cleaned_clientes.append(cleaned_cliente)

    return cleaned_clientes


# Load
def load_clientes(clientes: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            insert_query = """
                INSERT INTO clientes (codigo, nombre, direccion, telefono, zona_id)
                VALUES (%s, %s, %s, %s, %s)
                """

            for cliente in clientes:
                try:
                    db_cursor.execute(
                        insert_query,
                        (
                            cliente["codigo_cliente"],
                            cliente["nombre"],
                            cliente["direccion"],
                            cliente["telefono"],
                            cliente["zona_id"],
                        ),
                    )

                except Exception as e:
                    print(f"Error al cargar los clientes: {e}")
                    connection.rollback()

            connection.commit()


def etl_clientes():
    print("=" * 50)
    print("Iniciando proceso ETL para Clientes...")

    print("Extrayendo datos de clientes...")
    clientes = get_clientes()

    print("Transformando datos de clientes...")
    cleaned_clientes = clean_clientes(clientes)

    print("Cargando datos de clientes en la base de datos de destino...")
    load_clientes(cleaned_clientes)

    print("Proceso ETL para Clientes completado.")
