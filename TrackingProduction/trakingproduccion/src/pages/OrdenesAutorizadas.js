import React, { useEffect, useState, useContext } from 'react';
import { Table, Alert, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { AuthContext } from '../components/AuthContext';
import { API_SAP } from '../App';
import { useNavigate } from 'react-router-dom';
import './OrdenesAutorizadas.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUndo, faTimes } from '@fortawesome/free-solid-svg-icons';

const OrdenesAutorizadas = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      const hasPermission = checkPermission(userData.permissions, 'S03');
      setHasPermission(hasPermission);
      if (!hasPermission) {
        navigate('/dashboard');
      } else {
        fetchAndStoreOrdenes();
      }
    }
  }, [navigate, token]);

  const checkPermission = (permissions, permission) => {
    return permissions && permissions.includes(permission);
  };

  const fetchAndStoreOrdenes = async () => {
    try {
      const response = await fetch(`${API_SAP}/orders/produccion`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener e insertar órdenes autorizadas');
      }
      await fetchOrdenesFabricacion();
    } catch (error) {
      console.error('Error en fetchAndStoreOrdenes:', error);
      setError('Ocurrió un error al obtener las órdenes autorizadas');
      setTimeout(() => setError(''), 10000); // 10 segundos
    }
  };

  const fetchOrdenesFabricacion = async () => {
    try {
      const response = await fetch(`${API_SAP}/orders/ordenes_fabricacion`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrdenes(data.ordenes);
      } else {
        throw new Error('Error al obtener las órdenes de fabricación');
      }
    } catch (error) {
      console.error('Error en fetchOrdenesFabricacion:', error);
      setError('Ocurrió un error al obtener las órdenes de fabricación');
      setTimeout(() => setError(''), 10000); // 10 segundos
    }
  };

  const fetchOrdenFabricacionDetail = async (ordenFabricacionId) => {
    try {
      const response = await fetch(`${API_SAP}/orders/orden_fabricacion/${ordenFabricacionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedOrden(data);
      } else {
        throw new Error('Error al obtener la orden de fabricación');
      }
    } catch (error) {
      console.error('Error en fetchOrdenFabricacionDetail:', error);
      setError('Ocurrió un error al obtener la orden de fabricación');
      setTimeout(() => setError(''), 10000); // 10 segundos
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container">
      <h1>Órdenes de Fabricación Autorizadas</h1>
      {hasPermission ? (
        <>
          {error && <Alert variant="danger">{error}</Alert>}
          <Table striped bordered hover className="compact-table">
            <thead>
              <tr>
                <th>Orden de Fabricación</th>
                <th>Producto</th>
                <th>Nombre Producto</th>
                <th>Fecha Creación</th>
                <th>Fecha Planeada Inicio</th>
                <th>Fecha de Entrega</th>
                <th>Almacén</th>
                <th>Cantidad Planeada</th>
                <th>Cliente</th>
                <th>Orden de Venta</th>
                <th>Unidad de Medida</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden, index) => (
                <tr key={index} onClick={() => fetchOrdenFabricacionDetail(orden.OrdenFabricacion)} style={{ cursor: 'pointer' }}>
                  <td>{orden.OrdenFabricacion}</td>
                  <td>{orden.Producto}</td>
                  <td>{orden.NombreProducto}</td>
                  <td>{formatDate(orden.FechaCreacion)}</td>
                  <td>{formatDate(orden.FechaPlaneadaInicio)}</td>
                  <td>{formatDate(orden.FechaEntregaCEDI || orden.FechaEntregaCliente)}</td>
                  <td>{orden.Almacen}</td>
                  <td>{orden.CantidadPlaneada}</td>
                  <td>{orden.Cliente}</td>
                  <td>{orden.OrdenVenta}</td>
                  <td>{orden.UnidadMedida}</td>
                  <td>{orden.StageNombre || ''}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {selectedOrden && (
            <div className="orden-detalle">
              <h2>Detalle de la Orden de Fabricación</h2>
              <div className="orden-detalle-info">
                <p><strong>Orden de Fabricación:</strong> {selectedOrden.OrdenFabricacion}</p>
                <p><strong>Producto:</strong> {selectedOrden.Producto}</p>
                <p><strong>Nombre Producto:</strong> {selectedOrden.NombreProducto}</p>
                <p><strong>Fecha Creación:</strong> {formatDate(selectedOrden.FechaCreacion)}</p>
                <p><strong>Fecha Planeada Inicio:</strong> {formatDate(selectedOrden.FechaPlaneadaInicio)}</p>
                <p><strong>Fecha de Entrega:</strong> {formatDate(selectedOrden.FechaEntregaCEDI || selectedOrden.FechaEntregaCliente)}</p>
                <p><strong>Almacén:</strong> {selectedOrden.Almacen}</p>
                <p><strong>Cantidad Planeada:</strong> {selectedOrden.CantidadPlaneada}</p>
                <p><strong>Cliente:</strong> {selectedOrden.Cliente}</p>
                <p><strong>Orden de Venta:</strong> {selectedOrden.OrdenVenta}</p>
                <p><strong>Unidad de Medida:</strong> {selectedOrden.UnidadMedida}</p>
                <p><strong>Stage Nombre:</strong> {selectedOrden.StageNombre}</p>
                <p><strong>Stage Descripción:</strong> {selectedOrden.StageDescripcion}</p>
                <p><strong>Stage Anterior:</strong> {selectedOrden.StageAnterior}</p>
                <p><strong>Stage Siguiente:</strong> {selectedOrden.StageSiguiente}</p>
              </div>
              <div className="orden-detalle-botones">
                <OverlayTrigger placement="top" overlay={<Tooltip>Autorizar</Tooltip>}>
                  <Button variant="light">
                    <FontAwesomeIcon icon={faCheck} />
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Regresar</Tooltip>}>
                  <Button variant="light">
                    <FontAwesomeIcon icon={faUndo} />
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Rechazar</Tooltip>}>
                  <Button variant="light">
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </OverlayTrigger>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>No tienes permiso para ver esta página.</p>
      )}
    </div>
  );
};

export default OrdenesAutorizadas;
