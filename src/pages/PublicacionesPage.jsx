// src/pages/PublicacionesPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, X, Tag, User, BookOpen,
  Clock, ArrowRight, Loader, AlertCircle, Feather,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import styles from './PublicacionesPage.module.css'
import { publicacionesService } from '../services/api'

async function fetchPublicaciones({ skip = 0, limit = 12, titulo, nombre_usuario, etiqueta } = {}) {
  const params = new URLSearchParams()
  params.set('skip', skip)
  params.set('limit', limit)
  if (titulo)         params.set('titulo', titulo)
  if (nombre_usuario) params.set('nombre_usuario', nombre_usuario)
  if (etiqueta)       params.set('etiqueta', etiqueta)

  const res = await publicacionesService.getAllWithFilters(params)
  if (!res) throw new Error(`Error ${res.status}`)
  return res
}

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function formatRelativa(fechaStr) {
  if (!fechaStr) return ''
  const dias = Math.floor((Date.now() - new Date(fechaStr)) / 86400000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7)  return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} sem.`
  return formatFecha(fechaStr)
}

function minLectura(texto) {
  if (!texto) return 1
  return Math.max(1, Math.ceil(texto.trim().split(/\s+/).length / 200))
}

function PublicacionCard({ pub, onClick }) {
  const autor = pub.usuario
    ? `${pub.usuario.nombre} ${pub.usuario.apellido_paterno}`
    : 'Autor desconocido'

  return (
    <article className={styles.card} onClick={onClick}>
      <div
        className={styles.cardAccent}
        style={{ '--hue': (pub.id_publicacion * 47) % 360 }}
      />

      <div className={styles.cardBody}>
        {pub.etiquetas?.length > 0 && (
          <div className={styles.tags}>
            {pub.etiquetas.slice(0, 3).map(e => (
              <span key={e.id_etiqueta} className={styles.tag}>
                <Tag size={10} />
                {e.nombre}
              </span>
            ))}
            {pub.etiquetas.length > 3 && (
              <span className={styles.tagMore}>+{pub.etiquetas.length - 3}</span>
            )}
          </div>
        )}

        <h2 className={styles.cardTitulo}>{pub.titulo}</h2>
        <p className={styles.cardDesc}>{pub.descripcion}</p>
      </div>

      <footer className={styles.cardFooter}>
        <div className={styles.cardAutor}>
          <div className={styles.avatarMini}>
            {autor.charAt(0).toUpperCase()}
          </div>
          <span>{autor}</span>
        </div>

        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>
            <Clock size={11} />
            {formatRelativa(pub.fecha_creacion)}
          </span>
          <span className={styles.metaItem}>
            <BookOpen size={11} />
            {minLectura(pub.texto)} min
          </span>
        </div>

        <ArrowRight size={14} className={styles.cardArrow} />
      </footer>
    </article>
  )
}

export default function PublicacionesPage() {
  const navigate        = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [busqueda,   setBusqueda]   = useState(searchParams.get('q') ?? '')
  const [modoFiltro, setModoFiltro] = useState(searchParams.get('modo') ?? 'titulo')

  const [publicaciones, setPublicaciones] = useState([])
  const [total,         setTotal]         = useState(0)
  const [skip,          setSkip]          = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [loadingMore,   setLoadingMore]   = useState(false)
  const [error,         setError]         = useState(null)

  const LIMIT = 12
  const hayMas = publicaciones.length < total

  const debounceRef = useRef(null)

  const cargar = useCallback(async (nuevoBusqueda, nuevoModo, nuevoSkip = 0, acumular = false) => {
    if (!acumular) setLoading(true)
    else setLoadingMore(true)
    setError(null)

    const filtros = {}
    if (nuevoBusqueda) {
      if (nuevoModo === 'titulo')   filtros.titulo         = nuevoBusqueda
      if (nuevoModo === 'usuario')  filtros.nombre_usuario = nuevoBusqueda
      if (nuevoModo === 'etiqueta') filtros.etiqueta       = nuevoBusqueda
    }

    try {
      const data = await fetchPublicaciones({ skip: nuevoSkip, limit: LIMIT, ...filtros })
      setTotal(data.total)
      setPublicaciones(prev => acumular ? [...prev, ...data.items] : data.items)
      setSkip(nuevoSkip + LIMIT)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    const q    = searchParams.get('q') ?? ''
    const modo = searchParams.get('modo') ?? 'titulo'
    setBusqueda(q)
    setModoFiltro(modo)
    cargar(q, modo, 0, false)
  }, [])

  const handleBusqueda = (valor) => {
    setBusqueda(valor)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (valor) { params.set('q', valor); params.set('modo', modoFiltro) }
      setSearchParams(params)
      cargar(valor, modoFiltro, 0, false)
    }, 400)
  }

  const handleModo = (nuevoModo) => {
    setModoFiltro(nuevoModo)
    const params = new URLSearchParams()
    if (busqueda) { params.set('q', busqueda); params.set('modo', nuevoModo) }
    setSearchParams(params)
    cargar(busqueda, nuevoModo, 0, false)
  }

  const handleLimpiar = () => {
    setBusqueda('')
    setSearchParams({})
    cargar('', modoFiltro, 0, false)
  }

  const handleVerMas = () => cargar(busqueda, modoFiltro, skip, true)

  const modos = [
    { key: 'titulo',   label: 'Título',   icon: BookOpen },
    { key: 'usuario',  label: 'Autor',    icon: User },
    { key: 'etiqueta', label: 'Etiqueta', icon: Tag },
  ]

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* ── Hero (igual que Exámenes/Biblioteca) ────────────── */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Publicaciones</h1>
          <p className={styles.heroSub}>
            Ideas, análisis y reflexiones de nuestra comunidad de lectores
          </p>

          {/* Buscador centrado dentro del hero */}
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={
                modoFiltro === 'titulo'   ? 'Buscar por título…' :
                modoFiltro === 'usuario'  ? 'Buscar por nombre del autor…' :
                                            'Buscar por etiqueta…'
              }
              value={busqueda}
              onChange={e => handleBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className={styles.clearBtn} onClick={handleLimpiar}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Selector de modo debajo del buscador */}
          <div className={styles.modoSelector}>
            {modos.map(m => {
              const Icon = m.icon
              return (
                <button
                  key={m.key}
                  className={`${styles.modoBtn} ${modoFiltro === m.key ? styles.modoBtnActive : ''}`}
                  onClick={() => handleModo(m.key)}
                >
                  <Icon size={13} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className={styles.statsBar}>
            <span className={styles.statsText}>
              {busqueda
                ? `${total} resultado${total !== 1 ? 's' : ''} para "${busqueda}"`
                : `${total} publicación${total !== 1 ? 'es' : ''}`
              }
            </span>
          </div>
        )}

        {/* ── Contenido ─────────────────────────────────────────── */}
        <main className={styles.main}>
          {loading && (
            <div className={styles.estado}>
              <Loader size={32} className={styles.spinner} />
              <span>Cargando publicaciones…</span>
            </div>
          )}

          {error && !loading && (
            <div className={styles.estado}>
              <AlertCircle size={36} className={styles.errorIcon} />
              <span className={styles.errorTxt}>No se pudieron cargar las publicaciones</span>
              <span className={styles.errorDetail}>{error}</span>
            </div>
          )}

          {!loading && !error && publicaciones.length === 0 && (
            <div className={styles.estado}>
              <Feather size={48} className={styles.emptyIcon} />
              <span className={styles.emptyTxt}>
                {busqueda ? 'Sin resultados para tu búsqueda' : 'Aún no hay publicaciones'}
              </span>
              {busqueda && (
                <button className={styles.btnLimpiar} onClick={handleLimpiar}>
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}

          {!loading && !error && publicaciones.length > 0 && (
            <>
              <div className={styles.grid}>
                {publicaciones.map(pub => (
                  <PublicacionCard
                    key={pub.id_publicacion}
                    pub={pub}
                    onClick={() => navigate(`/publicaciones/${pub.id_publicacion}`)}
                  />
                ))}
              </div>

              {hayMas && (
                <div className={styles.verMasWrap}>
                  <button
                    className={styles.btnVerMas}
                    onClick={handleVerMas}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? <><Loader size={15} className={styles.spinnerSmall} /> Cargando…</>
                      : <>Ver más publicaciones</>
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}