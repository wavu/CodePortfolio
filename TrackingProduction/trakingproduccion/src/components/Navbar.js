import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus, faHome, faTachometerAlt, faSignInAlt, faSignOutAlt,
  faUserCog, faBars, faTimes,faCogs,faListAlt, faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { AuthContext } from './AuthContext';

const Sidebar = () => {
  const [isHidden, setIsHidden] = useState(true);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleToggleMenu = () => {
    setIsHidden(!isHidden);
    const app = document.querySelector('.App');
    if (isHidden) {
      app.classList.add('open');
    } else {
      app.classList.remove('open');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <div className="toggle-menu-btn" onClick={handleToggleMenu}>
        <FontAwesomeIcon icon={isHidden ? faBars : faTimes} title={isHidden ? 'Mostrar menú' : 'Ocultar menú'} />
      </div>
      <div className={`sidebar ${isHidden ? 'collapsed' : 'open'}`}>
        <Navbar className="sidebar-menu">
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" title="Home">
              <FontAwesomeIcon icon={faHome} />
              {!isHidden && " Home"}
            </Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard" title="Dashboard">
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  {!isHidden && " Dashboard"}
                </Nav.Link>
                <Nav.Link as={Link} to="/UserManagement" title="Crear, Editar, Eliminar Usuarios">
                  <FontAwesomeIcon icon={faUserPlus} />
                  {!isHidden && " Crear, Editar, Eliminar Usuarios"}
                </Nav.Link>
                <Nav.Link as={Link} to="/assignroles" title="Asignar Roles y Permisos">
                  <FontAwesomeIcon icon={faUserCog} />
                  {!isHidden && " Asignar Roles y Permisos"}
                </Nav.Link>
                <Nav.Link as={Link} to="/stages" title="Configurar Stages">
                  <FontAwesomeIcon icon={faCogs} />
                  {!isHidden && " Configurar Stages"}
                </Nav.Link>
                <Nav.Link as={Link} to="/stagepermissions" title="Permisos Stages">
                  <FontAwesomeIcon icon={faListAlt} />
                  {!isHidden && " Permisos Stages"}
                </Nav.Link>
                <Nav.Link as={Link} to="/ordenesautorizadas" title="Ordenes Fabricacion">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  {!isHidden && " Ordenes Fabricacion"}
                </Nav.Link>
                <Nav.Link onClick={handleLogout} title="Cerrar sesión">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  {!isHidden && " Cerrar Sesión"}
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/login" title="Login">
                <FontAwesomeIcon icon={faSignInAlt} title="Login" />
                {!isHidden && " Login"}
              </Nav.Link>
            )}
          </Nav>
        </Navbar>
        <div className={`sidebar-footer ${isHidden ? 'hidden' : ''}`}>
          <span className="text-muted">© 2024 SowaTech. Todos los derechos reservados.</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
