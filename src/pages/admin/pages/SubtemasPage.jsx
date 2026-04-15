import { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const SubtemasPage = () => {
  const [subtemas, setSubtemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [subtemaToDelete, setSubtemaToDelete] = useState(null);
  const [editingSubtema, setEditingSubtema] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    nivel_dificultad: 'Básico'
  });

  useEffect(() => {
    fetchSubtemas();
  }, []);

  const fetchSubtemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/subtemas/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubtemas(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error al cargar subtemas');
      }
    } catch (error) {
      console.error('Error al cargar subtemas:', error);
      setError('Error al cargar los subtemas.');
      setSubtemas([]);
    } finally {
      setLoading(false);
    }
  };

  const createSubtema = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/subtemas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSubtemas();
        closeModal();
      } else {
        alert('Error al crear el subtema');
      }
    } catch (error) {
      console.error('Error al crear subtema:', error);
      alert('Error al crear el subtema');
    }
  };

  const updateSubtema = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/subtemas/${editingSubtema.id_subtema}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSubtemas();
        closeModal();
      } else {
        alert('Error al actualizar el subtema');
      }
    } catch (error) {
      console.error('Error al actualizar subtema:', error);
      alert('Error al actualizar el subtema');
    }
  };

  const deleteSubtema = async (id) => {
    setSubtemaToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/subtemas/${subtemaToDelete}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        await fetchSubtemas();
      } else {
        alert('Error al eliminar el subtema');
      }
    } catch (error) {
      console.error('Error al eliminar subtema:', error);
      alert('Error al eliminar el subtema');
    }
  };

  const openCreateModal = () => {
    setEditingSubtema(null);
    setFormData({
      nombre: '',
      descripcion: '',
      nivel_dificultad: 'Básico'
    });
    setShowModal(true);
  };

  const openEditModal = (subtema) => {
    setEditingSubtema(subtema);
    setFormData({
      nombre: subtema.nombre,
      descripcion: subtema.descripcion,
      nivel_dificultad: subtema.nivel_dificultad
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubtema(null);
    setFormData({
      nombre: '',
      descripcion: '',
      nivel_dificultad: 'Básico'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSubtema) {
      updateSubtema();
    } else {
      createSubtema();
    }
  };

  const filteredSubtemas = subtemas.filter(s => {
    const matchSearch = s.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       s.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchNivel = filtroNivel === 'Todos' || 
                      s.nivel_dificultad?.toLowerCase().trim() === filtroNivel.toLowerCase() ||
                      (filtroNivel.toLowerCase() === 'básico' && s.nivel_dificultad?.toLowerCase().trim() === 'basico');
    
    return matchSearch && matchNivel;
  });

  const columns = [
    { 
      key: 'id_subtema', 
      header: 'ID' 
    },
    { 
      key: 'nombre', 
      header: 'Nombre',
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
      key: 'nivel_dificultad', 
      header: 'Dificultad',
      render: (value) => {
        const nivel = value?.toLowerCase().trim();
        const colorMap = {
          'básico': 'var(--admin-success)',
          'basico': 'var(--admin-success)',
          'intermedio': 'var(--admin-warning)',
          'avanzado': 'var(--admin-error)'
        };
        return (
          <span 
            className="badge badge-category" 
            style={{ 
              backgroundColor: `${colorMap[nivel] || 'var(--admin-gray)'}20`,
              color: colorMap[nivel] || 'var(--admin-gray)',
              border: `1px solid ${colorMap[nivel] || 'var(--admin-gray)'}`
            }}
          >
            {value}
          </span>
        );
      }
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subtemas</h1>
          <p className="page-subtitle">Gestiona los subtemas del sistema</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          <span>Nuevo Subtema</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">📚</div>
          <div className="stat-content">
            <p className="stat-label">Total Subtemas</p>
            <p className="stat-value">{subtemas.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stock">🟢</div>
          <div className="stat-content">
            <p className="stat-label">Básicos</p>
            <p className="stat-value">
              {subtemas.filter(s => 
                s.nivel_dificultad?.toLowerCase().trim() === 'básico' ||
                s.nivel_dificultad?.toLowerCase().trim() === 'basico'
              ).length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock">🟡</div>
          <div className="stat-content">
            <p className="stat-label">Intermedios</p>
            <p className="stat-value">
              {subtemas.filter(s => 
                s.nivel_dificultad?.toLowerCase().trim() === 'intermedio'
              ).length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock">🔴</div>
          <div className="stat-content">
            <p className="stat-label">Avanzados</p>
            <p className="stat-value">
              {subtemas.filter(s => 
                s.nivel_dificultad?.toLowerCase().trim() === 'avanzado'
              ).length}
            </p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o descripción..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="filter-select"
          value={filtroNivel}
          onChange={(e) => setFiltroNivel(e.target.value)}
        >
          <option value="Todos">Todas las dificultades</option>
          <option value="Básico">Básico</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando subtemas...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p style={{ color: 'var(--admin-error)' }}>{error}</p>
          <button className="btn-primary" onClick={fetchSubtemas} style={{ marginTop: '1rem' }}>
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
              {filteredSubtemas.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="no-data">
                    No hay subtemas disponibles
                  </td>
                </tr>
              ) : (
                filteredSubtemas.map((subtema, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>
                        {column.render 
                          ? column.render(subtema[column.key], subtema) 
                          : subtema[column.key]}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          title="Editar"
                          onClick={() => openEditModal(subtema)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete"
                          title="Eliminar"
                          onClick={() => deleteSubtema(subtema.id_subtema)}
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
              <h2>{editingSubtema ? 'Editar Subtema' : 'Nuevo Subtema'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Nombre del subtema"
                />
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  required
                  placeholder="Descripción del subtema"
                />
              </div>

              <div className="form-group">
                <label>Nivel de Dificultad *</label>
                <select
                  className="form-input"
                  value={formData.nivel_dificultad}
                  onChange={(e) => setFormData({...formData, nivel_dificultad: e.target.value})}
                >
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingSubtema ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Subtema?"
        message="Esta acción eliminará el subtema y puede afectar los recursos asociados."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default SubtemasPage;