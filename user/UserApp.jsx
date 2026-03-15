import { useState } from 'react';
import './styles/user.css';
import UserSidebar from './components/UserSidebar';
import UserDashboard from './pages/UserDashboard';
import MyCourses from './pages/MyCourses';
import MyProfile from './pages/MyProfile';
import { removeAuthToken } from '../admin/utils/api';

const UserApp = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Manejar logout
  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('user_role');
    window.location.href = '/';
  };

  // Renderizar página según el menú activo
  const renderPage = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <UserDashboard />;
      case 'courses':
        return <MyCourses />;
      case 'profile':
        return <MyProfile />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="user-container">
      <UserSidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        onLogout={handleLogout}
      />
      <main className="user-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default UserApp;