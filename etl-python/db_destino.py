import os
from dotenv import load_dotenv
import pymysql

load_dotenv()

mariadb_connection_string = os.getenv("DB_CONNECTION_URL")

if not mariadb_connection_string:
    raise ValueError("DB_CONNECTION_URL environment variable not set")

MARIADB_CONNECTION_STRING = mariadb_connection_string

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "test_db")

MARIADB_CONNECTION = pymysql.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor,
)
