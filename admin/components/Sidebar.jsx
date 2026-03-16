import { useState, useEffect } from 'react';
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
  Layers,
  CreditCard,
  Star,
  User,
  Mail,
  Lock
} from 'lucide-react';

const Sidebar = ({ activeMenu, setActiveMenu, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    correo: '',
    contrasena_actual: '',
    contrasena_nueva: '',
    confirmar_contrasena: ''
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Decodificar JWT para obtener el userId
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;

      const response = await fetch(`http://127.0.0.1:8000/api/usuarios/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        setProfileFormData(prev => ({ ...prev, correo: data.correo }));
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const getInitials = (nombre, apellidoPaterno) => {
    const firstInitial = nombre ? nombre[0].toUpperCase() : '';
    const lastInitial = apellidoPaterno ? apellidoPaterno[0].toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const updateProfile = async () => {
    if (profileFormData.contrasena_nueva && profileFormData.contrasena_nueva !== profileFormData.confirmar_contrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const updateData = {
        ...currentUser,
        correo: profileFormData.correo
      };

      if (profileFormData.contrasena_nueva) {
        updateData.contrasena = profileFormData.contrasena_nueva;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/usuarios/${currentUser.id_usuario}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert('Perfil actualizado correctamente');
        setShowProfileModal(false);
        setProfileFormData({
          correo: profileFormData.correo,
          contrasena_actual: '',
          contrasena_nueva: '',
          confirmar_contrasena: ''
        });
        fetchCurrentUser();
      } else {
        alert('Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar perfil');
    }
  };

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
      id: 'membresias', 
      name: 'Membresías', 
      icon: CreditCard 
    },
    { 
      id: 'beneficios', 
      name: 'Beneficios', 
      icon: Star 
    },
    { 
      id: 'products', 
      name: 'Productos', 
      icon: Package 
    },
    { 
      id: 'subtemas', 
      name: 'Subtemas', 
      icon: Layers 
    },
    { 
      id: 'examenes', 
      name: 'Exámenes', 
      icon: ClipboardList,
      onClick: () => window.location.hash = '#examenes'
    },
    { 
      id: 'questions', 
      name: 'Preguntas', 
      icon: FileText 
    },
    { 
      id: 'recursos', 
      name: 'Recursos', 
      icon: BookOpen 
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
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  // Limpiar hash si no es examenes
                  if (item.id !== 'examenes') {
                    window.location.hash = '';
                  }
                  setActiveMenu(item.id);
                }
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
        <div 
          className="user-profile"
          onClick={() => setShowProfileModal(true)}
          style={{ cursor: 'pointer' }}
          title="Editar perfil"
        >
          <div className="user-avatar" style={{
            background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: '700',
            color: 'white'
          }}>
            {currentUser ? getInitials(currentUser.nombre, currentUser.apellido_paterno) : 'AD'}
          </div>
          {!isCollapsed && currentUser && (
            <div className="user-info">
              <p className="user-name">
                {currentUser.nombre} {currentUser.apellido_paterno}
              </p>
              <p className="user-role">{currentUser.correo}</p>
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

      {/* Modal de Perfil */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mi Perfil</h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>
                ×
              </button>
            </div>

            <div style={{ padding: '2rem 3rem' }}>
              {/* Avatar con iniciales */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  {currentUser ? getInitials(currentUser.nombre, currentUser.apellido_paterno) : 'AD'}
                </div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                  {currentUser?.nombre} {currentUser?.apellido_paterno} {currentUser?.apellido_materno}
                </h3>
                <p style={{ color: 'var(--admin-gray)' }}>Administrador</p>
              </div>

              {/* Formulario */}
              <div className="form-group">
                <label>
                  <Mail size={18} style={{ marginRight: '0.5rem' }} />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={profileFormData.correo}
                  onChange={(e) => setProfileFormData({...profileFormData, correo: e.target.value})}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div style={{ 
                borderTop: '1px solid var(--admin-border)', 
                paddingTop: '2rem', 
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
                  <Lock size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Cambiar Contraseña
                </h4>
                <p style={{ color: 'var(--admin-gray)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                  Deja estos campos vacíos si no deseas cambiar tu contraseña
                </p>
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  className="form-input"
                  value={profileFormData.contrasena_nueva}
                  onChange={(e) => setProfileFormData({...profileFormData, contrasena_nueva: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  className="form-input"
                  value={profileFormData.confirmar_contrasena}
                  onChange={(e) => setProfileFormData({...profileFormData, confirmar_contrasena: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowProfileModal(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={updateProfile}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;