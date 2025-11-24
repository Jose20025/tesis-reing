from typing import Dict, List

from db_destino import MARIADB_CONNECTION

VENDEDORES = [
    {
        "codigo": "AP",
        "nombre": "APETITODO",
    },
    {
        "codigo": "V0",
        "nombre": "Vendedor 0",
    },
    {
        "codigo": "V1",
        "nombre": "Vendedor 1",
    },
    {
        "codigo": "V2",
        "nombre": "Vendedor 2",
    },
    {
        "codigo": "V3",
        "nombre": "Vendedor 3",
    },
    {
        "codigo": "V4",
        "nombre": "Vendedor 4",
    },
    {
        "codigo": "V5",
        "nombre": "Vendedor 5",
    },
    {
        "codigo": "V7",
        "nombre": "Vendedor 7",
    },
    {
        "codigo": "V8",
        "nombre": "Vendedor 8",
    },
    {
        "codigo": "V9",
        "nombre": "Vendedor 9",
    },
    {
        "codigo": "V10",
        "nombre": "Vendedor 10",
    },
    {
        "codigo": "V11",
        "nombre": "Vendedor 11",
    },
    {
        "codigo": "V12",
        "nombre": "Vendedor 12",
    },
    {
        "codigo": "PR1",
        "nombre": "Vendedor PR1",
    },
    {
        "codigo": "L1",
        "nombre": "Vendedor L1",
    },
    {
        "codigo": "L2",
        "nombre": "Vendedor L2",
    },
    {
        "codigo": "L3",
        "nombre": "Vendedor L3",
    },
    {
        "codigo": "C1",
        "nombre": "Vendedor C1",
    },
    {
        "codigo": "C2",
        "nombre": "Vendedor C2",
    },
    {
        "codigo": "C3",
        "nombre": "Vendedor C3",
    },
]


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
