import { useState } from 'react';
import './styles/admin.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import QuestionsPage from './pages/QuestionsPage';
import Login from './pages/Login';
import { getAuthToken, setAuthToken as saveAuthToken, removeAuthToken } from './utils/api';

const AdminApp = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificar token y rol al inicializar
    const token = getAuthToken();
    const userRole = localStorage.getItem('user_role');
    
    // Solo autenticar si hay token Y es admin (rol = 1)
    if (token && userRole === '1') {
      return true;
    }
    
    // Si tiene token pero no es admin, no hacer nada aquí
    // La redirección se maneja en App.jsx principal
    if (token && userRole !== '1') {
      return false;
    }
    
    return false;
  });

  // Manejar login exitoso
  const handleLoginSuccess = (token, userRole) => {
    saveAuthToken(token);
    
    // Validar que sea admin (rol = 1)
    if (userRole === 1) {
      setIsAuthenticated(true);
    }
    // Si no es admin, App.jsx manejará la redirección
  };

  // Manejar logout
  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setActiveMenu('dashboard');
  };

  // Renderizar página según el menú activo
  const renderPage = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersPage />;
      case 'products':
        return <ProductsPage />;
      case 'questions':
        return <QuestionsPage />;
      case 'reports':
        return (
          <div className="page-container">
            <div className="page-header">
              <div>
                <h1 className="page-title">Reportes</h1>
                <p className="page-subtitle">Genera y consulta reportes del sistema</p>
              </div>
            </div>
            <p style={{ color: 'var(--admin-gray)' }}>Sección de reportes en construcción...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="page-container">
            <div className="page-header">
              <div>
                <h1 className="page-title">Configuración</h1>
                <p className="page-subtitle">Ajusta las configuraciones del sistema</p>
              </div>
            </div>
            <p style={{ color: 'var(--admin-gray)' }}>Sección de configuración en construcción...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Mostrar admin si está autenticado
  return (
    <div className="admin-container">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminApp;