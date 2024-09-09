import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { API_SAP } from '../App';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      setError('Por favor ingresa tu usuario y contraseña');
      return;
    }

    try {
      const response = await axios.post(`${API_SAP}/users/login`, { username, password });
      if (response.data && (response.data.message === 'Contraseña incorrecta' || response.data.message === 'Usuario no encontrado')) {
        setError('Datos incorrectos');
        return;
      }
      if (response.data) {
        const { token, user } = response.data;
        login(user, token);
        navigate('/dashboard');
      } else {
        setError('Authentication failed');
      }
    } catch (error) {
      console.error(error);
      setError('Ocurrió un error al iniciar sesión');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div className="login-form p-4 rounded">
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicUsuario">
            <Form.Label>Usuario</Form.Label>
            <Form.Control type="usuario" placeholder="Ingresa tu usuario" value={username} onChange={e => setUsername(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" placeholder="Ingresa tu contraseña" value={password} onChange={e => setPassword(e.target.value)} />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Iniciar Sesión
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default Login;
