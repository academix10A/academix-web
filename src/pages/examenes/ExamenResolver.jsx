
// src/pages/examenes/ExamenResolver.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Loader, AlertCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../hooks/useAuth'
import { examenesService } from '../../services/api'
import styles from './ExamenResolver.module.css'


const OPCION_STYLES = [
  { bg: 'rgba(99,179,237,0.12)',  border: '#63b3ed', hover: 'rgba(99,179,237,0.25)'  },
  { bg: 'rgba(212,175,55,0.12)',  border: '#d4af37', hover: 'rgba(212,175,55,0.25)'  },
  { bg: 'rgba(154,230,180,0.12)', border: '#9ae6b4', hover: 'rgba(154,230,180,0.25)' },
  { bg: 'rgba(252,129,129,0.12)', border: '#fc8181', hover: 'rgba(252,129,129,0.25)' },
]

export default function ExamenResolver() {
  const { idExamen } = useParams()
  const { token, user } = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()

  const [examen, setExamen]         = useState(location.state?.examen ?? null)
  const [loading, setLoading]       = useState(!location.state?.examen)
  const [error, setError]           = useState(null)
  const [current, setCurrent]       = useState(0)          // índice pregunta actual
  const [respuestas, setRespuestas] = useState({})         // { id_pregunta: id_opcion }
  const [elegida, setElegida]       = useState(null)       // opción seleccionada en esta pregunta
  const [feedback, setFeedback]     = useState(null)       // 'correct' | 'wrong' | null
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    
    if (!examen) {
      examenesService.getCompleto(idExamen, token)
        .then(setExamen)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [idExamen, token])

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.centerWrap}>
        <Loader size={32} className={styles.spinner} />
      </div>
    </>
  )

  if (error || !examen) return (
    <>
      <Navbar />
      <div className={styles.centerWrap}>
        <AlertCircle size={32} style={{ color: '#fc8181' }} />
        <p>No se pudo cargar el examen</p>
      </div>
    </>
  )

  const preguntas  = examen.preguntas
  const pregunta   = preguntas[current]
  const progreso   = ((current) / preguntas.length) * 100
  const esUltima   = current === preguntas.length - 1

  const handleElegir = (opcion) => {
    if (feedback) return // ya respondió esta pregunta
    setElegida(opcion.id_opcion)

    // Guardar respuesta
    setRespuestas(prev => ({ ...prev, [pregunta.id_pregunta]: opcion.id_opcion }))

    // Feedback visual por 1.2s antes de avanzar
    // No sabemos si es correcta hasta enviar — solo mostramos "seleccionada"
    setFeedback('selected')
    setTimeout(() => {
      setFeedback(null)
      setElegida(null)
      if (!esUltima) {
        setCurrent(c => c + 1)
      }
    }, 800)
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    const payload = {
      id_examen:  examen.id_examen,
      id_usuario: user.id_usuario,
      respuestas: Object.entries(respuestas).map(([id_pregunta, id_opcion]) => ({
        id_pregunta: parseInt(id_pregunta),
        id_opcion,
      }))
    }

    try {
      const resultado = await examenesService.submit(payload, token)
      navigate(`/examenes/${idExamen}/resultado`, { state: { resultado } })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  // Si ya respondió la última, mostrar botón de enviar
  const yaRespondioActual = respuestas[pregunta.id_pregunta] !== undefined
  const todasRespondidas  = preguntas.every(p => respuestas[p.id_pregunta] !== undefined)

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/*  Barra de progreso  */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progreso}%` }} />
        </div>

        <div className={styles.container}>

          {/*  Contador  */}
          <div className={styles.counter}>
            <span className={styles.counterCurrent}>{current + 1}</span>
            <span className={styles.counterTotal}> / {preguntas.length}</span>
          </div>

          {/*  Pregunta  */}
          <div className={styles.preguntaCard}>
            <h2 className={styles.preguntaTexto}>{pregunta.contenido}</h2>
          </div>

          {/*  Opciones */}
          <div className={styles.opciones}>
            {pregunta.opciones.map((op, i) => {
              const style    = OPCION_STYLES[i % OPCION_STYLES.length]
              const selected = elegida === op.id_opcion

              return (
                <button
                  key={op.id_opcion}
                  className={`${styles.opcion} ${selected ? styles.opcionSelected : ''}`}
                  style={{
                    background:   selected ? style.hover : style.bg,
                    borderColor:  style.border,
                    boxShadow:    selected ? `0 0 20px ${style.border}40` : 'none',
                    transform:    selected ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onClick={() => handleElegir(op)}
                  disabled={!!feedback}
                >
                  <span
                    className={styles.opcionLetra}
                    style={{ background: style.bg, borderColor: style.border, color: style.border }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={styles.opcionTexto}>{op.respuesta}</span>
                </button>
              )
            })}
          </div>

          {/* Botón enviar (última pregunta ya respondida)  */}
          {esUltima && yaRespondioActual && !feedback && (
            <button
              className={styles.btnEnviar}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Enviando…' : 'Terminar y ver resultado'}
            </button>
          )}

        </div>
      </div>
    </>
  )
}