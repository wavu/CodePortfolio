from flask import Blueprint, request, jsonify
from services.auth import token_required
from services.database import get_db_connection
import pyodbc

roles_blueprint = Blueprint('roles', __name__)

@roles_blueprint.route('/crear', methods=['POST'])
@token_required
def create_role(current_user):
    role_data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Roles (NombreRol, DescripcionRol) VALUES (?, ?)",
                       (role_data['nombreRol'], role_data['descripcionRol']))
        conn.commit()
        conn.close()
        return jsonify({"message": "Rol creado exitosamente"}), 201
    except pyodbc.Error as e:
        print('Error al crear rol:', e)
        return jsonify({"message": "Error al crear rol"}), 500

@roles_blueprint.route('/update/<int:role_id>', methods=['PUT'])
@token_required
def update_role(current_user, role_id):
    role_data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Roles SET NombreRol = ?, DescripcionRol = ? WHERE ID = ?",
                       (role_data['NombreRol'], role_data['DescripcionRol'], role_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Rol actualizado exitosamente"})
    except pyodbc.Error as e:
        print('Error al actualizar rol:', e)
        return jsonify({"message": "Error al actualizar rol"}), 500

@roles_blueprint.route('/<int:role_id>', methods=['DELETE'])
@token_required
def delete_role(current_user, role_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Roles WHERE ID = ?", (role_id,))
        cursor.execute("DELETE FROM Rol_Permisos WHERE RolID = ?", (role_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Rol eliminado exitosamente"})
    except pyodbc.Error as e:
        print('Error al eliminar rol:', e)
        return jsonify({"message": "Error al eliminar rol"}), 500

@roles_blueprint.route('/listar', methods=['GET'])
@token_required
def get_roles(current_user):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Roles")
        roles = cursor.fetchall()
        conn.close()
        roles_data = [{"ID": role.ID, "NombreRol": role.NombreRol, "DescripcionRol": role.DescripcionRol} for role in roles]
        return jsonify(roles_data)
    except pyodbc.Error as e:
        print('Error al obtener la lista de roles:', e)
        return jsonify({"message": "Error al obtener la lista de roles"}), 500

@roles_blueprint.route('/<int:id>/permissions', methods=['PUT'])
@token_required
def update_permissions_by_role_id(current_user, id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener los datos del cuerpo de la solicitud
        data = request.json
        rolePermissions = data.get('rolePermissions')
        
        # Eliminar todos los permisos asociados al rol
        cursor.execute("DELETE FROM Rol_Permisos WHERE RolID = ?", (id,))
        
        # Insertar los nuevos registros de permisos
        for permission in rolePermissions:
            cursor.execute("INSERT INTO Rol_Permisos (RolID, NombrePermiso) VALUES (?, ?)",
                           (id, permission['permission']))
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Permisos actualizados exitosamente para el rol"})
    except pyodbc.Error as e:
        print('Error al actualizar los permisos asignados al rol:', e)
        return jsonify({"message": "Error al actualizar los permisos asignados al rol"}), 500

@roles_blueprint.route('/<int:id>/permissions', methods=['GET'])
@token_required
def get_permissions_by_role_id(current_user, id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT NombrePermiso FROM Rol_Permisos WHERE RolID = ?", (id,))
        permissions = cursor.fetchall()
        conn.close()
        # Convertir los permisos a una lista de objetos JSON
        permissions_list = [{"NombrePermiso": permiso.NombrePermiso} for permiso in permissions]
        return jsonify(permissions_list)
    except pyodbc.Error as e:
        print('Error al obtener los permisos asignados al rol:', e)
        return jsonify({"message": "Error al obtener los permisos asignados al rol"}), 500
