import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookOpen,
  ClipboardList,
  Layers
} from 'lucide-react';

const Sidebar = ({ activeMenu, setActiveMenu, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();

  const menuItems = [
    { 
      id: 'dashboard', 
      path: '/admin',
      name: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      id: 'users', 
      path: '/admin/usuarios',
      name: 'Usuarios', 
      icon: Users 
    },
    { 
      id: 'products', 
      path: '/admin/products',
      name: 'Productos', 
      icon: Package 
    },
    { 
      id: 'subtemas', 
      path: '/admin/subtemas',
      name: 'Subtemas', 
      icon: Layers 
    },
    { 
      id: 'examenes', 
      path: '/admin/examenes',
      name: 'Exámenes', 
      icon: ClipboardList
    },
    { 
      id: 'questions', 
      path: '/admin/preguntas',
      name: 'Preguntas', 
      icon: FileText 
    },
    { 
      id: 'recursos', 
      path: '/admin/recursos',
      name: 'Recursos', 
      icon: BookOpen 
    },
    { 
      id: 'reports', 
      path: '/admin/reports',
      name: 'Reportes', 
      icon: FileText 
    },
    { 
      id: 'settings', 
      path: '/admin/configuracion',
      name: 'Configuración', 
      icon: Settings 
    }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-logo">
            <div className="logo-icon">
              <LayoutDashboard size={24} />
            </div>
            <div className="logo-text">
              <h2>Academix</h2>
              <span>Admin Panel</span>
            </div>
          </div>
        )}
        <button 
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setActiveMenu(item.id);
              }}
              className={`menu-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">AD</div>
          {!isCollapsed && (
            <div className="user-info">
              <p className="user-name">Admin</p>
              <p className="user-role">Administrador</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button 
            className="logout-btn"
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

export default Sidebar;