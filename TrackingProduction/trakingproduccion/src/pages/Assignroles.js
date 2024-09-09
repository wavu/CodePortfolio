import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, ListGroup, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Assignroles.css';
import { API_SAP } from '../App'; // Importa la constante API_URL
import { AuthContext } from '../components/AuthContext'; // Importa AuthContext

const AssignRoles = () => {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState({
    id: null,
    NombreRol: '',
    DescripcionRol: ''
  });
  const [permissions, setPermissions] = useState([]);
  const [hasPermission, setHasPermission] = useState(false); // Estado para verificar si el usuario tiene permisos
  const navigate = useNavigate(); // Hook para navegación
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null); // Nuevo estado para el rol seleccionado
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Nuevo estado para el mensaje de error
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext); // Obtén el token del contexto
  const [user, setUser] = useState({
    nombreUsuario: '',
    nombreCompleto: '',
    contraseña: '',
    correoElectronico: '',
    idRol: ''
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    // Verifica si existen datos de usuario en localStorage al cargar la página
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Verifica si el usuario tiene el permiso necesario
      const hasPermission = checkPermission(userData.permissions, 'U02');
      setHasPermission(hasPermission);

      // Redirecciona a la página de Dashboard si el usuario no tiene permisos
      if (!hasPermission) {
        navigate('/dashboard');
      }
    }
  }, [navigate, setUser]);

  // Función para verificar si el usuario tiene el permiso especificado
  const checkPermission = (permissions, permission) => {
    // Verifica si hay información de usuario almacenada y si los permisos incluyen el permiso especificado
    return permissions && permissions.includes(permission);
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_SAP}/roles/listar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        setError('Error al obtener la lista de roles');
      }
    } catch (error) {
      console.error('Error al obtener la lista de roles', error);
      setError('Ocurrió un error al obtener la lista de roles');
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${API_SAP}/permisos/listar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      } else {
        setError('Error al obtener la lista de permisos');
      }
    } catch (error) {
      console.error('Error al obtener la lista de permisos', error);
      setError('Ocurrió un error al obtener la lista de permisos');
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    setRole({
      id: selectedRole.ID,
      NombreRol: selectedRole.NombreRol,
      DescripcionRol: selectedRole.DescripcionRol
    });
    setSelectedRole(selectedRole); 
    // Fetch permissions assigned to the selected role
    try {
      const response = await fetch(`${API_SAP}/roles/${selectedRole.ID}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedPermissions(data.map(permission => permission.NombrePermiso)); // Asegúrate de mapear correctamente los permisos
      } else {
        setError('Error al obtener los permisos asignados al rol');
      }
    } catch (error) {
      console.error('Error al obtener los permisos asignados al rol', error);
      setError('Ocurrió un error al obtener los permisos asignados al rol');
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRole({
      ...role,
      [name]: value
    });
  };

  const handleCreateRole = async () => {
    try {
      const response = await fetch(`${API_SAP}/roles/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreRol: role.NombreRol,
          descripcionRol: role.DescripcionRol
        })
      });
      if (response.ok) {
        setSuccessMessage('Rol creado exitosamente');
        setRole({
          id: null,
          NombreRol: '',
          DescripcionRol: ''
        });
        fetchRoles();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear el rol');
      }
    } catch (error) {
      console.error('Error al crear el rol', error);
      setError('Ocurrió un error al crear el rol');
    }
  };

  const handleUpdateRole = async () => {
    try {
      const response = await fetch(`${API_SAP}/roles/update/${role.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          NombreRol: role.NombreRol,
          DescripcionRol: role.DescripcionRol
        })
      });
      if (response.ok) {
        setSuccessMessage('Rol actualizado exitosamente');
        fetchRoles();
      } else {
        setError('Error al actualizar el rol');
      }
    } catch (error) {
      console.error('Error al actualizar el rol', error);
      setError('Ocurrió un error al actualizar el rol');
    }
  };

  const handleDeleteRole = async () => {
    try {
      const response = await fetch(`${API_SAP}/roles/${role.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setSuccessMessage('Rol eliminado exitosamente');
        setRole({
          id: null,
          NombreRol: '',
          DescripcionRol: ''
        });
        fetchRoles();
      } else {
        setError('Error al eliminar el rol');
      }
    } catch (error) {
      console.error('Error al eliminar el rol', error);
      setError('Ocurrió un error al eliminar el rol');
    }
  };

  useEffect(() => {
    localStorage.setItem('role', JSON.stringify(role));
  }, [role]);

  const handlePermissionSelect = (selectedPermission) => {
    const isSelected = selectedPermissions.includes(selectedPermission.NombrePermiso);
    let updatedPermissions = [...selectedPermissions]; // Crear una copia de la lista de permisos seleccionados
    
    if (isSelected) {
      updatedPermissions = updatedPermissions.filter(permission => permission !== selectedPermission.NombrePermiso); // Eliminar el permiso seleccionado de la lista
    } else {
      updatedPermissions.push(selectedPermission.NombrePermiso); // Agregar el permiso seleccionado a la lista
    }
    setSelectedPermissions(updatedPermissions); // Actualizar el estado con la lista modificada
  };

  const handleAssignPermissionsToRole = async () => {
    try {
      const rolePermissions = selectedPermissions.map(permission => ({ permission: permission }));
      const requestBody = { rolePermissions };

      console.log('Query enviado al servidor:', requestBody);

      const response = await fetch(`${API_SAP}/roles/${selectedRole.ID}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setSuccessMessage('Permisos asignados exitosamente al rol');
        setTimeout(() => setSuccessMessage(''), 3000);
        setSelectedRole(null);
        setSelectedPermissions([]);
      } else {
        setErrorMessage('Error al asignar permisos al rol');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error al asignar permisos al rol', error);
      setErrorMessage('Ocurrió un error al asignar permisos al rol');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <div className="container">
      <Row>
        <Col>
          <Form className="assign-roles-form-permission">
            <h2>Gestión de Roles</h2>
            <Form.Group controlId="nombreRol">
              <Form.Label>Nombre del Rol</Form.Label>
              <Form.Control
                type="text"
                name="NombreRol"
                value={role.NombreRol}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="descripcionRol">
              <Form.Label>Descripción del Rol</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="DescripcionRol"
                value={role.DescripcionRol}
                onChange={handleChange}
              />
            </Form.Group>
            <Button variant="success" onClick={handleCreateRole}>
              <FontAwesomeIcon icon={faUserPlus} /> Crear
            </Button>
            <Button variant="primary" onClick={handleUpdateRole}>
              <FontAwesomeIcon icon={faEdit} /> Modificar
            </Button>
            <Button variant="danger" onClick={handleDeleteRole}>
              <FontAwesomeIcon icon={faTrash} /> Eliminar
            </Button>
          </Form>
          <ListGroup>
            {roles.map((roleItem, index) => (
              <ListGroup.Item
                key={index}
                action
                onClick={() => handleRoleSelect(roleItem)}
                active={roleItem.ID === selectedRole?.ID}
              >
                <strong>{roleItem.NombreRol}</strong> - {roleItem.DescripcionRol}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col>
          <h2>Gestión de Permisos</h2>
          <ListGroup>
            {permissions.map((permission, index) => (
              <ListGroup.Item
                key={index}
                action
                onClick={() => handlePermissionSelect(permission)}
                active={selectedPermissions.includes(permission.NombrePermiso)}
              >
                <strong>{permission.NombrePermiso}</strong> - {permission.DescripcionPermiso}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
      <Row>
        <Button variant="success" onClick={handleAssignPermissionsToRole}>
          Asignar Permisos al Rol
        </Button>
      </Row>
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
          {errorMessage}
        </Alert>
      )}
    </div>
  );
};

export default AssignRoles;
