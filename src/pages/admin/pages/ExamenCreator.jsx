import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check, X } from 'lucide-react';
import { examenesAPI, preguntasAPI, opcionesAPI } from '../utils/api';

const ExamenCreator = () => {
  const [step, setStep] = useState(1);
  const [subtemas, setSubtemas] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [examenId, setExamenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [examenData, setExamenData] = useState({
    titulo: '',
    descripcion: '',
    id_subtema: 1
  });
  
  const [preguntas, setPreguntas] = useState([
    {
      contenido: '',
      opciones: [
        { respuesta: '', es_correcta: false },
        { respuesta: '', es_correcta: false },
        { respuesta: '', es_correcta: false },
        { respuesta: '', es_correcta: false }
      ]
    }
  ]);

// Cargar subtemas al montar + detectar edit mode from route params
  useEffect(() => {
    fetchSubtemas();
  }, []);

  const { id } = useParams();
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setExamenId(parseInt(id));
      cargarExamen(parseInt(id));
    }
  }, [id]);

  const cargarExamen = async (id) => {
    setLoading(true);
    try {
      // 1. Cargar datos del examen
      const examen = await examenesAPI.getById(id);
      setExamenData({
        titulo: examen.titulo,
        descripcion: examen.descripcion,
        id_subtema: examen.id_subtema
      });

      // 2. Cargar preguntas del examen
      const response = await fetch(`http://127.0.0.1:8000/api/pregunta/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const todasPreguntas = await response.json();
        const preguntasDelExamen = todasPreguntas.filter(p => p.id_examen === id);
        
        // 3. Cargar opciones de cada pregunta
        const preguntasConOpciones = await Promise.all(
          preguntasDelExamen.map(async (pregunta) => {
            const opcionesRes = await fetch(`http://127.0.0.1:8000/api/opcion/`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              }
            });
            
            if (opcionesRes.ok) {
              const todasOpciones = await opcionesRes.json();
              const opcionesDePregunta = todasOpciones
                .filter(o => o.id_pregunta === pregunta.id_pregunta)
                .map(o => ({
                  respuesta: o.respuesta,
                  es_correcta: o.es_correcta
                }));
              
              // Asegurarse de tener 4 opciones
              while (opcionesDePregunta.length < 4) {
                opcionesDePregunta.push({ respuesta: '', es_correcta: false });
              }
              
              return {
                contenido: pregunta.contenido,
                opciones: opcionesDePregunta.slice(0, 4)
              };
            }
            
            return {
              contenido: pregunta.contenido,
              opciones: [
                { respuesta: '', es_correcta: false },
                { respuesta: '', es_correcta: false },
                { respuesta: '', es_correcta: false },
                { respuesta: '', es_correcta: false }
              ]
            };
          })
        );
        
        setPreguntas(preguntasConOpciones.length > 0 ? preguntasConOpciones : preguntas);
      }
    } catch (error) {
      console.error('Error al cargar examen:', error);
      alert('Error al cargar el examen');
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
        setSubtemas(data);
      }
    } catch (error) {
      console.error('Error al cargar subtemas:', error);
    }
  };

  // Agregar nueva pregunta
  const agregarPregunta = () => {
    setPreguntas([...preguntas, {
      contenido: '',
      opciones: [
        { respuesta: '', es_correcta: false },
        { respuesta: '', es_correcta: false },
        { respuesta: '', es_correcta: false },
        { respuesta: '', es_correcta: false }
      ]
    }]);
  };

  // Eliminar pregunta
  const eliminarPregunta = (index) => {
    if (preguntas.length > 1) {
      setPreguntas(preguntas.filter((_, i) => i !== index));
    }
  };

  // Actualizar contenido de pregunta
  const actualizarPregunta = (index, contenido) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[index].contenido = contenido;
    setPreguntas(nuevasPreguntas);
  };

  // Actualizar opción
  const actualizarOpcion = (preguntaIndex, opcionIndex, respuesta) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[preguntaIndex].opciones[opcionIndex].respuesta = respuesta;
    setPreguntas(nuevasPreguntas);
  };

  // Marcar opción como correcta
  const marcarCorrecta = (preguntaIndex, opcionIndex) => {
    const nuevasPreguntas = [...preguntas];
    // Desmarcar todas
    nuevasPreguntas[preguntaIndex].opciones.forEach(op => op.es_correcta = false);
    // Marcar la seleccionada
    nuevasPreguntas[preguntaIndex].opciones[opcionIndex].es_correcta = true;
    setPreguntas(nuevasPreguntas);
  };

  // Validar paso 1
  const validarPaso1 = () => {
    return examenData.titulo.trim() !== '' && 
           examenData.descripcion.trim() !== '' &&
           examenData.id_subtema > 0;
  };

  // Validar paso 2
  const validarPaso2 = () => {
    return preguntas.every(p => {
      const tieneContenido = p.contenido.trim() !== '';
      const todasOpcionesLlenas = p.opciones.every(o => o.respuesta.trim() !== '');
      const tieneUnaCorrecta = p.opciones.some(o => o.es_correcta);
      return tieneContenido && todasOpcionesLlenas && tieneUnaCorrecta;
    });
  };

  // Guardar examen completo
  const guardarExamen = async () => {
    try {
      let idExamen;
      
      if (isEditMode) {
        // Modo edición: actualizar examen existente
        await examenesAPI.update(examenId, {
          ...examenData,
          cantidad_preguntas: preguntas.length
        });
        idExamen = examenId;
        
        // Eliminar preguntas y opciones antiguas
        const response = await fetch(`http://127.0.0.1:8000/api/pregunta/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const todasPreguntas = await response.json();
          const preguntasAntiguasDelExamen = todasPreguntas.filter(p => p.id_examen === idExamen);
          
          // Eliminar preguntas antiguas (y sus opciones se eliminan en cascada)
          for (const pregunta of preguntasAntiguasDelExamen) {
            await preguntasAPI.delete(pregunta.id_pregunta);
          }
        }
      } else {
        // Modo creación: crear nuevo examen
        const examenCreado = await examenesAPI.create({
          ...examenData,
          cantidad_preguntas: preguntas.length
        });
        idExamen = examenCreado.id_examen;
      }

      // Crear preguntas y opciones (nuevas o actualizadas)
      for (const pregunta of preguntas) {
        const preguntaCreada = await preguntasAPI.create({
          contenido: pregunta.contenido,
          id_examen: idExamen
        });

        const idPregunta = preguntaCreada.id_pregunta;

        for (const opcion of pregunta.opciones) {
          await opcionesAPI.create({
            respuesta: opcion.respuesta,
            es_correcta: opcion.es_correcta,
            id_pregunta: idPregunta
          });
        }
      }

      alert(isEditMode ? '¡Examen actualizado exitosamente!' : '¡Examen creado exitosamente!');
      navigate('/examenes');
    } catch (error) {
      console.error('Error al guardar examen:', error);
      alert('Error al guardar el examen. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="page-container">
      {loading ? (
        <div className="loading-container" style={{ minHeight: '50vh' }}>
          <p>Cargando examen...</p>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="page-header">
        <div>
          <button 
            className="btn-back"
            onClick={() => window.location.hash = '#examenes'}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="page-title">{isEditMode ? 'Editar Examen' : 'Crear Examen'}</h1>
          <p className="page-subtitle">Paso {step} de 3</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Info Básica</p>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Preguntas</p>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Revisar</p>
          </div>
        </div>
      </div>

      {/* Paso 1: Información básica */}
      {step === 1 && (
        <div className="creator-step">
          <div className="form-card">
            <h2>Información del Examen</h2>
            
            <div className="form-group">
              <label>Título del Examen *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Examen de Matemáticas - Unidad 1"
                value={examenData.titulo}
                onChange={(e) => setExamenData({...examenData, titulo: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Descripción *</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Describe de qué trata este examen..."
                value={examenData.descripcion}
                onChange={(e) => setExamenData({...examenData, descripcion: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Subtema *</label>
              <select
                className="form-input"
                value={examenData.id_subtema}
                onChange={(e) => setExamenData({...examenData, id_subtema: parseInt(e.target.value)})}
              >
                <option value="">Selecciona un subtema</option>
                {subtemas.map((subtema) => (
                  <option key={subtema.id_subtema} value={subtema.id_subtema}>
                    {subtema.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="step-actions">
              <button 
                className="btn-primary"
                onClick={() => setStep(2)}
                disabled={!validarPaso1()}
              >
                Siguiente: Agregar Preguntas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: Preguntas */}
      {step === 2 && (
        <div className="creator-step">
          <div className="preguntas-container">
            {preguntas.map((pregunta, pIndex) => (
              <div key={pIndex} className="pregunta-card">
                <div className="pregunta-header">
                  <h3>Pregunta {pIndex + 1}</h3>
                  {preguntas.length > 1 && (
                    <button
                      className="btn-icon-delete"
                      onClick={() => eliminarPregunta(pIndex)}
                      title="Eliminar pregunta"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Contenido de la Pregunta *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Escribe la pregunta aquí..."
                    value={pregunta.contenido}
                    onChange={(e) => actualizarPregunta(pIndex, e.target.value)}
                  />
                </div>

                <div className="opciones-grid">
                  {pregunta.opciones.map((opcion, oIndex) => (
                    <div 
                      key={oIndex} 
                      className={`opcion-item ${opcion.es_correcta ? 'correcta' : ''}`}
                      onClick={() => marcarCorrecta(pIndex, oIndex)}
                    >
                      <div className="opcion-checkbox">
                        {opcion.es_correcta ? <Check size={16} /> : null}
                      </div>
                      <input
                        type="text"
                        className="opcion-input"
                        placeholder={`Opción ${String.fromCharCode(65 + oIndex)}`}
                        value={opcion.respuesta}
                        onChange={(e) => {
                          e.stopPropagation();
                          actualizarOpcion(pIndex, oIndex, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
                </div>
                <p className="hint-text">💡 Haz clic en una opción para marcarla como correcta</p>
              </div>
            ))}

            <button className="btn-add-question" onClick={agregarPregunta}>
              <Plus size={20} />
              Agregar otra pregunta
            </button>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Atrás
            </button>
            <button 
              className="btn-primary"
              onClick={() => setStep(3)}
              disabled={!validarPaso2()}
            >
              Siguiente: Revisar
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Revisar */}
      {step === 3 && (
        <div className="creator-step">
          <div className="review-container">
            <div className="review-section">
              <h2>📋 Resumen del Examen</h2>
              <div className="review-info">
                <p><strong>Título:</strong> {examenData.titulo}</p>
                <p><strong>Descripción:</strong> {examenData.descripcion}</p>
                <p><strong>Subtema:</strong> {
                  subtemas.find(s => s.id_subtema === examenData.id_subtema)?.nombre || 'Sin seleccionar'
                }</p>
                <p><strong>Total de preguntas:</strong> {preguntas.length}</p>
              </div>
            </div>

            <div className="review-section">
              <h2>❓ Preguntas</h2>
              {preguntas.map((pregunta, index) => (
                <div key={index} className="review-pregunta">
                  <h4>{index + 1}. {pregunta.contenido}</h4>
                  <div className="review-opciones">
                    {pregunta.opciones.map((opcion, oIndex) => (
                      <div 
                        key={oIndex} 
                        className={`review-opcion ${opcion.es_correcta ? 'correcta' : ''}`}
                      >
                        {String.fromCharCode(65 + oIndex)}. {opcion.respuesta}
                        {opcion.es_correcta && <Check size={16} />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Atrás
            </button>
            <button className="btn-primary" onClick={guardarExamen}>
              <Check size={20} />
              {isEditMode ? 'Actualizar Examen' : 'Crear Examen'}
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ExamenCreator;