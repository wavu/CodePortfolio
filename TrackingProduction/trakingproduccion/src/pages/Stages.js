import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, ListGroup, Modal } from 'react-bootstrap';
import { AuthContext } from '../components/AuthContext';
import StageFlow from '../components/StageFlow';
import { API_SAP } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const Stages = () => {
  const [user, setUser] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stageAnterior, setStageAnterior] = useState('');
  const [stageSiguiente, setStageSiguiente] = useState('');
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
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
      const hasPermission = checkPermission(userData.permissions, 'S01');
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
        setTimeout(() => setError(''), 10000); // 10 segundos
      }
    } catch (error) {
      console.error('Error al obtener la lista de stages', error);
      setError('Ocurrió un error al obtener la lista de stages');
      setTimeout(() => setError(''), 10000); // 10 segundos
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newStage = {
      nombre,
      descripcion,
      stageAnterior: stageAnterior === 'inicio' ? null : stageAnterior,
      stageSiguiente: stageSiguiente === 'final' ? null : stageSiguiente,
    };

    try {
      const response = await fetch(`${API_SAP}/stages/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStage)
      });

      if (response.ok) {
        setSuccessMessage('Stage creado exitosamente');
        setNombre('');
        setDescripcion('');
        setStageAnterior('');
        setStageSiguiente('');
        setTimeout(() => {
          setSuccessMessage('');
        }, 10000); // 10 segundos
        fetchStages();
      } else {
        setError('Error al crear el stage');
        setTimeout(() => setError(''), 10000); // 10 segundos
      }
    } catch (error) {
      console.error('Error al crear el stage', error);
      setError('Ocurrió un error al crear el stage');
      setTimeout(() => setError(''), 10000); // 10 segundos
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_SAP}/stages/listar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStages(data);
        setIsModalOpen(true);
      } else {
        setError('Error al buscar los stages');
        setTimeout(() => setError(''), 10000); // 10 segundos
      }
    } catch (error) {
      console.error('Error al buscar los stages', error);
      setError('Ocurrió un error al buscar los stages');
      setTimeout(() => setError(''), 10000); // 10 segundos
    }
  };

  const handleStageClick = (selectedStage) => {
    setSelectedStage(selectedStage);
    setIsModalOpen(false);
    setNombre(selectedStage.Nombre || '');
    setDescripcion(selectedStage.Descripcion || '');
    setStageAnterior(selectedStage.StageAnterior || '');
    setStageSiguiente(selectedStage.StageSiguiente || '');
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    const updatedStage = {
      nombre,
      descripcion,
      stageAnterior: stageAnterior === 'inicio' ? null : stageAnterior,
      stageSiguiente: stageSiguiente === 'final' ? null : stageSiguiente,
    };

    try {
      const response = await fetch(`${API_SAP}/stages/actualizar/${selectedStage.ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedStage)
      });

      if (response.ok) {
        setSuccessMessage('Stage actualizado exitosamente');
        setNombre('');
        setDescripcion('');
        setStageAnterior('');
        setStageSiguiente('');
        setSelectedStage(null);
        setTimeout(() => {
          setSuccessMessage('');
        }, 10000); // 10 segundos
        fetchStages();
      } else {
        setError('Error al actualizar el stage');
        setTimeout(() => setError(''), 10000); // 10 segundos
      }
    } catch (error) {
      console.error('Error al actualizar el stage', error);
      setError('Ocurrió un error al actualizar el stage');
      setTimeout(() => setError(''), 10000); // 10 segundos
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_SAP}/stages/eliminar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccessMessage('Stage eliminado exitosamente');
        setTimeout(() => {
          setSuccessMessage('');
        }, 10000); // 10 segundos
        fetchStages();
      } else {
        setError('Error al eliminar el stage');
        setTimeout(() => setError(''), 10000); // 10 segundos
      }
    } catch (error) {
      console.error('Error al eliminar el stage', error);
      setError('Ocurrió un error al eliminar el stage');
      setTimeout(() => setError(''), 10000); // 10 segundos
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
            {stages.map((stage, index) => (
              <ListGroup.Item key={index} action onClick={() => handleStageClick(stage)} className="d-flex justify-content-between align-items-center">
                {stage.Nombre}
                <Button variant="danger" onClick={() => handleDelete(stage.ID)} className="ml-auto">
                  <FontAwesomeIcon icon={faTrash} /> Eliminar
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
      <h1>Stages</h1>
      {hasPermission ? (
        <>
          <Form onSubmit={selectedStage ? handleUpdate : handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="descripcion">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="stageAnterior">
              <Form.Label>Stage Anterior</Form.Label>
              <Form.Control
                as="select"
                value={stageAnterior}
                onChange={(e) => setStageAnterior(e.target.value)}
              >
                <option value="">Ninguno</option>
                <option value="inicio">Inicio del Proceso</option>
                {stages.map((stage) => (
                  <option key={stage.ID} value={stage.ID}>
                    {stage.Nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="stageSiguiente">
              <Form.Label>Stage Siguiente</Form.Label>
              <Form.Control
                as="select"
                value={stageSiguiente}
                onChange={(e) => setStageSiguiente(e.target.value)}
              >
                <option value="">Ninguno</option>
                <option value="final">Fin del Proceso</option>
                {stages.map((stage) => (
                  <option key={stage.ID} value={stage.ID}>
                    {stage.Nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              {selectedStage ? 'Actualizar' : 'Crear'}
            </Button>
            {selectedStage && (
              <Button variant="secondary" onClick={() => {
                setSelectedStage(null);
                setNombre('');
                setDescripcion('');
                setStageAnterior('');
                setStageSiguiente('');
              }}>
                Cancelar
              </Button>
            )}
          </Form>
          <Button variant="info" onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} /> Buscar
          </Button>
          <StageFlow stages={stages} />
        </>
      ) : (
        <p>No tienes permiso para ver esta página.</p>
      )}
    </div>
  );
};

export default Stages;
