import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { estadoService, rolService, usuariosService } from '../../../services/api';

const UsersPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, usuario: null });

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
    fetchEstados();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usuariosService.getAll()
      if (response) {
        setUsuarios(Array.isArray(response) ? response : []);
      } else {
        throw new Error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios.');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolService.getAll()
      
      if (response) {
        setRoles(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await estadoService.getAll()
      
      if (response) {
        setEstados(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error al cargar estados:', error);
    }
  };

  const openConfirmModal = (usuario) => {
    setConfirmModal({ show: true, usuario });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ show: false, usuario: null });
  };

  const toggleEstado = async () => {
    const usuario = confirmModal.usuario;
    const nuevoEstado = usuario.id_estado === 1 ? 2 : 1;

    try {
      const response = await usuariosService.putUser(usuario.id_usuario, {...usuario,id_estado: nuevoEstado})

      if (response) {
        await fetchUsuarios();
        closeConfirmModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'No se pudo cambiar el estado'}`);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = 
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido_paterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido_materno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRol = filtroRol === 'Todos' || u.id_rol === parseInt(filtroRol);
    
    return matchSearch && matchRol;
  });

  const getRolNombre = (id_rol) => {
    const rol = roles.find(r => r.id_rol === id_rol);
    return rol ? rol.nombre : `Rol ${id_rol}`;
  };

  const getEstadoNombre = (id_estado) => {
    const estado = estados.find(e => e.id_estado === id_estado);
    return estado ? estado.nombre : `Estado ${id_estado}`;
  };

  const columns = [
    { 
      key: 'id_usuario', 
      header: 'ID' 
    },
    { 
      key: 'nombre', 
      header: 'Nombre Completo',
      render: (value, row) => (
        <span style={{ fontWeight: '600' }}>
          {`${row.nombre} ${row.apellido_paterno} ${row.apellido_materno}`}
        </span>
      )
    },
    { 
      key: 'correo', 
      header: 'Correo',
      render: (value) => (
        <span style={{ color: 'var(--admin-primary)' }}>{value}</span>
      )
    },
    { 
      key: 'id_rol', 
      header: 'Rol',
      render: (value) => (
        <span className="badge badge-category">
          {getRolNombre(value)}
        </span>
      )
    },
    { 
      key: 'id_estado', 
      header: 'Estado',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className={`status-badge ${value === 1 ? 'active' : 'inactive'}`}>
            {getEstadoNombre(value)}
          </span>
          <button 
            className={`action-btn ${value === 1 ? 'delete' : 'edit'}`}
            title={value === 1 ? 'Desactivar usuario' : 'Activar usuario'}
            onClick={() => openConfirmModal(row)}
            style={{ fontSize: '1.25rem' }}
          >
            {value === 1 ? '🔒' : '✅'}
          </button>
        </div>
      )
    },
    { 
      key: 'fecha_registro', 
      header: 'Registro',
      render: (value) => new Date(value).toLocaleDateString('es-MX')
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestiona los usuarios del sistema</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-content">
            <p className="stat-label">Total Usuarios</p>
            <p className="stat-value">{usuarios.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stock">✅</div>
          <div className="stat-content">
            <p className="stat-label">Activos</p>
            <p className="stat-value">
              {usuarios.filter(u => u.id_estado === 1).length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">👨‍💼</div>
          <div className="stat-content">
            <p className="stat-label">Admins</p>
            <p className="stat-value">
              {usuarios.filter(u => u.id_rol === 1).length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock">👤</div>
          <div className="stat-content">
            <p className="stat-label">Usuarios Normales</p>
            <p className="stat-value">
              {usuarios.filter(u => u.id_rol === 2 || u.id_rol === 3).length}
            </p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, apellido o correo..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="filter-select"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="Todos">Todos los roles</option>
          {roles.map(rol => (
            <option key={rol.id_rol} value={rol.id_rol}>
              {rol.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p style={{ color: 'var(--admin-error)' }}>{error}</p>
          <button className="btn-primary" onClick={fetchUsuarios} style={{ marginTop: '1rem' }}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="no-data">
                    No hay usuarios disponibles
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>
                        {column.render 
                          ? column.render(usuario[column.key], usuario) 
                          : usuario[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Confirmación */}
      {confirmModal.show && confirmModal.usuario && (
        <div className="modal-overlay" onClick={closeConfirmModal}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', textAlign: 'center' }}
          >
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.75rem', width: '100%' }}>
                {confirmModal.usuario.id_estado === 1 ? '🔒 Desactivar Usuario' : '✅ Activar Usuario'}
              </h2>
            </div>

            <div style={{ padding: '2rem 3rem' }}>
              <p style={{ fontSize: '1.125rem', color: 'var(--admin-text)', marginBottom: '1rem', lineHeight: '1.6' }}>
                ¿Estás seguro de {confirmModal.usuario.id_estado === 1 ? 'desactivar' : 'activar'} a?
              </p>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: 'var(--admin-primary)', 
                marginBottom: '0.5rem' 
              }}>
                {confirmModal.usuario.nombre} {confirmModal.usuario.apellido_paterno}
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--admin-gray)' }}>
                {confirmModal.usuario.correo}
              </p>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '2rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={closeConfirmModal}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className={confirmModal.usuario.id_estado === 1 ? 'btn-delete' : 'btn-primary'}
                onClick={toggleEstado}
              >
                {confirmModal.usuario.id_estado === 1 ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;