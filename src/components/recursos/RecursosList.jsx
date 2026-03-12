// src/components/recursos/RecursosList.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader, BookOpen, ExternalLink, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { recursosService } from '../../services/api'
import styles from './RecursosList.module.css'

export default function RecursosList() {
  const { idTipo, idCategoria } = useParams()
  const { token }               = useAuth()
  const navigate                = useNavigate()

  const [recursos, setRecursos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    recursosService.getAll(token)
      .then(data => {
        const todos = Array.isArray(data) ? data : data.items ?? []
        setRecursos(todos.filter(r =>
          String(r.id_tipo)    === String(idTipo) &&
          String(r.id_subtema) === String(idCategoria)
        ))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, idTipo, idCategoria])

  if (loading) return (
    <div className={styles.loadingWrap}>
      <Loader size={32} className={styles.spinner} />
      <p>Cargando recursos…</p>
    </div>
  )

  if (error) return (
    <div className={styles.errorWrap}>
      <AlertCircle size={32} style={{ color: '#fc8181' }} />
      <p>No se pudieron cargar los recursos.</p>
      <span>{error}</span>
    </div>
  )

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>Categorías</span>
        </button>
        <h1 className={styles.title}>
          {recursos.length} recurso{recursos.length !== 1 ? 's' : ''} encontrados
        </h1>
      </div>

      {recursos.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen size={48} className={styles.emptyIcon} />
          <p>No hay recursos en esta categoría todavía.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {recursos.map(r => (
            <div key={r.id_recurso} className={styles.card}>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{r.titulo}</h2>
                {r.descripcion && (
                  <p className={styles.cardDesc}>{r.descripcion}</p>
                )}
              </div>
              <div className={styles.cardFooter}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => navigate(`/recursos/ver/${r.id_recurso}`)}
                >
                  <ExternalLink size={14} />
                  Ver recurso
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}