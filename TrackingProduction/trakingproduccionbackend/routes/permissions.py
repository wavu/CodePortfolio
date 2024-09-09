from flask import Blueprint, jsonify
from services.auth import token_required  # Asegúrate de importar token_required
from services.database import get_db_connection
import pyodbc

permissions_blueprint = Blueprint('permissions', __name__)

@permissions_blueprint.route('/listar', methods=['GET'])
@token_required  # Aplicar el decorador para proteger la ruta
def get_permisos(current_user):  # Añadir current_user como parámetro
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Permisos")
        permisos = cursor.fetchall()
        conn.close()

        permisos_data = []
        for permiso in permisos:
            permiso_data = {
                "NombrePermiso": permiso.NombrePermiso,
                "DescripcionPermiso": permiso.DescripcionPermiso
            }
            permisos_data.append(permiso_data)
        return jsonify(permisos_data)
    except pyodbc.Error as e:
        print('Error al obtener la lista de permisos:', e)
        return jsonify({"message": "Error al obtener la lista de permisos"}), 500
