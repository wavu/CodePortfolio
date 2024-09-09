import pyodbc
from config import Config

def get_db_connection():
    return pyodbc.connect(f'DSN={Config.DATABASE};UID={Config.USERNAMEBD};PWD={Config.PASSWORDBD}')
