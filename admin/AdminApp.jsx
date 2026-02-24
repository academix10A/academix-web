import { useState } from 'react';
import './styles/admin.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';

const AdminApp = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Renderizar página según el menú activo
  const renderPage = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersPage />;
      case 'products':
        return <ProductsPage />;
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

  return (
    <div className="admin-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminApp;