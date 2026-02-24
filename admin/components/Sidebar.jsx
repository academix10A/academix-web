import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      id: 'users', 
      name: 'Usuarios', 
      icon: Users 
    },
    { 
      id: 'products', 
      name: 'Productos', 
      icon: Package 
    },
    { 
      id: 'reports', 
      name: 'Reportes', 
      icon: FileText 
    },
    { 
      id: 'settings', 
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
              onClick={() => setActiveMenu(item.id)}
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
      </div>
    </aside>
  );
};

export default Sidebar;