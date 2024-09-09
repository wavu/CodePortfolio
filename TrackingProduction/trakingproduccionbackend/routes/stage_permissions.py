from flask import Blueprint, request, jsonify
from services.auth import token_required
from services.database import get_db_connection
import pyodbc

stage_permissions_blueprint = Blueprint('stage_permissions', __name__)

@stage_permissions_blueprint.route('/asignar', methods=['POST'])
@token_required
def assign_stage_permission(current_user):
    data = request.json
    usuario_id = data.get('usuarioID')
    stage_id = data.get('stageID')
    permiso = data.get('permiso')

    if not usuario_id or not stage_id or not permiso:
        return jsonify({"message": "Todos los campos son requeridos"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificar que el permiso sea válido
        valid_permisos = ['Aprobar', 'Regresar', 'Rechazar', 'Visualizar']
        if permiso not in valid_permisos:
            return jsonify({"message": "Permiso no válido"}), 400

        # Eliminar permisos que no son compatibles con el nuevo permiso
        if permiso == 'Visualizar':
            cursor.execute("DELETE FROM Usuario_Stage_Permisos WHERE UsuarioID = ? AND StageID = ? AND Permiso IN ('Aprobar', 'Regresar', 'Rechazar')", (usuario_id, stage_id))
        else:
            cursor.execute("DELETE FROM Usuario_Stage_Permisos WHERE UsuarioID = ? AND StageID = ? AND Permiso = 'Visualizar'", (usuario_id, stage_id))

        # Insertar o actualizar el permiso
        cursor.execute("MERGE INTO Usuario_Stage_Permisos AS target "
                       "USING (SELECT ? AS UsuarioID, ? AS StageID, ? AS Permiso) AS source "
                       "ON (target.UsuarioID = source.UsuarioID AND target.StageID = source.StageID AND target.Permiso = source.Permiso) "
                       "WHEN MATCHED THEN UPDATE SET Permiso = source.Permiso "
                       "WHEN NOT MATCHED THEN INSERT (UsuarioID, StageID, Permiso) VALUES (source.UsuarioID, source.StageID, source.Permiso);",
                       (usuario_id, stage_id, permiso))
        conn.commit()
        conn.close()
        return jsonify({"message": "Permiso asignado exitosamente"}), 200
    except pyodbc.Error as e:
        print('Error al asignar permiso:', e)
        return jsonify({"message": "Error al asignar permiso"}), 500

@stage_permissions_blueprint.route('/<int:usuario_id>', methods=['GET'])
@token_required
def get_stage_permissions(current_user, usuario_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT StageID, Permiso FROM Usuario_Stage_Permisos WHERE UsuarioID = ?", usuario_id)
        permissions = cursor.fetchall()
        conn.close()

        permissions_data = [{'StageID': row.StageID, 'Permiso': row.Permiso} for row in permissions]
        return jsonify(permissions_data), 200
    except pyodbc.Error as e:
        print('Error al obtener los permisos del usuario:', e)
        return jsonify({"message": "Error al obtener los permisos del usuario"}), 500
