import { useState, useEffect } from 'react';
import { Plus, Search, X, Link as LinkIcon } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const RecursosPage = () => {
  const [recursos, setRecursos] = useState([]);
  const [subtemas, setSubtemas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recursoToDelete, setRecursoToDelete] = useState(null);
  const [editingRecurso, setEditingRecurso] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    url_archivo: '',
    external_id: '',
    id_tipo: 1,
    id_estado: 1,
    id_subtema: 1
  });

  useEffect(() => {
    fetchRecursos();
    fetchSubtemas();
    fetchEstados();
    fetchTipos();
  }, []);

  const fetchRecursos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/recurso/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecursos(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error al cargar recursos');
      }
    } catch (error) {
      console.error('Error al cargar recursos:', error);
      setError('Error al cargar los recursos.');
      setRecursos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtemas = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/subtemas/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubtemas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar subtemas:', error);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/estado/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEstados(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar estados:', error);
    }
  };

  const fetchTipos = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tipo/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTipos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar tipos:', error);
    }
  };

  const createRecurso = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/recurso/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchRecursos();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'No se pudo crear el recurso'}`);
      }
    } catch (error) {
      console.error('Error al crear recurso:', error);
      alert('Error al crear el recurso');
    }
  };

  const updateRecurso = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/recurso/${editingRecurso.id_recurso}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchRecursos();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'No se pudo actualizar el recurso'}`);
      }
    } catch (error) {
      console.error('Error al actualizar recurso:', error);
      alert('Error al actualizar el recurso');
    }
  };

  const deleteRecurso = async (id) => {
    setRecursoToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/recurso/${recursoToDelete}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        await fetchRecursos();
      } else {
        alert('Error al eliminar el recurso');
      }
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      alert('Error al eliminar el recurso');
    }
  };

  const openCreateModal = () => {
    setEditingRecurso(null);
    setFormData({
      titulo: '',
      descripcion: '',
      contenido: '',
      url_archivo: '',
      external_id: '',
      id_tipo: tipos.length > 0 ? tipos[0].id_tipo : 1,
      id_estado: estados.length > 0 ? estados[0].id_estado : 1,
      id_subtema: subtemas.length > 0 ? subtemas[0].id_subtema : 1
    });
    setShowModal(true);
  };

  const openEditModal = (recurso) => {
    setEditingRecurso(recurso);
    setFormData({
      titulo: recurso.titulo,
      descripcion: recurso.descripcion,
      contenido: recurso.contenido,
      url_archivo: recurso.url_archivo,
      external_id: recurso.external_id || '',
      id_tipo: recurso.id_tipo,
      id_estado: recurso.id_estado,
      id_subtema: recurso.id_subtema
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecurso(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecurso) {
      updateRecurso();
    } else {
      createRecurso();
    }
  };

  const filteredRecursos = recursos.filter(r => 
    r.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubtemaNombre = (id_subtema) => {
    const subtema = subtemas.find(s => s.id_subtema === id_subtema);
    return subtema ? subtema.nombre : `ID: ${id_subtema}`;
  };

  const getEstadoNombre = (id_estado) => {
    const estado = estados.find(e => e.id_estado === id_estado);
    return estado ? estado.nombre : `Estado ${id_estado}`;
  };

  const getTipoNombre = (id_tipo) => {
    const tipo = tipos.find(t => t.id_tipo === id_tipo);
    return tipo ? tipo.nombre : `Tipo ${id_tipo}`;
  };

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
      key: 'id_tipo', 
      header: 'Tipo',
      render: (value) => (
        <span className="badge badge-category">
          {getTipoNombre(value)}
        </span>
      )
    },
    { 
      key: 'id_subtema', 
      header: 'Subtema',
      render: (value) => (
        <span className="badge badge-category">
          {getSubtemaNombre(value)}
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
      key: 'id_estado', 
      header: 'Estado',
      render: (value) => (
        <span className={`status-badge ${value === 1 ? 'active' : 'inactive'}`}>
          {getEstadoNombre(value)}
        </span>
      )
    }
  ];

  return (
    <div className="page-container">
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

        <div className="stat-card">
          <div className="stat-icon users">🔗</div>
          <div className="stat-content">
            <p className="stat-label">Con Archivo</p>
            <p className="stat-value">
              {recursos.filter(r => r.url_archivo).length}
            </p>
          </div>
        </div>
      </div>

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

              <div className="form-group">
                <label>ID Externo</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.external_id}
                  onChange={(e) => setFormData({...formData, external_id: e.target.value})}
                  placeholder="ID externo o referencia"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    className="form-input"
                    value={formData.id_tipo}
                    onChange={(e) => setFormData({...formData, id_tipo: parseInt(e.target.value)})}
                  >
                    {tipos.map(tipo => (
                      <option key={tipo.id_tipo} value={tipo.id_tipo}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    className="form-input"
                    value={formData.id_estado}
                    onChange={(e) => setFormData({...formData, id_estado: parseInt(e.target.value)})}
                  >
                    {estados.map(estado => (
                      <option key={estado.id_estado} value={estado.id_estado}>
                        {estado.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subtema *</label>
                  <select
                    className="form-input"
                    value={formData.id_subtema}
                    onChange={(e) => setFormData({...formData, id_subtema: parseInt(e.target.value)})}
                  >
                    {subtemas.map(subtema => (
                      <option key={subtema.id_subtema} value={subtema.id_subtema}>
                        {subtema.nombre}
                      </option>
                    ))}
                  </select>
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

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Recurso?"
        message="Esta acción no se puede deshacer. El recurso será eliminado permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default RecursosPage;