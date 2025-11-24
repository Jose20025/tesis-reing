from typing import Dict, List

from db_destino import MARIADB_CONNECTION
from utils.dbf_data import VENDEDORES


# Extract
def get_vendedores():
    vendedores = VENDEDORES.copy()

    return vendedores


# Transform
def clean_vendedores(vendedores: List[Dict[str, str]]):
    comision_id = None

    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            select_query = """
                SELECT id FROM comisiones
                WHERE codigo = %s
                """

            db_cursor.execute(select_query, ("0016",))
            result = db_cursor.fetchone()

            comision_id = result["id"] if result else None

    cleaned_vendedores = []

    for vendedor in vendedores:
        codigo = vendedor["codigo"].strip().upper()
        nombre = vendedor["nombre"].strip().title()

        cleaned_vendedor = {
            "codigo": codigo,
            "nombre": nombre,
            "comision_id": comision_id,
        }

        cleaned_vendedores.append(cleaned_vendedor)

    return cleaned_vendedores


# Load
def load_vendedores(vendedores: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                for vendedor in vendedores:
                    codigo = vendedor["codigo"]
                    nombre = vendedor["nombre"]
                    comision_id = vendedor["comision_id"]

                    insert_query = """
                        INSERT INTO vendedores (codigo, nombre, comision_id)
                        VALUES (%s, %s, %s)
                    """

                    db_cursor.execute(
                        insert_query,
                        (codigo, nombre, comision_id),
                    )

            except Exception as e:
                print(f"Error al cargar vendedores: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_vendedores():
    print("=" * 50)
    print("Iniciando proceso ETL para vendedores...")

    print("Extrayendo datos de vendedores...")
    vendedores = get_vendedores()

    print("Transformando datos de vendedores...")
    vendedores_clean = clean_vendedores(vendedores)

    print("Cargando datos de vendedores en la base de datos destino...")
    load_vendedores(vendedores_clean)

    print("Proceso ETL para vendedores completado.")
