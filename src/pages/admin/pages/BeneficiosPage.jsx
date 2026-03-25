import { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';

const BeneficiosPage = () => {
  const [beneficios, setBeneficios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBeneficio, setEditingBeneficio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    fetchBeneficios();
  }, []);

  const fetchBeneficios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/beneficios/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBeneficios(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error al cargar beneficios');
      }
    } catch (error) {
      console.error('Error al cargar beneficios:', error);
      setError('Error al cargar los beneficios.');
      setBeneficios([]);
    } finally {
      setLoading(false);
    }
  };

  const createBeneficio = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/beneficios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchBeneficios();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'No se pudo crear el beneficio'}`);
      }
    } catch (error) {
      console.error('Error al crear beneficio:', error);
      alert('Error al crear el beneficio');
    }
  };

  const updateBeneficio = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/beneficios/${editingBeneficio.id_beneficio}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchBeneficios();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'No se pudo actualizar el beneficio'}`);
      }
    } catch (error) {
      console.error('Error al actualizar beneficio:', error);
      alert('Error al actualizar el beneficio');
    }
  };

  const deleteBeneficio = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este beneficio?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/beneficios/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        await fetchBeneficios();
      } else {
        alert('Error al eliminar el beneficio');
      }
    } catch (error) {
      console.error('Error al eliminar beneficio:', error);
      alert('Error al eliminar el beneficio');
    }
  };

  const openCreateModal = () => {
    setEditingBeneficio(null);
    setFormData({
      nombre: '',
      descripcion: ''
    });
    setShowModal(true);
  };

  const openEditModal = (beneficio) => {
    setEditingBeneficio(beneficio);
    setFormData({
      nombre: beneficio.nombre,
      descripcion: beneficio.descripcion
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBeneficio(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBeneficio) {
      updateBeneficio();
    } else {
      createBeneficio();
    }
  };

  const filteredBeneficios = beneficios.filter(b => 
    b.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      key: 'id_beneficio', 
      header: 'ID' 
    },
    { 
      key: 'nombre', 
      header: 'Nombre',
      render: (value) => (
        <span style={{ fontWeight: '600', fontSize: '1.125rem', color: 'var(--admin-primary)' }}>
          ⭐ {value}
        </span>
      )
    },
    { 
      key: 'descripcion', 
      header: 'Descripción',
      render: (value) => (
        <span className="truncate-text" title={value}>
          {value?.substring(0, 100)}{value?.length > 100 ? '...' : ''}
        </span>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Beneficios</h1>
          <p className="page-subtitle">Gestiona los beneficios de las membresías</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          <span>Nuevo Beneficio</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Total Beneficios</p>
            <p className="stat-value">{beneficios.length}</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar beneficios..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando beneficios...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p style={{ color: 'var(--admin-error)' }}>{error}</p>
          <button className="btn-primary" onClick={fetchBeneficios} style={{ marginTop: '1rem' }}>
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
              {filteredBeneficios.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="no-data">
                    No hay beneficios disponibles
                  </td>
                </tr>
              ) : (
                filteredBeneficios.map((beneficio, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>
                        {column.render 
                          ? column.render(beneficio[column.key], beneficio) 
                          : beneficio[column.key]}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          title="Editar"
                          onClick={() => openEditModal(beneficio)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete"
                          title="Eliminar"
                          onClick={() => deleteBeneficio(beneficio.id_beneficio)}
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
              <h2>{editingBeneficio ? 'Editar Beneficio' : 'Nuevo Beneficio'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Beneficio *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Ej: Acceso ilimitado, Videos HD, Certificados"
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
                  placeholder="Describe en qué consiste este beneficio..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingBeneficio ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiosPage;