from etl_process.almacenes import etl_almacenes
from etl_process.billeteras import etl_billeteras
from etl_process.clientes import etl_clientes
from etl_process.comisiones import etl_comisiones
from etl_process.lotes import etl_lotes
from etl_process.productos.grupos import etl_grupos
from etl_process.productos.marcas import etl_marcas
from etl_process.productos.productos import etl_productos
from etl_process.vendedores import etl_vendedores
from etl_process.zonas import etl_zonas


def print_spacer():
    print("\n---------------------------------------------------\n")


if __name__ == "__main__":
    etl_comisiones()
    print_spacer()

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

    etl_almacenes()
    print_spacer()

    etl_billeteras()
    print_spacer()
