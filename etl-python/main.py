from etl_process.clientes import etl_clientes
from etl_process.lotes import etl_lotes
from etl_process.productos.grupos import etl_grupos
from etl_process.productos.marcas import etl_marcas
from etl_process.productos.productos import etl_productos
from etl_process.vendedores import etl_vendedores
from etl_process.zonas import etl_zonas
from utils.dbf_utils import DBF_CONNECTION_STRING


def print_spacer():
    print("\n---------------------------------------------------\n")


def main():
    print(DBF_CONNECTION_STRING)


if __name__ == "__main__":
    etl_vendedores()
    print_spacer()

    etl_zonas()
    print_spacer()

    etl_clientes()
    print_spacer()

    etl_marcas()
    print_spacer()

    etl_grupos()
    print_spacer()

    etl_productos()
    print_spacer()

    etl_lotes()
    print_spacer()
