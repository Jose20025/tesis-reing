from typing import Dict, List

from db_destino import MARIADB_CONNECTION
from utils.dbf_data import VENDEDORES


# Extract
def get_vendedores():
    vendedores = VENDEDORES.copy()

    return vendedores


# Transform
def clean_vendedores(vendedores: List[Dict[str, str]]):
    vendedores_copy = vendedores.copy()

    for vendedor in vendedores_copy:
        vendedor["codigo"] = vendedor["codigo"].strip().upper()
        vendedor["nombre"] = vendedor["nombre"].strip().title()

    return vendedores_copy


# Load
def load_vendedores(vendedores: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                for vendedor in vendedores:
                    codigo = vendedor["codigo"]
                    nombre = vendedor["nombre"]

                    insert_query = """
                        INSERT INTO vendedores (codigo, nombre)
                        VALUES (%s, %s)
                    """

                    db_cursor.execute(
                        insert_query,
                        (codigo, nombre),
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
