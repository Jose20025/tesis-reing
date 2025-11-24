from etl_process.almacenes import etl_almacenes
from etl_process.billeteras import etl_billeteras
from etl_process.clientes import etl_clientes
from etl_process.cobranzas import etl_cobranzas
from etl_process.comisiones import etl_comisiones
from etl_process.compras.compras import etl_compras
from etl_process.compras.detalle_compras import etl_detalle_compras
from etl_process.lotes import etl_lotes
from etl_process.productos.grupos import etl_grupos
from etl_process.productos.marcas import etl_marcas
from etl_process.productos.productos import etl_productos
from etl_process.proveedores import etl_proveedores
from etl_process.vendedores import etl_vendedores
from etl_process.ventas.detalle_ventas import etl_detalle_ventas
from etl_process.ventas.ventas import etl_ventas
from etl_process.zonas import etl_zonas


def print_spacer():
    print("\n\n---------------------------------------------------\n\n")


if __name__ == "__main__":
    etl_comisiones()
    print_spacer()

    etl_vendedores()
    print_spacer()

    etl_proveedores()
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

    etl_ventas()
    print_spacer()

    etl_detalle_ventas()
    print_spacer()

    etl_compras()
    print_spacer()

    etl_detalle_compras()
    print_spacer()

    etl_cobranzas()
    print_spacer()
