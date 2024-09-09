from flask import Blueprint, jsonify
from services.sap_b1 import obtener_token, obtener_ordenes_autorizadas
from services.database import get_db_connection
import pyodbc

orders_blueprint = Blueprint('orders', __name__)

@orders_blueprint.route('/produccion', methods=['GET'])
def get_ordenes_autorizadas():
    try:
        token = obtener_token()
        ordenes_data = obtener_ordenes_autorizadas(token)
        ordenes = ordenes_data.get('value', [])

        conn = get_db_connection()
        cursor = conn.cursor()

        for orden in ordenes:
            orden_fabricacion = orden.get("'OrdenFabricaion'")
            fecha_creacion = orden.get("'FechaCreacion'")
            fecha_planeada_inicio = orden.get("'FechaPlaneadaInicio'")
            fecha_entrega_cedi = orden.get("'FechaEntregaCEDI'")
            fecha_entrega_cliente = orden.get("'FechaEntregaCliente'")
            producto = orden.get("'Producto'")
            nombre_producto = orden.get("'NombreProducto'")
            cantidad_planeada = orden.get("'CantidadPlaneada'")
            unidad_medida = orden.get("'UnidadMedida'")
            almacen = orden.get("'Almacen'")
            orden_venta = orden.get("'OrdenVenta'")
            cliente = orden.get("'Cliente'")
            stage_inicial = orden.get("StageInicial")

            cursor.execute("SELECT ID FROM Stage WHERE Nombre = ?", (stage_inicial,))
            stage_row = cursor.fetchone()
            stage_id = stage_row[0] if stage_row else None

            cursor.execute("SELECT COUNT(*) FROM OrdenesFabricacion WHERE OrdenFabricacion = ?", (orden_fabricacion,))
            if cursor.fetchone()[0] == 0:
                cursor.execute(
                    "INSERT INTO OrdenesFabricacion (OrdenFabricacion, FechaCreacion, FechaPlaneadaInicio, FechaEntregaCEDI, FechaEntregaCliente, Producto, NombreProducto, CantidadPlaneada, UnidadMedida, Almacen, OrdenVenta, Cliente, StageID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (orden_fabricacion, fecha_creacion, fecha_planeada_inicio, fecha_entrega_cedi, fecha_entrega_cliente, producto, nombre_producto, cantidad_planeada, unidad_medida, almacen, orden_venta, cliente, stage_id)
                )

        conn.commit()
        conn.close()

        return jsonify({"ordenes": ordenes}), 200
    except Exception as e:
        print('Error al obtener e insertar órdenes autorizadas:', e)
        return jsonify({"message": "Error al obtener e insertar órdenes autorizadas"}), 500

@orders_blueprint.route('/ordenes_fabricacion', methods=['GET'])
def get_ordenes_fabricacion():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        SELECT o.*, s.Nombre as StageNombre
        FROM OrdenesFabricacion o
        LEFT JOIN Stage s ON o.StageID = s.ID
        """
        cursor.execute(query)
        ordenes = cursor.fetchall()
        conn.close()

        ordenes_data = []
        for orden in ordenes:
            orden_data = {
                'OrdenFabricacion': orden.OrdenFabricacion,
                'FechaCreacion': orden.FechaCreacion,
                'FechaPlaneadaInicio': orden.FechaPlaneadaInicio,
                'FechaEntregaCEDI': orden.FechaEntregaCEDI,
                'FechaEntregaCliente': orden.FechaEntregaCliente,
                'Producto': orden.Producto,
                'NombreProducto': orden.NombreProducto,
                'CantidadPlaneada': orden.CantidadPlaneada,
                'UnidadMedida': orden.UnidadMedida,
                'Almacen': orden.Almacen,
                'OrdenVenta': orden.OrdenVenta,
                'Cliente': orden.Cliente,
                'StageNombre': orden.StageNombre if orden.StageNombre else ''
            }
            ordenes_data.append(orden_data)

        return jsonify({"ordenes": ordenes_data}), 200
    except pyodbc.Error as e:
        print('Error al obtener órdenes de fabricación:', e)
        return jsonify({"message": "Error al obtener órdenes de fabricación"}), 500

@orders_blueprint.route('/orden_fabricacion/<int:orden_fabricacion_id>', methods=['GET'])
def get_orden_fabricacion(orden_fabricacion_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        SELECT o.*, s.Nombre as StageNombre, s.Descripcion as StageDescripcion, s.StageAnterior, s.StageSiguiente
        FROM OrdenesFabricacion o
        LEFT JOIN Stage s ON o.StageID = s.ID
        WHERE o.OrdenFabricacion = ?
        """
        cursor.execute(query, (orden_fabricacion_id,))
        orden = cursor.fetchone()
        conn.close()

        if orden:
            orden_data = {
                'OrdenFabricacion': orden.OrdenFabricacion,
                'FechaCreacion': orden.FechaCreacion,
                'FechaPlaneadaInicio': orden.FechaPlaneadaInicio,
                'FechaEntregaCEDI': orden.FechaEntregaCEDI,
                'FechaEntregaCliente': orden.FechaEntregaCliente,
                'Producto': orden.Producto,
                'NombreProducto': orden.NombreProducto,
                'CantidadPlaneada': orden.CantidadPlaneada,
                'UnidadMedida': orden.UnidadMedida,
                'Almacen': orden.Almacen,
                'OrdenVenta': orden.OrdenVenta,
                'Cliente': orden.Cliente,
                'StageNombre': orden.StageNombre if orden.StageNombre else '',
                'StageDescripcion': orden.StageDescripcion if orden.StageDescripcion else '',
                'StageAnterior': orden.StageAnterior if orden.StageAnterior else '',
                'StageSiguiente': orden.StageSiguiente if orden.StageSiguiente else ''
            }
            return jsonify(orden_data), 200
        else:
            return jsonify({"message": "Orden de fabricación no encontrada"}), 404
    except pyodbc.Error as e:
        print('Error al obtener la orden de fabricación:', e)
        return jsonify({"message": "Error al obtener la orden de fabricación"}), 500
