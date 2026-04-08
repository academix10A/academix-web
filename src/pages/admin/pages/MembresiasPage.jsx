import { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { beneficiosService, membresiasService } from "../../../services/api";

const MembresiasPage = () => {
  const [membresias, setMembresias] = useState([]);
  const [beneficios, setBeneficios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMembresia, setEditingMembresia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    costo: 0,
    tipo: 'Mensual',
    duracion_dias: 30,
    beneficios: []
  });

  useEffect(() => {
    fetchMembresias();
    fetchBeneficios();
  }, []);

  const fetchMembresias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await membresiasService.getAll()
      
      if (response) {
        setMembresias(Array.isArray(response) ? response : []);
      } else {
        throw new Error('Error al cargar membresías');
      }
    } catch (error) {
      console.error('Error al cargar membresías:', error);
      setError('Error al cargar las membresías.');
      setMembresias([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficios = async () => {
    try {
      const response = await beneficiosService.getAll()
      
      if (response) {
        setBeneficios(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error al cargar beneficios:', error);
    }
  };

  const createMembresia = async () => {
    try {
      const response = await membresiasService.postMembresia(formData)

      if (response) {
        await fetchMembresias();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'No se pudo crear la membresía'}`);
      }
    } catch (error) {
      console.error('Error al crear membresía:', error);
      alert('Error al crear la membresía');
    }
  };

  const updateMembresia = async () => {
    try {
      const response = await membresiasService.putMembresia(formData)

      if (response) {
        await fetchMembresias();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'No se pudo actualizar la membresía'}`);
      }
    } catch (error) {
      console.error('Error al actualizar membresía:', error);
      alert('Error al actualizar la membresía');
    }
  };

  const deleteMembresia = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta membresía?')) return;

    try {
      const response = await membresiasService.deleteMembresia(id)

      if (response) {
        await fetchMembresias();
      } else {
        alert('Error al eliminar la membresía');
      }
    } catch (error) {
      console.error('Error al eliminar membresía:', error);
      alert('Error al eliminar la membresía');
    }
  };

  const openCreateModal = () => {
    setEditingMembresia(null);
    setFormData({
      nombre: '',
      descripcion: '',
      costo: 0,
      tipo: 'Mensual',
      duracion_dias: 30,
      beneficios: []
    });
    setShowModal(true);
  };

  const openEditModal = (membresia) => {
    setEditingMembresia(membresia);
    setFormData({
      nombre: membresia.nombre,
      descripcion: membresia.descripcion,
      costo: membresia.costo,
      tipo: membresia.tipo,
      duracion_dias: membresia.duracion_dias,
      beneficios: membresia.beneficios || []
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMembresia(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMembresia) {
      updateMembresia();
    } else {
      createMembresia();
    }
  };

  const toggleBeneficio = (idBeneficio) => {
    const beneficiosActuales = [...formData.beneficios];
    const index = beneficiosActuales.indexOf(idBeneficio);
    
    if (index > -1) {
      beneficiosActuales.splice(index, 1);
    } else {
      beneficiosActuales.push(idBeneficio);
    }
    
    setFormData({ ...formData, beneficios: beneficiosActuales });
  };

  const filteredMembresias = membresias.filter(m => 
    m.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBeneficioNombre = (idBeneficio) => {
    const beneficio = beneficios.find(b => b.id_beneficio === idBeneficio);
    return beneficio ? beneficio.nombre : '';
  };

  const columns = [
    { 
      key: 'id_membresia', 
      header: 'ID' 
    },
    { 
      key: 'nombre', 
      header: 'Nombre',
      render: (value) => (
        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{value}</span>
      )
    },
    { 
      key: 'tipo', 
      header: 'Tipo',
      render: (value) => (
        <span className="badge badge-category">{value}</span>
      )
    },
    { 
      key: 'costo', 
      header: 'Costo',
      render: (value) => (
        <span style={{ fontWeight: '600', color: 'var(--admin-success)' }}>
          ${value.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'duracion_dias', 
      header: 'Duración',
      render: (value) => `${value} días`
    },
    { 
      key: 'beneficios', 
      header: 'Beneficios',
      render: (value) => (
        <span className="badge badge-category">
          {value?.length || 0} beneficios
        </span>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Membresías</h1>
          <p className="page-subtitle">Gestiona los planes de membresía</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          <span>Nueva Membresía</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">💳</div>
          <div className="stat-content">
            <p className="stat-label">Total Membresías</p>
            <p className="stat-value">{membresias.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stock">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Beneficios Disponibles</p>
            <p className="stat-value">{beneficios.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">📅</div>
          <div className="stat-content">
            <p className="stat-label">Membresías Mensuales</p>
            <p className="stat-value">
              {membresias.filter(m => m.tipo === 'Mensual').length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock">📆</div>
          <div className="stat-content">
            <p className="stat-label">Membresías Anuales</p>
            <p className="stat-value">
              {membresias.filter(m => m.tipo === 'Anual').length}
            </p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar membresías..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando membresías...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p style={{ color: 'var(--admin-error)' }}>{error}</p>
          <button className="btn-primary" onClick={fetchMembresias} style={{ marginTop: '1rem' }}>
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
              {filteredMembresias.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="no-data">
                    No hay membresías disponibles
                  </td>
                </tr>
              ) : (
                filteredMembresias.map((membresia, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>
                        {column.render 
                          ? column.render(membresia[column.key], membresia) 
                          : membresia[column.key]}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          title="Editar"
                          onClick={() => openEditModal(membresia)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete"
                          title="Eliminar"
                          onClick={() => deleteMembresia(membresia.id_membresia)}
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
              <h2>{editingMembresia ? 'Editar Membresía' : 'Nueva Membresía'}</h2>
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
                  placeholder="Ej: Premium, Básico, VIP"
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
                  placeholder="Descripción de la membresía"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Costo *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.costo}
                    onChange={(e) => setFormData({...formData, costo: parseFloat(e.target.value) || 0})}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    className="form-input"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="Mensual">Mensual</option>
                    <option value="Anual">Anual</option>
                    <option value="Vitalicio">Vitalicio</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duración (días) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.duracion_dias}
                    onChange={(e) => setFormData({...formData, duracion_dias: parseInt(e.target.value) || 0})}
                    required
                    min="1"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Beneficios</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  {beneficios.map(beneficio => (
                    <label 
                      key={beneficio.id_beneficio}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        padding: '1rem',
                        backgroundColor: formData.beneficios.includes(beneficio.id_beneficio) 
                          ? 'rgba(0, 206, 209, 0.1)' 
                          : 'var(--admin-background)',
                        border: `2px solid ${formData.beneficios.includes(beneficio.id_beneficio) 
                          ? 'var(--admin-primary)' 
                          : 'var(--admin-border)'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.beneficios.includes(beneficio.id_beneficio)}
                        onChange={() => toggleBeneficio(beneficio.id_beneficio)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>
                        {beneficio.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingMembresia ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembresiasPage;