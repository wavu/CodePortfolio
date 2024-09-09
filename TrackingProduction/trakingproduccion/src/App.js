import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import './App.css';
import { AuthContext, AuthProvider } from './components/AuthContext'; 
import UserManagement from './pages/UserManagement'; 
import Assignroles from './pages/Assignroles';
import Stages from './pages/Stages';
import StagePermissions from './pages/StagePermissions'
import OrdenesAutorizadas from './pages/OrdenesAutorizadas'

export const API_SAP = 'http://127.0.0.1:5000';


const AppContent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isValidating } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggle = () => setIsOpen(!isOpen);

  const ProtectedRoute = ({ element }) => {
    if (isValidating) {
      return <div>Loading...</div>; // Mostrar un mensaje de carga mientras se valida el token
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return element;
  };

  return (
    <div className={`App ${isOpen ? 'open' : ''}`}>
      <Navbar toggle={toggle} />
      <div className={`content ${isOpen ? 'open' : ''}`}>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/usermanagement" element={<ProtectedRoute element={<UserManagement />} />} /> 
            <Route path="/assignroles" element={<ProtectedRoute element={<Assignroles />} />} />
            <Route path="/stages" element={<ProtectedRoute element={<Stages />} />} />
            <Route path="/stagepermissions" element={<ProtectedRoute element={<StagePermissions />} />} />
            <Route path="/ordenesautorizadas" element={<ProtectedRoute element={<OrdenesAutorizadas />} />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
