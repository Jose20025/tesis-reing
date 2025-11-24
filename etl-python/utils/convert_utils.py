import datetime
import decimal
from typing import List, Union

from pyodbc import Row


def convert_to_json_list(
    datos: Union[List[Row], None], column_names: List[str], iso_date: bool = False
) -> List[dict]:
    if datos is None:
        return []

    data = []

    for row in datos:
        # Convertir cada fila en un diccionario
        row_dict = {}
        for i, value in enumerate(row):
            # Convertir objetos de tipo decimal y datetime a tipos nativos de Python
            if isinstance(value, decimal.Decimal):
                row_dict[column_names[i]] = float(value)

            elif isinstance(value, str):
                row_dict[column_names[i]] = value.strip()

            elif isinstance(value, datetime.date):
                row_dict[column_names[i]] = value
                row_dict[column_names[i] + "_"] = (
                    value.isoformat() if iso_date else value.strftime("%Y-%m-%d")
                )

            else:
                row_dict[column_names[i]] = value

        data.append(row_dict)

    return data


def convert_to_json_dict(
    data: Union[Row, None], column_names: List[str], iso_date: bool = False
) -> Union[dict, None]:
    if data is None:
        return None

    row_dict = {}
    for i, value in enumerate(data):
        # Convertir objetos de tipo decimal y datetime a tipos nativos de Python
        if isinstance(value, decimal.Decimal):
            row_dict[column_names[i]] = float(value)

        elif isinstance(value, str):
            row_dict[column_names[i]] = value.strip()

        elif isinstance(value, datetime.date):
            row_dict[column_names[i]] = value
            row_dict[column_names[i] + "_"] = (
                value.isoformat() if iso_date else value.strftime("%Y-%m-%d")
            )

        else:
            row_dict[column_names[i]] = value

    return row_dict
