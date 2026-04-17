import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader, ChevronRight, BookOpen, Headphones, Video, FileText, File } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { subtemasService, recursosService, tiposService } from '../../services/api'
import styles from './CategoriasList.module.css'

function getTipoIcon(nombre) {
  const n = nombre?.toLowerCase().trim()
  if (n?.includes('audio'))   return <Headphones size={22} />
  if (n?.includes('video'))   return <Video size={22} />
  if (n?.includes('pdf'))     return <FileText size={22} />
  if (n?.includes('libro'))   return <BookOpen size={22} />
  return <BookOpen size={22} />
}

export default function CategoriasList() {
  const { idTipo } = useParams()
  const { token }  = useAuth()
  const navigate   = useNavigate()

  const [tipo, setTipo]           = useState(null)
  const [subtemas, setSubtemas]   = useState([])
  const [recursos, setRecursos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    Promise.all([
      tiposService.getAll(token),
      subtemasService.getAll(token),
      recursosService.getAll(token),
    ])
      .then(([tipos, subs, recs]) => {
        const tiposArr = Array.isArray(tipos) ? tipos : tipos.items ?? []
        const tipoActual = tiposArr.find(t => String(t.id_tipo) === String(idTipo))
        setTipo(tipoActual ?? null)

        setSubtemas(Array.isArray(subs) ? subs : subs.items ?? [])

        const todos = Array.isArray(recs) ? recs : recs.items ?? []
        setRecursos(todos.filter(r => String(r.id_tipo) === String(idTipo)))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, idTipo])

  const countPorSubtema = (idSubtema) =>
    recursos.filter(r => String(r.id_subtema) === String(idSubtema)).length

  if (loading) return (
    <div className={styles.loadingWrap}>
      <Loader size={32} className={styles.spinner} />
      <p>Cargando categorías…</p>
    </div>
  )

  if (error) return (
    <div className={styles.errorWrap}>
      <p>No se pudieron cargar las categorías.</p>
      <span>{error}</span>
    </div>
  )

  const nombreTipo = tipo?.nombre
    ? tipo.nombre.charAt(0).toUpperCase() + tipo.nombre.slice(1)
    : 'Recursos'

  return (
    <section className={styles.section} style={{ position: 'relative' }}>

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/recursos')}>
          <ArrowLeft size={18} />
          <span>Biblioteca</span>
        </button>
        <div className={styles.headerTitle}>
          <div className={styles.tipoIcon}>
            {getTipoIcon(tipo?.nombre)}
          </div>
          <h1 className={styles.title}>{nombreTipo}</h1>
        </div>
        <p className={styles.subtitle}>
          {recursos.length} recurso{recursos.length !== 1 ? 's' : ''} disponibles
        </p>
      </div>

      {/* Grid */}
      <div className={styles.gridWrap}>
        <div className={styles.grid}>
          {subtemas.map(sub => {
            const count = countPorSubtema(sub.id_subtema)
            if (count === 0) return null
            return (
              <button
                key={sub.id_subtema}
                className={styles.card}
                onClick={() => navigate(`/recursos/${idTipo}/categoria/${sub.id_subtema}`)}
              >
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{sub.nombre}</h2>
                  <span className={styles.cardCount}>
                    {count} {count === 1 ? 'recurso' : 'recursos'}
                  </span>
                </div>
                <ChevronRight size={18} className={styles.cardArrow} />
              </button>
            )
          })}
        </div>

        {subtemas.every(s => countPorSubtema(s.id_subtema) === 0) && (
          <div className={styles.emptyState}>
            <p>No hay recursos disponibles en esta categoría todavía.</p>
          </div>
        )}
      </div>

    </section>
  )
}