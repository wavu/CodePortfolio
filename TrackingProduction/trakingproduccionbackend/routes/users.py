from flask import Blueprint, request, jsonify
from services.auth import authenticate, generate_token, token_required
from services.database import get_db_connection
import bcrypt
import pyodbc

users_blueprint = Blueprint('users', __name__)

@users_blueprint.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username and password:
        user, message = authenticate(username, password)
        print(user)
        if user:
            token = generate_token(user)
            return jsonify({'token': token, 'user': user}), 200
        else:
            return jsonify({"message": message}), 401
    else:
        return jsonify({"message": "Username and password required"}), 400

@users_blueprint.route('/crear', methods=['POST', 'OPTIONS'])
@token_required
def create_user(current_user):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    user_data = request.json
    try:
        hashed_password = bcrypt.hashpw(user_data['contraseña'].encode('utf-8'), bcrypt.gensalt())
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Usuarios (NombreCompleto, NombreUsuario, Contraseña, CorreoElectronico, ID_Rol) VALUES (?, ?, ?, ?, ?)",
                       (user_data['nombreCompleto'], user_data['nombreUsuario'], hashed_password.decode('utf-8'), user_data['correoElectronico'], user_data['idRol']))
        conn.commit()
        conn.close()
        return jsonify({"message": "Usuario creado exitosamente"}), 201
    except pyodbc.Error as e:
        print('Error al crear usuario:', e)
        return jsonify({"message": "Error al crear usuario"}), 500

@users_blueprint.route('/<username>', methods=['PUT', 'OPTIONS'])
@token_required
def update_user(current_user, username):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    user_data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Usuarios SET NombreCompleto = ?, CorreoElectronico = ?, ID_Rol = ?, Movil = ? WHERE NombreUsuario = ?",
                       (user_data['nombreCompleto'], user_data['correoElectronico'], user_data['idRol'], user_data['movil'], username))
        conn.commit()
        conn.close()
        return jsonify({"message": "Usuario actualizado exitosamente"})
    except pyodbc.Error as e:
        print('Error al actualizar usuario:', e)
        return jsonify({"message": "Error al actualizar usuario"}), 500

@users_blueprint.route('/<username>', methods=['DELETE', 'OPTIONS'])
@token_required
def delete_user(current_user, username):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Usuarios WHERE NombreUsuario = ?", (username,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Usuario eliminado exitosamente"})
    except pyodbc.Error as e:
        print('Error al eliminar usuario:', e)
        return jsonify({"message": "Error al eliminar usuario"}), 500

@users_blueprint.route('/search', methods=['GET', 'OPTIONS'])
def search_users():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    username = request.args.get('username')
    if username:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Usuarios WHERE NombreUsuario LIKE ?", ('%' + username + '%',))
            users = cursor.fetchall()
            users_data = [{"ID": user.ID, "NombreCompleto": user.NombreCompleto, "NombreUsuario": user.NombreUsuario,
                           "CorreoElectronico": user.CorreoElectronico, "ID_Rol": user.ID_Rol, "Movil": user.Movil} for user in users]
            print(users_data)
            return jsonify(users_data)
        except pyodbc.Error as e:
            print('Error during user search:', e)
            return jsonify({"message": "User search failed"}), 500
    else:
        return jsonify({"message": "Username parameter required"}), 400

@users_blueprint.route('/search-movil', methods=['GET', 'OPTIONS'])
@token_required
def search_movil_users(current_user):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    name = request.args.get('name')
    if name:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Usuarios WHERE NombreUsuario LIKE ? AND Movil = 1", ('%' + name + '%',))
            users = cursor.fetchall()
            users_data = [{"ID": user.ID, "NombreCompleto": user.NombreCompleto, "NombreUsuario": user.NombreUsuario,
                           "CorreoElectronico": user.CorreoElectronico, "ID_Rol": user.ID_Rol, "Movil": user.Movil} for user in users]
            print(users_data)
            return jsonify(users_data)
        except pyodbc.Error as e:
            print('Error during user search:', e)
            return jsonify({"message": "User search failed"}), 500
    else:
        return jsonify({"message": "Username parameter required"}), 400

@users_blueprint.route('/all', methods=['GET'])
@token_required
def get_all_users(current_user):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT ID, NombreCompleto FROM Usuarios")
        users = [{'ID': row.ID, 'NombreCompleto': row.NombreCompleto} for row in cursor.fetchall()]
        conn.close()
        return jsonify(users), 200
    except pyodbc.Error as e:
        print('Error al obtener usuarios:', e)
        return jsonify({"message": "Error al obtener usuarios"}), 500
    
@users_blueprint.route('/allmovil', methods=['GET'])
@token_required
def get_allmovil_users(current_user):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT ID, NombreCompleto FROM Usuarios where Movil = 1")
        users = [{'ID': row.ID, 'NombreCompleto': row.NombreCompleto} for row in cursor.fetchall()]
        conn.close()
        return jsonify(users), 200
    except pyodbc.Error as e:
        print('Error al obtener usuarios:', e)
        return jsonify({"message": "Error al obtener usuarios"}), 500