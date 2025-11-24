from etl_process.vendedores import etl_vendedores
from etl_process.zonas import etl_zonas
from utils.dbf_utils import DBF_CONNECTION_STRING


def main():
    print(DBF_CONNECTION_STRING)


if __name__ == "__main__":
    # Vendedores
    etl_vendedores()

    # Zonas
    etl_zonas()
