from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SQL_SERVER = os.getenv('DB_SERVER')
    DATABASE = os.getenv('DB_DATABASE')
    USERNAMEBD = os.getenv('DB_USERNAME')
    PASSWORDBD = os.getenv('DB_PASSWORD')
    DRIVER = os.getenv('DB_DRIVER')
    SAP_B1_URL = os.getenv('SAP_B1_URL')
    SAP_B1_COMPANY_DB = os.getenv('SAP_B1_COMPANY_DB')
    SAP_B1_USERNAME = os.getenv('SAP_B1_USERNAME')
    SAP_B1_PASSWORD = os.getenv('SAP_B1_PASSWORD')
    WKHTMLTOPDF_PATH = os.getenv('WKHTMLTOPDF_PATH')

SECRET_KEY = 'SECRETKEY'
JWT_EXPIRATION_DELTA = 3600  # Token válido por 1 hora
