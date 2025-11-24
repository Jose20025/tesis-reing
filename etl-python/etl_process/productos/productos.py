from typing import Dict, List

import pyodbc

from db_destino import MARIADB_CONNECTION
from utils.dbf_data import VENDEDORES
from utils.dbf_utils import (
    DBF_CONNECTION_STRING,
    DBF_PATH,
    create_connection,
    execute_query,
)


# Extract
def get_productos():
    connection = create_connection(DBF_CONNECTION_STRING)
    cursor = connection.cursor()

    productos = dict()

    for vendedor in VENDEDORES:
        try:
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT *
                FROM {ruta}/almmat
            """

            resultado = execute_query(cursor, query)

            for producto in resultado:
                codigo_producto = producto["codmat"].strip().upper()

                if codigo_producto not in productos:
                    productos[codigo_producto] = producto
                else:
                    continue

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer productos para el vendedor {carpeta}: {e}")

    return productos


# Transform
def clean_productos(productos: Dict[str, Dict[str, str]]):
    marcas = None
    grupos = None

    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            select_query = """
                SELECT * FROM marcas_producto
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            marcas = {marca["codigo"]: marca["id"] for marca in result}

            select_query = """
                SELECT * FROM grupos_producto
                """

            db_cursor.execute(
                select_query,
            )
            result = db_cursor.fetchall()

            grupos = {grupo["codigo"]: grupo["id"] for grupo in result}

    cleaned_productos = []

    for producto in productos.values():
        codigo_producto = producto["codmat"].strip().upper()
        nombre = producto["descrip"].strip()
        costo = float(producto["p_compra"] or 0)
        precio_venta = float(producto["p_venta1"] or 0)
        is_activo = producto["activo"].strip().upper() == "S"

        codigo_grupo = producto["grupo"].strip().upper()
        codigo_marca = producto["marca"].strip().upper()

        # Buscar IDs de grupo y marca
        grupo_id = grupos.get(codigo_grupo, None)
        marca_id = marcas.get(codigo_marca, None)

        if not grupo_id or not marca_id:
            print(
                f"Grupo o Marca no encontrada para el producto {codigo_producto}, se omite."
            )
            continue

        cleaned_producto = {
            "codigo": codigo_producto,
            "nombre": nombre,
            "grupo_id": grupo_id,
            "marca_id": marca_id,
            "costo": costo,
            "precio": precio_venta,
            "is_activo": is_activo,
        }

        cleaned_productos.append(cleaned_producto)

    return cleaned_productos


# Load
def load_productos(productos: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            try:
                insert_query = """
                INSERT INTO productos (codigo, nombre, grupo_id, marca_id, costo, precio, is_activo)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """

                for producto in productos:
                    db_cursor.execute(
                        insert_query,
                        (
                            producto["codigo"],
                            producto["nombre"],
                            producto["grupo_id"],
                            producto["marca_id"],
                            producto["costo"],
                            producto["precio"],
                            producto["is_activo"],
                        ),
                    )

            except Exception as e:
                print(f"Error al cargar los productos: {e}")
                connection.rollback()

            finally:
                connection.commit()


def etl_productos():
    print("=" * 50)
    print("Iniciando proceso ETL para Productos...")

    print("Extrayendo datos de productos...")
    productos = get_productos()

    print("Transformando datos de productos...")
    cleaned_productos = clean_productos(productos)

    print("Cargando datos de productos en la base de datos de destino...")
    load_productos(cleaned_productos)

    print("Proceso ETL para Productos completado.")
