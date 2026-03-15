// src/pages/examenes/ExamenResultado.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Award, RotateCcw, BookOpen } from 'lucide-react'
import Navbar from '../../components/Navbar'
import styles from './ExamenResultado.module.css'

export default function ExamenResultado() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const resultado = location.state?.resultado

  if (!resultado) {
    navigate('/examenes')
    return null
  }

  const { titulo_examen, calificacion, correctas, total, porcentaje, preguntas } = resultado

  const getMedalla = () => {
    if (porcentaje >= 90) return { emoji: '🏆', label: '¡Excelente!',  color: '#d4af37' }
    if (porcentaje >= 70) return { emoji: '🥈', label: '¡Muy bien!',   color: '#9ae6b4' }
    if (porcentaje >= 50) return { emoji: '🥉', label: 'Bien hecho',   color: '#f6ad55' }
    return                       { emoji: '📚', label: 'Sigue practicando', color: '#fc8181' }
  }

  const medalla = getMedalla()

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>

          {/* ── Score ── */}
          <div className={styles.scoreCard}>
            <div className={styles.medalla}>{medalla.emoji}</div>
            <h1 className={styles.medallaLabel} style={{ color: medalla.color }}>
              {medalla.label}
            </h1>
            <p className={styles.examenTitulo}>{titulo_examen}</p>

            <div className={styles.scoreCircle} style={{ '--pct': `${porcentaje}` }}>
              <span className={styles.scoreNum}>{calificacion.toFixed(1)}</span>
              <span className={styles.scoreDen}>/10</span>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <CheckCircle size={18} style={{ color: '#9ae6b4' }} />
                <span className={styles.statNum} style={{ color: '#9ae6b4' }}>{correctas}</span>
                <span className={styles.statLabel}>correctas</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <XCircle size={18} style={{ color: '#fc8181' }} />
                <span className={styles.statNum} style={{ color: '#fc8181' }}>{total - correctas}</span>
                <span className={styles.statLabel}>incorrectas</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <Award size={18} style={{ color: 'var(--gold)' }} />
                <span className={styles.statNum} style={{ color: 'var(--gold)' }}>{porcentaje}%</span>
                <span className={styles.statLabel}>aciertos</span>
              </div>
            </div>
          </div>

          {/* ── Desglose por pregunta ── */}
          <h2 className={styles.desgloseTitle}>Revisión de respuestas</h2>
          <div className={styles.desglose}>
            {preguntas.map((p, i) => (
              <div
                key={p.id_pregunta}
                className={`${styles.preguntaRow} ${p.es_correcta ? styles.correcta : styles.incorrecta}`}
              >
                <div className={styles.preguntaHeader}>
                  <span className={styles.preguntaNum}>#{i + 1}</span>
                  <p className={styles.preguntaContenido}>{p.contenido}</p>
                  {p.es_correcta
                    ? <CheckCircle size={18} style={{ color: '#9ae6b4', flexShrink: 0 }} />
                    : <XCircle    size={18} style={{ color: '#fc8181', flexShrink: 0 }} />
                  }
                </div>

                <div className={styles.opciones}>
                  {p.opciones.map(op => {
                    const elegida   = op.id_opcion === p.id_opcion_elegida
                    const correcta  = op.es_correcta

                    let cls = styles.opcion
                    if (correcta)         cls += ` ${styles.opcionCorrecta}`
                    else if (elegida && !correcta) cls += ` ${styles.opcionElegidaMal}`

                    return (
                      <div key={op.id_opcion} className={cls}>
                        {correcta
                          ? <CheckCircle size={14} style={{ color: '#9ae6b4', flexShrink: 0 }} />
                          : elegida
                            ? <XCircle size={14} style={{ color: '#fc8181', flexShrink: 0 }} />
                            : <span className={styles.opcionDot} />
                        }
                        <span>{op.respuesta}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Botones ── */}
          <div className={styles.actions}>
            <button className={styles.btnSecundario} onClick={() => navigate('/examenes')}>
              <RotateCcw size={16} />
              Ver más exámenes
            </button>
            <button className={styles.btnPrimario} onClick={() => navigate('/recursos')}>
              <BookOpen size={16} />
              Ir a la biblioteca
            </button>
          </div>

        </div>
      </div>
    </>
  )
}