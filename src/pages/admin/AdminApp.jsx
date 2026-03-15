import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './styles/admin.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import QuestionsPage from './pages/QuestionsPage';
import RecursosPage from './pages/Recursospage';
import SubtemasPage from './pages/Subtemaspage';
import ExamenesPage from './pages/ExamenesPage';
import ExamenCreator from './pages/ExamenCreator';
import { getAuthToken, removeAuthToken } from './utils/api';

const AdminApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Handle legacy hash support on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#examenes') {
      navigate('/admin/examenes', { replace: true });
    } else if (hash === '#crear-examen') {
      navigate('/crear-examen', { replace: true });
    } else if (hash.startsWith('#editar-examen/')) {
      const id = hash.split('/')[1];
      navigate(`/editar-examen/${id}`, { replace: true });
    }
  }, [navigate]);

  // Update activeMenu based on current path
  useEffect(() => {
    const path = location.pathname.split('/admin/*')[1] || '';
    if (path.includes('examen')) setActiveMenu('examenes');
    else if (path.includes('users') || path.includes('usuarios')) setActiveMenu('users');
    else if (path.includes('products')) setActiveMenu('products');
    else if (path.includes('subtemas')) setActiveMenu('subtemas');
    else if (path.includes('questions') || path.includes('preguntas')) setActiveMenu('questions');
    else if (path.includes('recursos')) setActiveMenu('recursos');
    else if (path.includes('reports') || path.includes('reportes')) setActiveMenu('reports');
    else if (path.includes('settings') || path.includes('configuracion')) setActiveMenu('settings');
    else setActiveMenu('dashboard');
  }, [location.pathname]);

  // Manejar logout
  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        onLogout={handleLogout}
      />
      <main className="main-content">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="examenes" element={<ExamenesPage />} />
          <Route path="crear-examen" element={<ExamenCreator />} />
          <Route path="editar-examen/:id" element={<ExamenCreator />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="subtemas" element={<SubtemasPage />} />
          <Route path="preguntas" element={<QuestionsPage />} />
          <Route path="recursos" element={<RecursosPage />} />
          <Route path="reports" element={
            <div className="page-container">
              <div className="page-header">
                <div>
                  <h1 className="page-title">Reportes</h1>
                  <p className="page-subtitle">Genera y consulta reportes del sistema</p>
                </div>
              </div>
              <p style={{ color: 'var(--admin-gray)' }}>Sección de reportes en construcción...</p>
            </div>
          } />
          <Route path="configuracion" element={
            <div className="page-container">
              <div className="page-header">
                <div>
                  <h1 className="page-title">Configuración</h1>
                  <p className="page-subtitle">Ajusta las configuraciones del sistema</p>
                </div>
              </div>
              <p style={{ color: 'var(--admin-gray)' }}>Sección de configuración en construcción...</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default AdminApp;

