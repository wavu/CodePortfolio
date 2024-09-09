from flask import Blueprint, request, jsonify
from services.auth import token_required
from services.database import get_db_connection
import pyodbc

stages_blueprint = Blueprint('stages', __name__)

@stages_blueprint.route('/crear', methods=['POST', 'OPTIONS'])
@token_required
def create_stage(current_user):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    stage_data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        stage_anterior = stage_data.get('stageAnterior')
        stage_siguiente = stage_data.get('stageSiguiente')
        
        if stage_anterior == 'inicio':
            stage_anterior = None
        if stage_siguiente == 'final':
            stage_siguiente = None
        
        cursor.execute(
            "INSERT INTO Stage (Nombre, Descripcion, StageAnterior, StageSiguiente, ID_Usuario) VALUES (?, ?, ?, ?, ?)",
            (stage_data['nombre'], stage_data['descripcion'], stage_anterior, stage_siguiente, current_user)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Stage creado exitosamente"}), 201
    except pyodbc.Error as e:
        print('Error al crear stage:', e)
        return jsonify({"message": "Error al crear stage"}), 500

@stages_blueprint.route('/listar', methods=['GET'])
def get_stages():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT ID, Nombre, Descripcion, StageAnterior, StageSiguiente FROM Stage")
        stages = [{'ID': row.ID, 'Nombre': row.Nombre, 'Descripcion': row.Descripcion, 'StageAnterior': row.StageAnterior, 'StageSiguiente': row.StageSiguiente} for row in cursor.fetchall()]
        conn.close()
        return jsonify(stages), 200
    except pyodbc.Error as e:
        print('Error al obtener stages:', e)
        return jsonify({"message": "Error al obtener stages"}), 500

@stages_blueprint.route('/actualizar/<int:id>', methods=['PUT', 'OPTIONS'])
@token_required
def update_stage(current_user, id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    stage_data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        stage_anterior = stage_data.get('stageAnterior')
        stage_siguiente = stage_data.get('stageSiguiente')
        
        if stage_anterior == 'inicio':
            stage_anterior = None
        if stage_siguiente == 'final':
            stage_siguiente = None
        
        cursor.execute(
            "UPDATE Stage SET Nombre = ?, Descripcion = ?, StageAnterior = ?, StageSiguiente = ?, ID_Usuario = ? WHERE ID = ?",
            (stage_data['nombre'], stage_data['descripcion'], stage_anterior, stage_siguiente, current_user, id)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Stage actualizado exitosamente"}), 200
    except pyodbc.Error as e:
        print('Error al actualizar stage:', e)
        return jsonify({"message": "Error al actualizar stage"}), 500

@stages_blueprint.route('/eliminar/<int:id>', methods=['DELETE', 'OPTIONS'])
@token_required
def delete_stage(current_user, id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Stage WHERE ID = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Stage eliminado exitosamente"}), 200
    except pyodbc.Error as e:
        print('Error al eliminar stage:', e)
        return jsonify({"message": "Error al eliminar stage"}), 500
