import bcrypt
import jwt
import datetime
from services.database import get_db_connection
import pyodbc
from config import SECRET_KEY, JWT_EXPIRATION_DELTA
from functools import wraps
from flask import request, jsonify
from flask import Blueprint, request, jsonify
from functools import wraps

def authenticate(username, password):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Usuarios WHERE NombreUsuario = ?", (username,))
        user = cursor.fetchone()
        if user:
            hashed_password = user.Contraseña.encode('utf-8')
            if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
                cursor.execute("SELECT NombrePermiso FROM Rol_Permisos WHERE RolID = ?", (user.ID_Rol,))
                permissions = [row.NombrePermiso for row in cursor.fetchall()]
                user_data = {
                    "ID": user.ID,
                    "NombreCompleto": user.NombreCompleto,
                    "NombreUsuario": user.NombreUsuario,
                    "CorreoElectronico": user.CorreoElectronico,
                    "ID_Rol": user.ID_Rol,
                    "permissions": permissions
                }
                return user_data, "Conexión exitosa a la base de datos"
            else:
                return None, "Contraseña incorrecta"
        else:
            return None, "Usuario no encontrado"
    except pyodbc.Error as e:
        print('Error during authentication:', e)
        return None, "Error al conectar a la base de datos"

def generate_token(user):
    payload = {
        'user_id': user['ID'],
        'username': user['NombreUsuario'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXPIRATION_DELTA)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            print("Manejando método OPTIONS")
            return jsonify({'status': 'OK'}), 200

        auth_header = request.headers.get('Authorization')
        print(f"Authorization Header: {auth_header}")
        if not auth_header:
            print("Token is missing!")
            return jsonify({'message': 'Token is missing!'}), 401
        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != 'Bearer':
            print("Token format is invalid!")
            return jsonify({'message': 'Token format is invalid!'}), 401

        token = parts[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

auth_blueprint = Blueprint('auth', __name__)
@auth_blueprint.route('/validate-token', methods=['POST'])
@token_required
def validate_token(current_user):
    return jsonify({'message': 'Token is valid!'}), 200
