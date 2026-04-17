// src/pages/examenes/ExamenesPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, BookOpen, Loader, AlertCircle, ChevronRight, Star } from 'lucide-react'
import Navbar from '../../components/Navbar'
import StarButton from '../../components/StarButton'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import { examenesService, subtemasService } from '../../services/api'
import styles from './ExamenesPage.module.css'

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')                 // separa letras y acentos
    .replace(/[\u0300-\u036f]/g, '')  // elimina los acentos
    .toLowerCase()
}

const ETIQUETA_COLORS = [
  { bg: 'rgba(99,179,237,0.15)',  border: 'rgba(99,179,237,0.4)',  text: '#63b3ed' },
  { bg: 'rgba(212,175,55,0.15)',  border: 'rgba(212,175,55,0.4)',  text: '#d4af37' },
  { bg: 'rgba(154,230,180,0.15)', border: 'rgba(154,230,180,0.4)', text: '#9ae6b4' },
  { bg: 'rgba(252,129,129,0.15)', border: 'rgba(252,129,129,0.4)', text: '#fc8181' },
  { bg: 'rgba(183,148,246,0.15)', border: 'rgba(183,148,246,0.4)', text: '#b794f6' },
  { bg: 'rgba(246,173,85,0.15)',  border: 'rgba(246,173,85,0.4)',  text: '#f6ad55' },
]

function getColor(index) {
  return ETIQUETA_COLORS[index % ETIQUETA_COLORS.length]
}

// Valor especial para el filtro de favoritos — no es un id_subtema real
const FILTRO_FAVORITOS = 'favoritos'

export default function ExamenesPage() {
  const { token }    = useAuth()
  const navigate     = useNavigate()
  const [searchParams] = useSearchParams()
  const { isFavoriteExamen, toggleFavoriteExamen, counts } = useFavorites()

  const [examenes, setExamenes]   = useState([])
  const [subtemas, setSubtemas]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [busqueda, setBusqueda]   = useState('')
  const [filtroSub, setFiltroSub] = useState(null)

  useEffect(() => {
    if (!token) return
    Promise.all([
      examenesService.getAll(token),
      subtemasService.getAll(token),
    ])
      .then(([exs, subs]) => {
        setExamenes(Array.isArray(exs) ? exs : exs.items ?? [])
        setSubtemas(Array.isArray(subs) ? subs : subs.items ?? [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    const subtemaParam = searchParams.get('subtema')
    if (subtemaParam) setFiltroSub(parseInt(subtemaParam))
  }, [searchParams])

  const examenesFiltrados = examenes.filter(ex => {
    const matchBusqueda = normalizarTexto(ex.titulo).includes(normalizarTexto(busqueda))
    const matchFavoritos = filtroSub === FILTRO_FAVORITOS ? isFavoriteExamen(ex.id_examen) : true
    const matchSub       = (filtroSub && filtroSub !== FILTRO_FAVORITOS) ? ex.id_subtema === filtroSub : true
    return matchBusqueda && matchFavoritos && matchSub
  })

  const subtemasConExamen = subtemas.filter(s =>
    examenes.some(ex => ex.id_subtema === s.id_subtema)
  )

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.centerWrap}>
        <Loader size={32} className={styles.spinner} />
        <p>Cargando exámenes…</p>
      </div>
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className={styles.centerWrap}>
        <AlertCircle size={32} style={{ color: '#fc8181' }} />
        <p>No se pudieron cargar los exámenes</p>
      </div>
    </>
  )

  const mostrandoFavoritos = filtroSub === FILTRO_FAVORITOS

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Exámenes</h1>
          <p className={styles.heroSub}>Pon a prueba tu conocimiento</p>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar examen por título…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.content}>

          {/* Filtros — Todos + Favoritos + Subtemas */}
          {subtemasConExamen.length > 0 && (
            <div className={styles.etiquetas}>

              {/* Todos */}
              <button
                className={`${styles.etiqueta} ${filtroSub === null ? styles.etiquetaActive : ''}`}
                onClick={() => setFiltroSub(null)}
                style={filtroSub === null ? {
                  background: 'rgba(212,175,55,0.2)',
                  borderColor: 'var(--gold)',
                  color: 'var(--gold)',
                } : {}}
              >
                Todos
              </button>

              {/* Favoritos — siempre visible */}
              <button
                className={`${styles.etiqueta} ${styles.etiquetaFavoritos} ${mostrandoFavoritos ? styles.etiquetaFavoritosActive : ''}`}
                onClick={() => setFiltroSub(mostrandoFavoritos ? null : FILTRO_FAVORITOS)}
              >
                <Star
                  size={13}
                  fill={mostrandoFavoritos ? 'currentColor' : 'none'}
                  style={{ flexShrink: 0 }}
                />
                Favoritos
                {counts.examenes > 0 && (
                  <span className={styles.favCount}>{counts.examenes}</span>
                )}
              </button>

              {/* Subtemas dinámicos */}
              {subtemasConExamen.map((s, i) => {
                const color  = getColor(i)
                const activo = filtroSub === s.id_subtema
                return (
                  <button
                    key={s.id_subtema}
                    className={styles.etiqueta}
                    onClick={() => setFiltroSub(activo ? null : s.id_subtema)}
                    style={{
                      background:  activo ? color.bg     : 'rgba(255,255,255,0.04)',
                      borderColor: activo ? color.border  : 'rgba(255,255,255,0.1)',
                      color:       activo ? color.text    : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {s.nombre}
                  </button>
                )
              })}
            </div>
          )}

          {/* Grid */}
          {examenesFiltrados.length === 0 ? (
            <div className={styles.empty}>
              {mostrandoFavoritos ? (
                <>
                  <Star size={48} className={styles.emptyIcon} />
                  <p>Todavía no tienes favoritos</p>
                  <span className={styles.emptyHint}>
                    Agrega uno nuevo con la estrella ★ en cualquier examen
                  </span>
                </>
              ) : (
                <>
                  <BookOpen size={48} className={styles.emptyIcon} />
                  <p>No hay exámenes que coincidan con tu búsqueda</p>
                </>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {examenesFiltrados.map((ex) => {
                const subtema   = subtemas.find(s => s.id_subtema === ex.id_subtema)
                const colorIdx  = subtemas.findIndex(s => s.id_subtema === ex.id_subtema)
                const color     = getColor(colorIdx)
                const esFav     = isFavoriteExamen(ex.id_examen)

                return (
                  <div
                    key={ex.id_examen}
                    className={`${styles.card} ${esFav ? styles.cardFavorita : ''}`}
                    onClick={() => navigate(`/examenes/${ex.id_examen}`)}
                  >
                    <div className={styles.cardTop}>
                      {subtema && (
                        <span
                          className={styles.cardEtiqueta}
                          style={{
                            background:  color.bg,
                            borderColor: color.border,
                            color:       color.text,
                          }}
                        >
                          {subtema.nombre}
                        </span>
                      )}
                      <div className={styles.cardActions}>
                        <StarButton
                          active={esFav}
                          onToggle={() => toggleFavoriteExamen(ex.id_examen)}
                        />
                        <ChevronRight size={18} className={styles.cardArrow} />
                      </div>
                    </div>
                    <h2 className={styles.cardTitle}>{ex.titulo}</h2>
                    {ex.descripcion && (
                      <p className={styles.cardDesc}>{ex.descripcion}</p>
                    )}
                    <div className={styles.cardFooter}>
                      <span className={styles.cardMeta}>
                        {ex.cantidad_preguntas} preguntas
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}