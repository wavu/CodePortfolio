import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Alert, ListGroup, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faSearch, faUserPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { API_SAP } from '../App';
import { AuthContext } from '../components/AuthContext';

const UserManagement = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState({
    id: null,
    NombreRol: '',
    DescripcionRol: ''
  });
  const [user, setUser] = useState({
    nombreUsuario: '',
    nombreCompleto: '',
    contraseña: '',
    correoElectronico: '',
    idRol: ''
  });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchRoles();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      const hasPermission = checkPermission(userData.permissions, ['U01', 'U03']);
      setHasPermission(hasPermission);
      if (!hasPermission) {
        navigate('/dashboard');
      }
    }
  }, [navigate, setUser]);

  const checkPermission = (permissions, requiredPermissions) => {
    return permissions && requiredPermissions.some(permission => permissions.includes(permission));
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

  const handleRoleSelect = async (selectedRole) => {
    setRole(selectedRole);
    setSelectedRole(selectedRole);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'contraseña') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(value)) {
        setPasswordError('La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número, un carácter especial y al menos 8 caracteres');
      } else {
        setPasswordError('');
      }
    }

    if (name === 'correoElectronico') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setEmailError('El correo electrónico debe tener un formato válido');
      } else {
        setEmailError('');
      }
    }

    setUser({
      ...user,
      [name]: value
    });
  };

  const handleSearch = async () => {
    if (!user.nombreUsuario || user.nombreUsuario.trim() === '') {
      setError('Por favor ingresa un nombre de usuario para buscar');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    if (!selectedUser || user.nombreUsuario !== selectedUser.nombreUsuario) {
      setError('Solo puedes buscar información de tu propio usuario');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    try {
      const response = await fetch(`${API_SAP}/users/search?username=${user.nombreUsuario}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsers(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      setError('Ocurrió un error al buscar los usuarios');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const handleUserClick = (selectedUser) => {
    setSelectedUser(selectedUser);
    setSelectedUserId(selectedUser.ID);
    setIsModalOpen(false);
    setUser({
      nombreUsuario: selectedUser.NombreUsuario || '',
      nombreCompleto: selectedUser.NombreCompleto || '',
      contraseña: '',
      correoElectronico: selectedUser.CorreoElectronico || '',
      idRol: selectedUser.ID_Rol || ''
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      await fetch(`${API_SAP}/users/${selectedUser.NombreUsuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });
      setSuccessMessage('Usuario actualizado exitosamente');
      localStorage.setItem('user', JSON.stringify(user));
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error(error);
      setError('Ocurrió un error al modificar el usuario');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API_SAP}/users/${selectedUser.NombreUsuario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setError('Usuario eliminado');
      setSelectedUser(null);
      setUser({
        nombreUsuario: '',
        nombreCompleto: '',
        contraseña: '',
        correoElectronico: '',
        idRol: ''
      });
      setTimeout(() => {
        setError('');
      }, 3000);
    } catch (error) {
      console.error(error);
      setError('Ocurrió un error al eliminar el usuario');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const handleCreateUser = async () => {
    try {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(user.contraseña)) {
        setPasswordError('La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número, un carácter especial y al menos 8 caracteres');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.correoElectronico)) {
        setEmailError('El correo electrónico debe tener un formato válido');
        return;
      }

      const response = await fetch(`${API_SAP}/users/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setSuccessMessage('Usuario creado exitosamente');
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      setUser({
        nombreUsuario: '',
        nombreCompleto: '',
        contraseña: '',
        correoElectronico: '',
        idRol: ''
      });
      setError('');
      setTimeout(() => {
        setError('');
      }, 3000);
    } catch (error) {
      console.error('Error al crear usuario', error);
      setError('Ocurrió un error al crear el usuario');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const updateUserField = (field, value) => {
    setUser({
      ...user,
      [field]: value
    });
  };

  return (
    <div className="container">
      <>
        <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Resultados de la búsqueda</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup>
              {users.map((user, index) => (
                <ListGroup.Item key={index} action onClick={() => handleUserClick(user)}>
                  {user.NombreUsuario}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Modal.Body>
        </Modal>
        <h1>Gestión de Usuarios</h1>
        <Form onSubmit={handleUpdate}>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          <Form.Group controlId="nombreUsuario">
            <Form.Label>Nombre de Usuario</Form.Label>
            <Form.Control
              type="text"
              name="nombreUsuario"
              value={user.nombreUsuario || ''}
              onChange={(e) => updateUserField('nombreUsuario', e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="nombreCompleto">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              name="nombreCompleto"
              value={user.nombreCompleto || ''}
              onChange={(e) => updateUserField('nombreCompleto', e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="contraseña">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="contraseña"
              value={user.contraseña || ''}
              onChange={(e) => updateUserField('contraseña', e.target.value)}
            />
            {passwordError && <Alert variant="danger">{passwordError}</Alert>}
            <Form.Text>Ejemplo: Abcdef1$</Form.Text>
          </Form.Group>
          <Form.Group controlId="correoElectronico">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              name="correoElectronico"
              value={user.correoElectronico || ''}
              onChange={(e) => updateUserField('correoElectronico', e.target.value)}
            />
            {emailError && <Alert variant="danger">{emailError}</Alert>}
            <Form.Text>Ejemplo: usuario@example.com</Form.Text>
          </Form.Group>
          <Form.Group controlId="idRol">
            <Form.Label>Rol</Form.Label>
            <Form.Control
              as="select"
              name="idRol"
              value={user.idRol || ''}
              onChange={(e) => updateUserField('idRol', e.target.value)}
              disabled={user.permissions && user.permissions.includes('U03')}
            >
              <option value="">Seleccionar Rol</option>
              {roles.map((roleItem, index) => (
                <option key={index} value={roleItem.ID}>
                  {roleItem.NombreRol} - {roleItem.DescripcionRol}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button variant="primary" onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />Buscar
          </Button>
          <Button variant="success" onClick={handleCreateUser}>
            <FontAwesomeIcon icon={faUserPlus} />Crear
          </Button>
          <Button variant="primary" type="submit">
            <FontAwesomeIcon icon={faEdit} />Modificar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrash} />Eliminar
          </Button>
        </Form>
      </>
      {hasPermission ? (
        <div>
          {/* Aquí va el contenido de la página */}
        </div>
      ) : (
        <Alert variant="danger">Usuario no autorizado</Alert>
      )}
    </div>
  );
};

export default UserManagement;
