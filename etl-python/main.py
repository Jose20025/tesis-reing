from etl_process.vendedores import etl_vendedores
from utils.dbf_utils import DBF_CONNECTION_STRING


def main():
    print(DBF_CONNECTION_STRING)


if __name__ == "__main__":
    etl_vendedores()
