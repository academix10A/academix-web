import { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  User,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

const UserSidebar = ({ activeMenu, setActiveMenu, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Inicio', 
      icon: Home 
    },
    { 
      id: 'courses', 
      name: 'Mis Cursos', 
      icon: BookOpen 
    },
    { 
      id: 'profile', 
      name: 'Mi Perfil', 
      icon: User 
    }
  ];

  return (
    <aside className={`user-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="user-sidebar-header">
        {!isCollapsed && (
          <div className="user-sidebar-logo">
            <div className="user-logo-icon">
              <BookOpen size={24} />
            </div>
            <div className="user-logo-text">
              <h2>Academix</h2>
              <span>Estudiante</span>
            </div>
          </div>
        )}
        <button 
          className="user-sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="user-sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`user-menu-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="user-sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">US</div>
          {!isCollapsed && (
            <div className="user-info">
              <p className="user-name">Usuario</p>
              <p className="user-role">Estudiante</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button 
            className="user-logout-btn"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default UserSidebar;