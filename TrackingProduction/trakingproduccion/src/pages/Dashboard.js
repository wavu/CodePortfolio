import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verifica si existen datos de usuario en localStorage al cargar la página
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="container">
      <h1>Panel de control</h1>
      {user ? (
        <p>Bienvenido, {user.NombreUsuario} !</p>
      ) : (
        <p>Inicia sesión para acceder al panel de control.</p>
      )}
      
      <p>¡Bienvenido al panel de control de SowaOne! Esta es la página donde puedes mostrar información relevante y herramientas para que los usuarios administren sus datos y realicen acciones específicas.</p>
    </div>
  );
};

export default Dashboard;
