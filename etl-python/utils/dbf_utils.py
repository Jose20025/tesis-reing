import os
from typing import Dict, List, Literal, Union, overload

import pyodbc
from dotenv import load_dotenv
from pyodbc import Cursor

from utils.convert_utils import convert_to_json_dict, convert_to_json_list

load_dotenv()

DBF_PATH = os.getenv("DBF_PATH", r"F:\CLONE_DBF")


def create_connection(connection_string: str) -> pyodbc.Connection:
    connection = pyodbc.connect(connection_string, autocommit=False)
    connection.setencoding(encoding="latin1")
    connection.autocommit = False

    return connection


def get_dbf_connection_string(include_deleted: bool = True) -> str:
    deleted_flag = "YES" if include_deleted else "NO"
    return f"DRIVER=Microsoft Visual FoxPro Driver;SourceType=DBF;SourceDB={DBF_PATH};Exclusive=No;Collate=Machine;NULL=NO;DELETED={deleted_flag};BACKGROUNDFETCH=NO;"


DBF_CONNECTION_STRING = get_dbf_connection_string()


# ===== EXECUTE QUERY WITH TYPE OVERLOADING ===== #
@overload
def execute_query(
    cursor: Cursor,
    query: str,
    params: tuple = ...,
    iso_date: bool = ...,
    return_type: Literal["list"] = ...,
) -> List[Dict]: ...


@overload
def execute_query(
    cursor: Cursor,
    query: str,
    params: tuple = ...,
    iso_date: bool = ...,
    return_type: Literal["dict"] = ...,
) -> Dict: ...


@overload
def execute_query(
    cursor: Cursor,
    query: str,
    params: tuple = ...,
    iso_date: bool = ...,
    return_type: None = ...,
) -> None: ...


def execute_query(
    cursor: Cursor,
    query: str,
    params: tuple = (),
    iso_date: bool = False,
    return_type: Literal["dict", "list", None] = "list",
) -> Union[List[Dict], Dict, None]:
    cursor.execute(query, params)

    data: Union[None, List, Dict] = None

    if return_type is None:
        return data

    columns = [column[0] for column in cursor.description]

    if return_type == "list":
        datos = cursor.fetchall()
        data = convert_to_json_list(datos, columns, iso_date=iso_date)
        return data

    elif return_type == "dict":
        datos = cursor.fetchone()
        data = convert_to_json_dict(datos, columns, iso_date=iso_date)
        return data
