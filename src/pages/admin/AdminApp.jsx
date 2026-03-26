import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './styles/admin.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import QuestionsPage from './pages/QuestionsPage';
import RecursosPage from './pages/RecursosPage';
import SubtemasPage from './pages/SubtemasPage';
import MembresiasPage from './pages/MembresiasPage';
import BeneficiosPage from './pages/BeneficiosPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
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
      navigate('/admin/crear-examen', { replace: true });
    } else if (hash.startsWith('#editar-examen/')) {
      const id = hash.split('/')[1];
      navigate(`/admin/editar-examen/${id}`, { replace: true });
    }
  }, [navigate]);

  // Update activeMenu based on current path
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('usuarios')) setActiveMenu('users');
    else if (path.includes('membresias')) setActiveMenu('membresias');
    else if (path.includes('beneficios')) setActiveMenu('beneficios');
    else if (path.includes('products')) setActiveMenu('products');
    else if (path.includes('subtemas')) setActiveMenu('subtemas');
    else if (path.includes('examen')) setActiveMenu('examenes');
    else if (path.includes('preguntas')) setActiveMenu('questions');
    else if (path.includes('recursos')) setActiveMenu('recursos');
    else if (path.includes('reports')) setActiveMenu('reports');
    else if (path.includes('configuracion')) setActiveMenu('settings');
    else if (path === '/admin' || path === '/admin/') setActiveMenu('dashboard');
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
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="membresias" element={<MembresiasPage />} />
          <Route path="beneficios" element={<BeneficiosPage />} />
          <Route path="subtemas" element={<SubtemasPage />} />
          <Route path="examenes" element={<ExamenesPage />} />
          <Route path="crear-examen" element={<ExamenCreator />} />
          <Route path="editar-examen/:id" element={<ExamenCreator />} />
          <Route path="preguntas" element={<QuestionsPage />} />
          <Route path="recursos" element={<RecursosPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminApp;