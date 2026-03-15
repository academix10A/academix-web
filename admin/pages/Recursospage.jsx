import { useState, useEffect } from 'react';
import { Plus, Search, X, FileText, Link as LinkIcon } from 'lucide-react';
import { recursosAPI } from '../utils/api';

const RecursosPage = () => {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    url_archivo: '',
    id_tipo: 1,
    id_estado: 1,
    id_subtema: 1
  });

  // Cargar recursos al montar el componente
  useEffect(() => {
    fetchRecursos();
  }, []);

  // Obtener todos los recursos
  const fetchRecursos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recursosAPI.getAll();
      setRecursos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar recursos:', error);
      setError('Error al cargar los recursos. Verifica que la API esté funcionando.');
      setRecursos([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo recurso
  const createRecurso = async () => {
    try {
      await recursosAPI.create(formData);
      await fetchRecursos();
      closeModal();
    } catch (error) {
      console.error('Error al crear recurso:', error);
      alert('Error al crear el recurso. Por favor intenta de nuevo.');
    }
  };

  // Actualizar recurso existente
  const updateRecurso = async () => {
    try {
      await recursosAPI.update(editingRecurso.id_recurso, formData);
      await fetchRecursos();
      closeModal();
    } catch (error) {
      console.error('Error al actualizar recurso:', error);
      alert('Error al actualizar el recurso. Por favor intenta de nuevo.');
    }
  };

  // Eliminar recurso
  const deleteRecurso = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este recurso?')) return;

    try {
      await recursosAPI.delete(id);
      await fetchRecursos();
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      alert('Error al eliminar el recurso. Por favor intenta de nuevo.');
    }
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingRecurso(null);
    setFormData({
      titulo: '',
      descripcion: '',
      contenido: '',
      url_archivo: '',
      id_tipo: 1,
      id_estado: 1,
      id_subtema: 1
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const openEditModal = (recurso) => {
    setEditingRecurso(recurso);
    setFormData({
      titulo: recurso.titulo,
      descripcion: recurso.descripcion,
      contenido: recurso.contenido,
      url_archivo: recurso.url_archivo,
      id_tipo: recurso.id_tipo,
      id_estado: recurso.id_estado,
      id_subtema: recurso.id_subtema
    });
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingRecurso(null);
    setFormData({
      titulo: '',
      descripcion: '',
      contenido: '',
      url_archivo: '',
      id_tipo: 1,
      id_estado: 1,
      id_subtema: 1
    });
  };

  // Manejar submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecurso) {
      updateRecurso();
    } else {
      createRecurso();
    }
  };

  // Filtrar recursos por búsqueda
  const filteredRecursos = recursos.filter(r => 
    r.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Definir columnas de la tabla
  const columns = [
    { 
      key: 'id_recurso', 
      header: 'ID' 
    },
    { 
      key: 'titulo', 
      header: 'Título',
      render: (value) => (
        <span style={{ fontWeight: '600' }}>{value}</span>
      )
    },
    { 
      key: 'descripcion', 
      header: 'Descripción',
      render: (value) => (
        <span className="truncate-text" title={value}>
          {value?.substring(0, 60)}{value?.length > 60 ? '...' : ''}
        </span>
      )
    },
    { 
      key: 'url_archivo', 
      header: 'Archivo',
      render: (value) => value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <LinkIcon size={16} /> Ver
        </a>
      ) : (
        <span style={{ color: 'var(--admin-gray)' }}>Sin archivo</span>
      )
    },
    { 
      key: 'id_tipo', 
      header: 'Tipo',
      render: (value) => (
        <span className="badge badge-category">{value}</span>
      )
    },
    { 
      key: 'id_estado', 
      header: 'Estado',
      render: (value) => (
        <span className={`status-badge ${value === 1 ? 'active' : 'inactive'}`}>
          {value === 1 ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    { 
      key: 'fecha_publicacion', 
      header: 'Fecha',
      render: (value) => new Date(value).toLocaleDateString('es-MX')
    }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Recursos Educativos</h1>
          <p className="page-subtitle">Gestiona los recursos y materiales del sistema</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          <span>Nuevo Recurso</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">📚</div>
          <div className="stat-content">
            <p className="stat-label">Total Recursos</p>
            <p className="stat-value">{recursos.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stock">✅</div>
          <div className="stat-content">
            <p className="stat-label">Activos</p>
            <p className="stat-value">
              {recursos.filter(r => r.id_estado === 1).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar por título o descripción..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container">
          <p>Cargando recursos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p style={{ color: 'var(--admin-error)' }}>{error}</p>
          <button className="btn-primary" onClick={fetchRecursos} style={{ marginTop: '1rem' }}>
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
                <th className="actions-column">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecursos.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="no-data">
                    No hay recursos disponibles
                  </td>
                </tr>
              ) : (
                filteredRecursos.map((recurso, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>
                        {column.render 
                          ? column.render(recurso[column.key], recurso) 
                          : recurso[column.key]}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          title="Editar"
                          onClick={() => openEditModal(recurso)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete"
                          title="Eliminar"
                          onClick={() => deleteRecurso(recurso.id_recurso)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecurso ? 'Editar Recurso' : 'Nuevo Recurso'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                  placeholder="Título del recurso"
                />
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  required
                  placeholder="Descripción breve del recurso"
                />
              </div>

              <div className="form-group">
                <label>Contenido</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  placeholder="Contenido detallado del recurso"
                />
              </div>

              <div className="form-group">
                <label>URL del Archivo</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.url_archivo}
                  onChange={(e) => setFormData({...formData, url_archivo: e.target.value})}
                  placeholder="https://ejemplo.com/archivo.pdf"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ID Tipo *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.id_tipo}
                    onChange={(e) => setFormData({...formData, id_tipo: parseInt(e.target.value) || 1})}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ID Estado *</label>
                  <select
                    className="form-input"
                    value={formData.id_estado}
                    onChange={(e) => setFormData({...formData, id_estado: parseInt(e.target.value)})}
                  >
                    <option value={1}>Activo</option>
                    <option value={2}>Inactivo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>ID Subtema *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.id_subtema}
                    onChange={(e) => setFormData({...formData, id_subtema: parseInt(e.target.value) || 1})}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingRecurso ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecursosPage;