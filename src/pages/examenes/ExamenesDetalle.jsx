// src/pages/examenes/ExamenDetalle.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, HelpCircle, Loader, AlertCircle, Play } from 'lucide-react'
import Navbar from '../../components/Navbar'
import StarButton from '../../components/StarButton'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import { examenesService } from '../../services/api'
import styles from './ExamenesDetalle.module.css'

export default function ExamenDetalle() {
  const { idExamen } = useParams()
  const { token }    = useAuth()
  const navigate     = useNavigate()
  const { isFavoriteExamen, toggleFavoriteExamen } = useFavorites()

  const [examen, setExamen]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!token) return
    examenesService.getCompleto(idExamen, token)
      .then(setExamen)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
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

  const esFav = isFavoriteExamen(examen.id_examen)

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.card}>

          <button className={styles.backBtn} onClick={() => navigate('/examenes')}>
            <ArrowLeft size={16} />
            Todos los exámenes
          </button>

          <div className={styles.iconWrap}>
            <BookOpen size={36} />
          </div>

          <h1 className={styles.titulo}>{examen.titulo}</h1>

          {/* Descripción + estrella en la misma fila */}
          <div className={styles.descripcionRow}>
            <p className={styles.descripcion}>{examen.descripcion}</p>
            <StarButton
              active={esFav}
              onToggle={() => toggleFavoriteExamen(examen.id_examen)}
              size={18}
            />
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <HelpCircle size={20} className={styles.statIcon} />
              <span className={styles.statNum}>{examen.preguntas.length}</span>
              <span className={styles.statLabel}>preguntas</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <Clock size={20} className={styles.statIcon} />
              <span className={styles.statNum}>~{Math.ceil(examen.preguntas.length * 0.5)}</span>
              <span className={styles.statLabel}>minutos</span>
            </div>
          </div>

          <div className={styles.reglas}>
            <p>• Una pregunta a la vez</p>
            <p>• Solo se permite un intento</p>
            <p>• Verás el resultado al terminar</p>
          </div>

          <button
            className={styles.btnComenzar}
            onClick={() => navigate(`/examenes/${idExamen}/resolver`, { state: { examen } })}
          >
            <Play size={18} />
            Comenzar examen
          </button>

        </div>
      </div>
    </>
  )
}