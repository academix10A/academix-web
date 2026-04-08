import { useState, useEffect } from 'react';
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
  Layers,
  CreditCard,
  Star,
  User,
  Mail,
  Lock,
  UserCheck
} from 'lucide-react';
import { usuariosService } from "../../../services/api";

const Sidebar = ({ activeMenu, setActiveMenu, onLogout }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileFormData, setProfileFormData] = useState({
    correo: '',
    password_actual: '',
    password_nueva: '',
    confirmar_password: ''
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

      const response = await usuariosService.getById(userId)

      if (response) {
        setCurrentUser(response);
        setProfileFormData(prev => ({ ...prev, correo: response.correo }));
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
    try {
      // Validaciones previas
      const cambiarPassword = profileFormData.password_nueva && profileFormData.password_actual;
      
      if (cambiarPassword) {
        if (profileFormData.password_nueva !== profileFormData.confirmar_password) {
          setErrorMessage('Las contraseñas nuevas no coinciden');
          setShowErrorModal(true);
          return;
        }

        if (profileFormData.password_nueva.length < 8) {
          setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres');
          setShowErrorModal(true);
          return;
        }
      }

      // 1. Actualizar correo si cambió
      if (profileFormData.correo !== currentUser.correo) {
        const updateData = {
          nombre: currentUser.nombre,
          apellido_paterno: currentUser.apellido_paterno,
          apellido_materno: currentUser.apellido_materno,
          correo: profileFormData.correo,
          id_rol: currentUser.id_rol,
          id_estado: currentUser.id_estado
        };

        const responseCorreo = await usuariosService.putUserEmail(currentUser.id_usuario, updateData)

        if (!responseCorreo.ok) {
          const errorData = await responseCorreo.json();
          throw new Error(errorData.detail || 'Error al actualizar correo');
        }
      }

      // 2. Cambiar contraseña si se proporcionó
      if (cambiarPassword) {
        const responsePassword = await usuariosService.patchUserPassword(currentUser.id_usuario, profileFormData.password_actual, profileFormData.password_nueva)

        if (!responsePassword.ok) {
          const errorData = await responsePassword.json();
          throw new Error(errorData.detail || 'Error al cambiar contraseña');
        }
      }

      // Éxito
      setShowProfileModal(false);
      setShowSuccessModal(true);
      setProfileFormData({
        correo: profileFormData.correo,
        password_actual: '',
        password_nueva: '',
        confirmar_password: ''
      });
      fetchCurrentUser();

    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'Error al actualizar perfil');
      setShowErrorModal(true);
    }
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard,
      path: '/admin'
    },
    { 
      id: 'users', 
      name: 'Usuarios', 
      icon: Users,
      path: '/admin/usuarios'
    },
    { 
      id: 'membresias', 
      name: 'Tipos de Membresía', 
      icon: CreditCard,
      path: '/admin/membresias'
    },
    { 
      id: 'usuario_membresias', 
      name: 'Membresías Activas', 
      icon: UserCheck,
      path: '/admin/usuario-membresias'
    },
    { 
      id: 'beneficios', 
      name: 'Beneficios', 
      icon: Star,
      path: '/admin/beneficios'
    },
    { 
      id: 'subtemas', 
      name: 'Subtemas', 
      icon: Layers,
      path: '/admin/subtemas'
    },
    { 
      id: 'examenes', 
      name: 'Exámenes', 
      icon: ClipboardList,
      path: '/admin/examenes'
    },
    { 
      id: 'questions', 
      name: 'Preguntas', 
      icon: FileText,
      path: '/admin/preguntas'
    },
    { 
      id: 'recursos', 
      name: 'Recursos', 
      icon: BookOpen,
      path: '/admin/recursos'
    },
    { 
      id: 'reports', 
      name: 'Reportes', 
      icon: FileText,
      path: '/admin/reports'
    },
    { 
      id: 'settings', 
      name: 'Configuración', 
      icon: Settings,
      path: '/admin/configuracion'
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
                <label>Contraseña Actual *</label>
                <input
                  type="password"
                  className="form-input"
                  value={profileFormData.password_actual}
                  onChange={(e) => setProfileFormData({...profileFormData, password_actual: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña *</label>
                <input
                  type="password"
                  className="form-input"
                  value={profileFormData.password_nueva}
                  onChange={(e) => setProfileFormData({...profileFormData, password_nueva: e.target.value})}
                  placeholder="••••••••"
                />
                <small style={{ color: 'var(--admin-gray)', fontSize: '0.875rem' }}>
                  Mínimo 8 caracteres
                </small>
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  className="form-input"
                  value={profileFormData.confirmar_password}
                  onChange={(e) => setProfileFormData({...profileFormData, confirmar_password: e.target.value})}
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

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '450px', textAlign: 'center' }}
          >
            <div style={{ padding: '3rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--admin-success), #10b981)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                marginBottom: '1.5rem'
              }}>
                ✓
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--admin-text)' }}>
                ¡Perfil Actualizado!
              </h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--admin-gray)', marginBottom: '2rem' }}>
                Tus cambios se han guardado correctamente
              </p>
              <button 
                className="btn-primary"
                onClick={() => setShowSuccessModal(false)}
                style={{ minWidth: '150px' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error */}
      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '450px', textAlign: 'center' }}
          >
            <div style={{ padding: '3rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--admin-error), #dc2626)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                marginBottom: '1.5rem',
                color: 'white'
              }}>
                ✕
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--admin-text)' }}>
                Error
              </h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--admin-gray)', marginBottom: '2rem' }}>
                {errorMessage}
              </p>
              <button 
                className="btn-delete"
                onClick={() => setShowErrorModal(false)}
                style={{ minWidth: '150px' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;