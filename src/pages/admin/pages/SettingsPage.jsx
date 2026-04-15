import { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { estadoService, tipoService } from '../../../services/api';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('estados');
  const [estados, setEstados] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    fetchEstados();
    fetchTipos();
  }, []);

  const fetchEstados = async () => {
    setLoading(true);
    try {
      const response = await estadoService.getAll()
      
      if (response) {
        setEstados(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error al cargar estados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipos = async () => {
    setLoading(true);
    try {
      const response = await tipoService.getAll()
      
      if (response) {
        setTipos(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error al cargar tipos:', error);
      setError('Endpoint /api/tipo/ no disponible');
    } finally {
      setLoading(false);
    }
  };

  const createEstado = async () => {
    try {
      const response = await estadoService.getAll()

      if (response) {
        await fetchEstados();
        closeModal();
      } else {
        alert('Error al crear estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear estado');
    }
  };

  const updateEstado = async () => {
    try {
      const response = await estadoService.putEstado(editingItem.id_estado, formData)

      if (response) {
        await fetchEstados();
        closeModal();
      } else {
        alert('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    }
  };

  const deleteEstado = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este estado?')) return;

    try {
      const response = await estadoService.deleteEstado(id)

      if (response) {
        await fetchEstados();
      } else {
        alert('Error al eliminar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar estado');
    }
  };

  const createTipo = async () => {
    try {
      const response = await tipoService.postTipo(formData)

      if (response) {
        await fetchTipos();
        closeModal();
      } else {
        alert('Error al crear tipo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear tipo');
    }
  };

  const updateTipo = async () => {
    try {
      const response = await tipoService.putTipo(editingItem.id_tipo, formData)

      if (response) {
        await fetchTipos();
        closeModal();
      } else {
        alert('Error al actualizar tipo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar tipo');
    }
  };

  const deleteTipo = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este tipo?')) return;

    try {
      const response = await tipoService.deleteTipo(id)

      if (response) {
        await fetchTipos();
      } else {
        alert('Error al eliminar tipo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar tipo');
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ nombre: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ nombre: item.nombre });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'estados') {
      editingItem ? updateEstado() : createEstado();
    } else {
      editingItem ? updateTipo() : createTipo();
    }
  };

  const currentData = activeTab === 'estados' ? estados : tipos;
  const filteredData = currentData.filter(item => 
    item.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIdKey = () => activeTab === 'estados' ? 'id_estado' : 'id_tipo';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Gestiona estados y tipos del sistema</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          <span>Nuevo {activeTab === 'estados' ? 'Estado' : 'Tipo'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid var(--admin-border)'
      }}>
        <button
          onClick={() => setActiveTab('estados')}
          style={{
            padding: '1rem 2rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'estados' ? '3px solid var(--admin-primary)' : '3px solid transparent',
            color: activeTab === 'estados' ? 'var(--admin-primary)' : 'var(--admin-gray)',
            fontWeight: activeTab === 'estados' ? '600' : '500',
            fontSize: '1.125rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🏷️ Estados
        </button>
        <button
          onClick={() => setActiveTab('tipos')}
          style={{
            padding: '1rem 2rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'tipos' ? '3px solid var(--admin-primary)' : '3px solid transparent',
            color: activeTab === 'tipos' ? 'var(--admin-primary)' : 'var(--admin-gray)',
            fontWeight: activeTab === 'tipos' ? '600' : '500',
            fontSize: '1.125rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📂 Tipos de Recursos
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            {activeTab === 'estados' ? '🏷️' : '📂'}
          </div>
          <div className="stat-content">
            <p className="stat-label">
              {activeTab === 'estados' ? 'Total Estados' : 'Total Tipos'}
            </p>
            <p className="stat-value">{currentData.length}</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder={`Buscar ${activeTab}...`}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando...</p>
        </div>
      ) : error && activeTab === 'tipos' ? (
        <div className="error-container">
          <p style={{ color: 'var(--admin-error)' }}>{error}</p>
          <p style={{ color: 'var(--admin-gray)', marginTop: '0.5rem' }}>
            El endpoint /api/tipo_recurso/ no está disponible en el backend
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th className="actions-column">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    No hay {activeTab} disponibles
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item[getIdKey()]}>
                    <td>{item[getIdKey()]}</td>
                    <td>
                      <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                        {item.nombre}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          title="Editar"
                          onClick={() => openEditModal(item)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete"
                          title="Eliminar"
                          onClick={() => activeTab === 'estados' 
                            ? deleteEstado(item.id_estado) 
                            : deleteTipo(item.id_tipo)
                          }
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
              <h2>
                {editingItem 
                  ? `Editar ${activeTab === 'estados' ? 'Estado' : 'Tipo'}` 
                  : `Nuevo ${activeTab === 'estados' ? 'Estado' : 'Tipo'}`
                }
              </h2>
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
                  placeholder={activeTab === 'estados' ? 'Ej: Activo, Inactivo, Pendiente' : 'Ej: Video, PDF, Documento'}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;