import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Users, Calendar } from 'lucide-react';
import { examenesService, subtemasService } from "../../../services/api";

const ExamenesPage = () => {
  const [examenes, setExamenes] = useState([]);
  const [subtemas, setSubtemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamenes();
    fetchSubtemas();
  }, []);

  const fetchSubtemas = async () => {
    try {
      const response = await subtemasService.getAll()
      if (response) {
        setSubtemas(response);
      }
    } catch (error) {
      console.error('Error al cargar subtemas:', error);
    }
  };

  const fetchExamenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await examenesService.getAll();
      setExamenes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar exámenes:', error);
      setError('Error al cargar los exámenes.');
      setExamenes([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteExamen = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este examen?')) return;

    try {
      await examenesService.deleteExamen(id);
      await fetchExamenes();
    } catch (error) {
      console.error('Error al eliminar examen:', error);
      alert('Error al eliminar el examen.');
    }
  };

  const filteredExamenes = examenes.filter(e => 
    e.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exámenes</h1>
          <p className="page-subtitle">Gestiona los exámenes del sistema</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => window.location.hash = '#crear-examen'}
        >
          <Plus size={20} />
          <span>Crear Examen</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">📝</div>
          <div className="stat-content">
            <p className="stat-label">Total Exámenes</p>
            <p className="stat-value">{examenes.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stock">❓</div>
          <div className="stat-content">
            <p className="stat-label">Total Preguntas</p>
            <p className="stat-value">
              {examenes.reduce((sum, e) => sum + (e.cantidad_preguntas || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar exámenes..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de exámenes */}
      {loading ? (
        <div className="loading-container">
          <p>Cargando exámenes...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p style={{ color: 'var(--admin-error)' }}>{error}</p>
          <button className="btn-primary" onClick={fetchExamenes}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="examenes-grid">
          {filteredExamenes.length === 0 ? (
            <div className="no-data-card">
              <FileText size={48} />
              <p>No hay exámenes disponibles</p>
              <button className="btn-primary" onClick={() => window.location.hash = '#crear-examen'}>
                Crear el primero
              </button>
            </div>
          ) : (
            filteredExamenes.map((examen) => (
              <div key={examen.id_examen} className="examen-card">
                <div className="examen-card-header">
                  <h3>{examen.titulo}</h3>
                  <span className="badge badge-category">{examen.cantidad_preguntas} preguntas</span>
                </div>
                
                <p className="examen-description">{examen.descripcion}</p>
                
                <div className="examen-meta">
                  <div className="meta-item">
                    <Users size={16} />
                    <span>Subtema: {
                      subtemas.find(s => s.id_subtema === examen.id_subtema)?.nombre || `ID: ${examen.id_subtema}`
                    }</span>
                  </div>
                </div>

                <div className="examen-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => window.location.hash = `#editar-examen/${examen.id_examen}`}
                  >
                    Editar
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => deleteExamen(examen.id_examen)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExamenesPage;