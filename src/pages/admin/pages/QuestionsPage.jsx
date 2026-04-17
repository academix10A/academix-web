import { useState, useEffect } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import { preguntaService } from '../../../services/api';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    contenido: '',
    id_examen: 0
  });

  // Cargar preguntas al montar el componente
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Obtener todas las preguntas
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await preguntaService.getAll();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
      setError('Error al cargar las preguntas. Verifica que la API esté funcionando.');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva pregunta
  const createQuestion = async () => {
    try {
      await preguntaService.postPregunta(formData);
      await fetchQuestions();
      closeModal();
    } catch (error) {
      console.error('Error al crear pregunta:', error);
      alert('Error al crear la pregunta. Por favor intenta de nuevo.');
    }
  };

  // Actualizar pregunta existente
  const updateQuestion = async () => {
    try {
      await preguntaService.putPregunta(editingQuestion.id_pregunta, formData);
      await fetchQuestions();
      closeModal();
    } catch (error) {
      console.error('Error al actualizar pregunta:', error);
      alert('Error al actualizar la pregunta. Por favor intenta de nuevo.');
    }
  };

  // Eliminar pregunta
  const deleteQuestion = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;

    try {
      await preguntaService.deletePregunta(id);
      await fetchQuestions();
    } catch (error) {
      console.error('Error al eliminar pregunta:', error);
      alert('Error al eliminar la pregunta. Por favor intenta de nuevo.');
    }
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      contenido: '',
      id_examen: 0
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const openEditModal = (question) => {
    setEditingQuestion(question);
    setFormData({
      contenido: question.contenido,
      id_examen: question.id_examen
    });
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData({
      contenido: '',
      id_examen: 0
    });
  };

  // Manejar submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingQuestion) {
      updateQuestion();
    } else {
      createQuestion();
    }
  };

  // Filtrar preguntas por búsqueda
  const filteredQuestions = questions.filter(q => 
    q.contenido?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Definir columnas de la tabla
  const columns = [
    { 
      key: 'id_pregunta', 
      header: 'ID Pregunta' 
    },
    { 
      key: 'contenido', 
      header: 'Contenido',
      render: (value) => (
        <span className="truncate-text" title={value}>
          {value?.substring(0, 80)}{value?.length > 80 ? '...' : ''}
        </span>
      )
    },
    { 
      key: 'id_examen', 
      header: 'ID Examen',
      render: (value) => (
        <span className="badge badge-category">{value}</span>
      )
    }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Preguntas de Examen</h1>
          <p className="page-subtitle">Gestiona las preguntas y exámenes del sistema</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          <span>Nueva Pregunta</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">📝</div>
          <div className="stat-content">
            <p className="stat-label">Total Preguntas</p>
            <p className="stat-value">{questions.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar por contenido..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container">
          <p>Cargando preguntas...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p style={{ color: 'var(--admin-error)' }}>{error}</p>
          <button className="btn-primary" onClick={fetchQuestions} style={{ marginTop: '1rem' }}>
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
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="no-data">
                    No hay preguntas disponibles
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>
                        {column.render 
                          ? column.render(question[column.key], question) 
                          : question[column.key]}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          title="Editar"
                          onClick={() => openEditModal(question)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete"
                          title="Eliminar"
                          onClick={() => deleteQuestion(question.id_pregunta)}
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
              <h2>{editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Contenido de la Pregunta *</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  required
                  placeholder="Escribe aquí el contenido de la pregunta..."
                />
              </div>

              <div className="form-group">
                <label>ID Examen *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.id_examen}
                  onChange={(e) => setFormData({...formData, id_examen: parseInt(e.target.value) || 0})}
                  min="0"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingQuestion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;