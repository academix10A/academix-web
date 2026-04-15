import { useState, useEffect } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import Table from '../components/Table';
import ConfirmModal from '../components/ConfirmModal';
import { examenesService, preguntaService } from '../../../services/api';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]); // 🔥 Nuevo estado para exámenes
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    contenido: '',
    id_examen: 0
  });

  // Cargar preguntas y exámenes al montar el componente
  useEffect(() => {
    fetchQuestions();
    fetchExams(); // 🔥 Cargar lista de exámenes
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

  // 🔥 Obtener todos los exámenes
  const fetchExams = async () => {
    try {
      const data = await examenesService.getAll();
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar exámenes:', error);
      setExams([]);
    }
  };

  // Crear nueva pregunta
  const createQuestion = async () => {
    if (!formData.id_examen || formData.id_examen === 0) {
      alert('Por favor selecciona un examen');
      return;
    }
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
    if (!formData.id_examen || formData.id_examen === 0) {
      alert('Por favor selecciona un examen');
      return;
    }
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
  const deleteItem = async (id) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await preguntaService.deletePregunta(itemToDelete);
      await fetchQuestions();
    } catch (error) {
      console.error('Error al eliminar pregunta:', error);
      alert('Error al eliminar la pregunta');
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      contenido: '',
      id_examen: exams.length > 0 ? exams[0].id_examen : 0 // 🔥 Seleccionar primer examen por defecto
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

  // 🔥 Función para obtener el nombre del examen por ID
  const getExamenNombre = (idExamen) => {
    const examen = exams.find(e => e.id_examen === idExamen);
    return examen ? examen.titulo : `ID: ${idExamen}`;
  };

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
      header: 'Examen', // 🔥 Cambiado de "ID Examen" a "Examen"
      render: (value) => (
        <span className="badge badge-category" title={`ID: ${value}`}>
          {getExamenNombre(value)} {/* 🔥 Mostrar nombre en lugar de ID */}
        </span>
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
        <div className="stat-card">
          <div className="stat-icon products">📚</div>
          <div className="stat-content">
            <p className="stat-label">Total Exámenes</p>
            <p className="stat-value">{exams.length}</p>
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
                          onClick={() => deleteItem(question.id_pregunta)}
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

      {/* Modal - FORMULARIO MODIFICADO */}
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

              {/* 🔥 SELECTOR DE EXÁMENES en lugar de input numérico */}
              <div className="form-group">
                <label>Examen *</label>
                <select
                  className="form-input"
                  value={formData.id_examen}
                  onChange={(e) => setFormData({...formData, id_examen: parseInt(e.target.value)})}
                  required
                >
                  <option value={0}>Selecciona un examen...</option>
                  {exams.map((examen) => (
                    <option key={examen.id_examen} value={examen.id_examen}>
                      {examen.titulo} {examen.descripcion ? `- ${examen.descripcion.substring(0, 50)}` : ''}
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  {exams.length === 0 && "No hay exámenes disponibles. Crea un examen primero."}
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!formData.id_examen || formData.id_examen === 0}
                >
                  {editingQuestion ? 'Actualizar' : 'Crear'}
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
        title="¿Eliminar Pregunta?"
        message="Esta acción eliminará la pregunta y todas sus opciones de respuesta."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default QuestionsPage;