import requests
from config import Config

sap_b1_auth_data = {
    "CompanyDB": Config.SAP_B1_COMPANY_DB,
    "UserName": Config.SAP_B1_USERNAME,
    "Password": Config.SAP_B1_PASSWORD
}

def obtener_token():
    auth_response = requests.post(Config.SAP_B1_URL + '/Login', json=sap_b1_auth_data, verify=False)
    auth_response.raise_for_status()
    return auth_response.headers.get("Set-Cookie")

def obtener_ordenes_autorizadas(token):
    headers = {
        "Cookie": token,
        "Content-Type": "application/json"
    }
    '''orders_response = requests.get(Config.SAP_B1_URL + "/ProductionOrders", headers=headers, verify=False)'''
    orders_response = requests.get(Config.SAP_B1_URL + "/SQLQueries('OrdenesFabricacion')/List", headers=headers, verify=False)
    orders_response.raise_for_status()
    print(orders_response.json())
    return orders_response.json()

def obtener_productos(token):
    headers = {
        "Cookie": token,
        "Content-Type": "application/json"
    }
    productos_response = requests.get(Config.SAP_B1_URL + '/Items?$top=10', headers=headers, verify=False)
    productos_response.raise_for_status()
    return productos_response.json()
