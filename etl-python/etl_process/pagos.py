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
def get_pagos():
    dbf_connection_string = get_dbf_connection_string(False)
    connection = create_connection(dbf_connection_string)
    cursor = connection.cursor()

    pagos = dict()

    for vendedor in VENDEDORES:
        try:
            codigo_vendedor = vendedor["codigo"]
            carpeta = vendedor["carpeta"]
            ruta = rf"{DBF_PATH}\{carpeta}"

            query = f"""
                SELECT numtrans,
                tipotrans,
                fecha,
                importe,
                banco,
                obs,
                recibo
                FROM {ruta}/pagos
            """

            resultado = execute_query(cursor, query)

            pagos[codigo_vendedor] = resultado

        except pyodbc.ProgrammingError as e:
            if e.args[0] == "42S02":
                continue
            else:
                print(f"Error al extraer pagos para el vendedor {carpeta}: {e}")

    return pagos


# Transform
def clean_pagos(pagos: Dict[str, List[Dict[str, str]]]):
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

    cleaned_pagos = list()

    for codigo_vendedor, pagos_vendedor in pagos.items():
        vendedor_id = vendedores.get(codigo_vendedor, None)

        if not vendedor_id:
            print(
                f"Advertencia: El vendedor con código {codigo_vendedor} no existe en la base de datos destino. Se omiten sus pagos."
            )
            continue

        ventas_vendedor = None
        compras_vendedor = None
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
                    SELECT id, id_correlativo FROM compras WHERE vendedor_id = %s
                    """

                db_cursor.execute(
                    select_query,
                    (vendedor_id,),
                )
                result = db_cursor.fetchall()

                compras_vendedor = {
                    compra["id_correlativo"]: compra["id"] for compra in result
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

        for pago in pagos_vendedor:
            id_correlativo = int(pago["numtrans"])

            tipo_transaccion = pago["tipotrans"].strip().upper()
            venta_id = None
            compra_id = None

            if tipo_transaccion == "COM":
                compra_id = compras_vendedor.get(id_correlativo, None)
            else:
                venta_id = ventas_vendedor.get(id_correlativo, None)

            if not venta_id and not compra_id:
                print(
                    f"Advertencia: Ni la venta ni la compra con id_correlativo {id_correlativo} existen para el vendedor {codigo_vendedor}. Se omite el pago."
                )
                continue

            fecha = pago["fecha"]
            monto = float(pago["importe"])

            observaciones = pago["obs"].strip()
            if observaciones == "":
                observaciones = None

            recibo = pago["recibo"].strip()

            # TODO: Hacer la lógica para el cálculo de la comisión
            porcentaje_comision = 8.0

            codigo_billetera = pago["banco"].strip().upper()
            billetera_id = billeteras_vendedor.get(codigo_billetera, None)

            if not billetera_id:
                print(
                    f"Advertencia: La billetera con código {codigo_billetera} no existe para el vendedor {codigo_vendedor}. Se omite el pago."
                )
                continue

            cleaned_pago = {
                "venta_id": venta_id,
                "compra_id": compra_id,
                "fecha": fecha,
                "importe": monto,
                "observaciones": observaciones,
                "billetera_id": billetera_id,
                "recibo": recibo,
                "vendedor_id": vendedor_id,
                "porcentaje_comision": porcentaje_comision,
            }

            cleaned_pagos.append(cleaned_pago)

    return cleaned_pagos


# Load
def load_pagos(pagos: List[Dict[str, str]]):
    with MARIADB_CONNECTION as connection:
        connection.connect()

        with connection.cursor() as db_cursor:
            insert_query = """
                INSERT INTO pagos (venta_id, compra_id, fecha, importe, observaciones, billetera_id, recibo, vendedor_id, porcentaje_comision)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

            for pago in pagos:
                try:
                    db_cursor.execute(
                        insert_query,
                        (
                            pago["venta_id"],
                            pago["compra_id"],
                            pago["fecha"],
                            pago["importe"],
                            pago["observaciones"],
                            pago["billetera_id"],
                            pago["recibo"],
                            pago["vendedor_id"],
                            pago["porcentaje_comision"],
                        ),
                    )
                except Exception as e:
                    print(
                        f"Error al insertar el pago {pago['venta_id']} o compra {pago['compra_id']}: {e}"
                    )
        connection.commit()


def etl_pagos():
    print("=" * 50)
    print("Iniciando proceso ETL para Pagos...")

    print("Extrayendo datos de pagos...")
    pagos = get_pagos()

    print("Transformando datos de pagos...")
    cleaned_pagos = clean_pagos(pagos)

    print("Cargando datos de pagos en la base de datos de destino...")
    load_pagos(cleaned_pagos)

    print("Proceso ETL para Pagos completado.")
