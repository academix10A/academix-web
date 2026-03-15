import { useState, useEffect } from 'react';
import './styles/admin.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import QuestionsPage from './pages/QuestionsPage';
import RecursosPage from './pages/RecursosPage';
import SubtemasPage from './pages/Subtemaspage';
import ExamenesPage from './pages/ExamenesPage';
import ExamenCreator from './pages/ExamenCreator';
import Login from './pages/Login';
import { getAuthToken, setAuthToken as saveAuthToken, removeAuthToken } from './utils/api';

const AdminApp = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [currentHash, setCurrentHash] = useState(window.location.hash);
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

  // Escuchar cambios en el hash
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      
      // Si estamos en #examenes, activar el menú de examenes
      if (window.location.hash === '#examenes' || 
          window.location.hash === '#crear-examen' ||
          window.location.hash.startsWith('#editar-examen/')) {
        setActiveMenu('examenes');
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Ejecutar al cargar
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  // Renderizar página según el menú activo o hash
  const renderPage = () => {
    // Verificar si estamos en rutas de exámenes
    if (currentHash === '#crear-examen' || currentHash.startsWith('#editar-examen/')) {
      return <ExamenCreator />;
    }
    
    if (currentHash === '#examenes') {
      return <ExamenesPage />;
    }

    // Rutas normales del menú
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersPage />;
      case 'products':
        return <ProductsPage />;
      case 'subtemas':
        return <SubtemasPage />;
      case 'questions':
        return <QuestionsPage />;
      case 'recursos':
        return <RecursosPage />;
      case 'examenes':
        return <ExamenesPage />;
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