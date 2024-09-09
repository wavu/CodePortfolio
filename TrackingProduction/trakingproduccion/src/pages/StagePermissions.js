import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Table, Modal, ListGroup } from 'react-bootstrap';
import { AuthContext } from '../components/AuthContext';
import { API_SAP } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const StagePermissions = () => {
  const [user, setUser] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [stages, setStages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      const hasPermission = checkPermission(userData.permissions, 'S02');
      setHasPermission(hasPermission);
      if (!hasPermission) {
        navigate('/dashboard');
      }
    }
    fetchStages();
  }, [navigate, setUser, token]);

  const checkPermission = (permissions, permission) => {
    return permissions && permissions.includes(permission);
  };

  const fetchStages = async () => {
    try {
      const response = await fetch(`${API_SAP}/stages/listar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStages(data);
      } else {
        setError('Error al obtener la lista de stages');
        setTimeout(() => setError(''), 10000);
      }
    } catch (error) {
      console.error('Error al obtener la lista de stages', error);
      setError('Ocurrió un error al obtener la lista de stages');
      setTimeout(() => setError(''), 10000);
    }
  };

  const fetchUsers = async (searchText) => {
    try {
      const response = await fetch(`${API_SAP}/users/search?username=${searchText}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        setError('Error al obtener la lista de usuarios');
        setTimeout(() => setError(''), 10000);
      }
    } catch (error) {
      console.error('Error al obtener la lista de usuarios', error);
      setError('Ocurrió un error al obtener la lista de usuarios');
      setTimeout(() => setError(''), 10000);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      const response = await fetch(`${API_SAP}/stage_permissions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const permissions = {};
        data.forEach((permiso) => {
          if (!permissions[permiso.StageID]) {
            permissions[permiso.StageID] = {};
          }
          permissions[permiso.StageID][permiso.Permiso] = true;
        });
        setPermissions(permissions);
      } else {
        setError('Error al obtener los permisos del usuario');
        setTimeout(() => setError(''), 10000);
      }
    } catch (error) {
      console.error('Error al obtener los permisos del usuario', error);
      setError('Ocurrió un error al obtener los permisos del usuario');
      setTimeout(() => setError(''), 10000);
    }
  };

  const handleUserSearch = async () => {
    fetchUsers(searchText);
    setIsModalOpen(true);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(false);
    fetchUserPermissions(user.ID);
  };

  const handlePermissionChange = (stageId, permiso, checked) => {
    const newPermissions = { ...permissions };
    if (!newPermissions[stageId]) {
      newPermissions[stageId] = {};
    }

    if (permiso === 'Visualizar' && checked) {
      newPermissions[stageId] = { Visualizar: true };
    } else {
      newPermissions[stageId][permiso] = checked;
      if (checked) {
        delete newPermissions[stageId]['Visualizar'];
      }
    }

    setPermissions(newPermissions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Por favor selecciona un usuario');
      setTimeout(() => setError(''), 10000);
      return;
    }

    const permisos = [];
    Object.keys(permissions).forEach((stageId) => {
      Object.keys(permissions[stageId]).forEach((permiso) => {
        if (permissions[stageId][permiso]) {
          permisos.push({ stageId, permiso });
        }
      });
    });

    try {
      for (const permiso of permisos) {
        const response = await fetch(`${API_SAP}/stage_permissions/asignar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            usuarioID: selectedUser.ID,
            stageID: permiso.stageId,
            permiso: permiso.permiso
          })
        });

        if (!response.ok) {
          throw new Error('Error al asignar el permiso');
        }
      }

      setSuccessMessage('Permisos asignados exitosamente');
      setTimeout(() => {
        setSuccessMessage('');
      }, 10000);
    } catch (error) {
      console.error('Error al asignar permisos', error);
      setError('Ocurrió un error al asignar los permisos');
      setTimeout(() => setError(''), 10000);
    }
  };

  return (
    <div className="container">
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Resultados de la búsqueda</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {usuarios.map((user, index) => (
              <ListGroup.Item key={index} action onClick={() => handleUserClick(user)}>
                {user.NombreUsuario} - {user.NombreCompleto}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
      <h1>Asignar Permisos a Stages</h1>
      {hasPermission ? (
        <>
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form.Group controlId="usuario">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por nombre de usuario"
              />
              <Button variant="info" onClick={handleUserSearch}>
                <FontAwesomeIcon icon={faSearch} /> Buscar Usuario
              </Button>
              {selectedUser && <div>{selectedUser.NombreUsuario} - {selectedUser.NombreCompleto}</div>}
            </Form.Group>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Aprobar</th>
                  <th>Regresar</th>
                  <th>Rechazar</th>
                  <th>Visualizar</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage) => (
                  <tr key={stage.ID}>
                    <td>{stage.Nombre}</td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={permissions[stage.ID]?.Aprobar || false}
                        onChange={(e) => handlePermissionChange(stage.ID, 'Aprobar', e.target.checked)}
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={permissions[stage.ID]?.Regresar || false}
                        onChange={(e) => handlePermissionChange(stage.ID, 'Regresar', e.target.checked)}
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={permissions[stage.ID]?.Rechazar || false}
                        onChange={(e) => handlePermissionChange(stage.ID, 'Rechazar', e.target.checked)}
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={permissions[stage.ID]?.Visualizar || false}
                        onChange={(e) => handlePermissionChange(stage.ID, 'Visualizar', e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button variant="primary" type="submit">
              Asignar Permisos
            </Button>
          </Form>
        </>
      ) : (
        <p>No tienes permiso para ver esta página.</p>
      )}
    </div>
  );
};

export default StagePermissions;
