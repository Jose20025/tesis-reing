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
def get_cobranzas():
    dbf_connection_string = get_dbf_connection_string(False)
    connection = create_connection(dbf_connection_string)
    cursor = connection.cursor()

    cobranzas = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT numtrans,
                fecha,
                importe,
                banco,
                obs,
                recibo
                FROM {ruta}/pagos
            """

            resultado = execute_query(cursor, query)

            cobranzas[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer cobranzas para el vendedor {carpeta}: {e}")

    return cobranzas


# Transform
def clean_cobranzas(cobranzas: Dict[str, List[Dict[str, str]]]):
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

    cleaned_cobranzas = list()

    for codigo_vendedor, cobranzas_vendedor in cobranzas.items():
        vendedor_id = vendedores.get(codigo_vendedor, None)

        if not vendedor_id:
            print(
                f"Advertencia: El vendedor con código {codigo_vendedor} no existe en la base de datos destino. Se omiten sus cobranzas."
            )
            continue

        ventas_vendedor = None
        billeteras_vendedor = None

        with MARIADB_CONNECTION as connection:
            connection.connect()

            with connection.cursor() as db_cursor:
                select_query = """
                    SELECT id, id_correlativo FROM ventas WHERE vendedor_id = %s
                    """

                db_cursor.execute(
                    select_query,
                    (vendedor_id,),
                )
                result = db_cursor.fetchall()

                ventas_vendedor = {
                    venta["id_correlativo"]: venta["id"] for venta in result
                }

                select_query = """
                    SELECT id, codigo FROM billeteras WHERE vendedor_id = %s
                    """

                db_cursor.execute(
                    select_query,
                    (vendedor_id,),
                )

                result = db_cursor.fetchall()
                billeteras_vendedor = {
                    billetera["codigo"]: billetera["id"] for billetera in result
                }

        for cobranza in cobranzas_vendedor:
            id_correlativo = int(cobranza["numtrans"])
            venta_id = ventas_vendedor.get(id_correlativo, None)

            if not venta_id:
                print(
                    f"Advertencia: La venta con id_correlativo {id_correlativo} no existe para el vendedor {codigo_vendedor}. Se omite la cobranza."
                )
                continue

            fecha = cobranza["fecha"]
            monto = float(cobranza["importe"])
            observaciones = cobranza["obs"].strip()
            recibo = cobranza["recibo"].strip()

            # TODO: Hacer la lógica para el cálculo de la comisión
            porcentaje_comision = 8.0

            codigo_billetera = cobranza["banco"].strip().upper()
            billetera_id = billeteras_vendedor.get(codigo_billetera, None)

            if not billetera_id:
                print(
                    f"Advertencia: La billetera con código {codigo_billetera} no existe para el vendedor {codigo_vendedor}. Se omite la cobranza."
                )
                continue

            cleaned_cobranza = {
                "venta_id": venta_id,
                "fecha": fecha,
                "importe": monto,
                "observaciones": observaciones,
                "billetera_id": billetera_id,
                "recibo": recibo,
                "vendedor_id": vendedor_id,
                "porcentaje_comision": porcentaje_comision,
            }

            cleaned_cobranzas.append(cleaned_cobranza)

    return cleaned_cobranzas


# Load
def load_cobranzas(cobranzas: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            insert_query = """
                INSERT INTO cobranzas (venta_id, fecha, importe, observaciones, billetera_id, recibo, vendedor_id, porcentaje_comision)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """

            for cobranza in cobranzas:
                try:
                    db_cursor.execute(
                        insert_query,
                        (
                            cobranza["venta_id"],
                            cobranza["fecha"],
                            cobranza["importe"],
                            cobranza["observaciones"],
                            cobranza["billetera_id"],
                            cobranza["recibo"],
                            cobranza["vendedor_id"],
                            cobranza["porcentaje_comision"],
                        ),
                    )
                except Exception as e:
                    print(f"Error al insertar la cobranza {cobranza['venta_id']}: {e}")
        connection.commit()


def etl_cobranzas():
    print("=" * 50)
    print("Iniciando proceso ETL para Cobranzas...")

    print("Extrayendo datos de cobranzas...")
    cobranzas = get_cobranzas()

    print("Transformando datos de cobranzas...")
    cleaned_cobranzas = clean_cobranzas(cobranzas)

    print("Cargando datos de cobranzas en la base de datos de destino...")
    load_cobranzas(cleaned_cobranzas)

    print("Proceso ETL para Cobranzas completado.")
