// src/pages/NotasCompartidasPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, X, BookOpen, User, Loader,
  AlertCircle, StickyNote, Users, ChevronRight,
  Calendar,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import styles from './NotasCompartidasPage.module.css'
import { notasService } from '../services/api'
import { useAuth } from '../hooks/useAuth'

const LIMIT = 12

async function fetchNotasCompartidas() {
  const res = await notasService.getNotasCompartidas()
  if (!res) throw new Error(`Error al cargar notas`)
  return Array.isArray(res) ? res : res.notas ?? []
}

function formatRelativa(fechaStr) {
  if (!fechaStr) return ''
  const dias = Math.floor((Date.now() - new Date(fechaStr)) / 86400000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} sem.`
  return new Date(fechaStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatLarga(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function minLectura(texto) {
  return Math.max(1, Math.ceil((texto ?? '').trim().split(/\s+/).length / 200))
}

const ACCENT_COLORS = ['#d4af37', '#63b3ed', '#68d391', '#fc8181', '#b794f4', '#f6ad55']

function NotaCard({ nota, index, onClick }) {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length]
  const nombreUsuario = nota.usuario.nombre ?? `Usuario #${nota.id_usuario}`

  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.cardAccent} style={{ background: accentColor }} />
      <div className={styles.cardBody}>
        {nota.recurso && (
          <div className={styles.recursoBadge}>
            <BookOpen size={10} />
            {nota.recurso}
          </div>
        )}
        <h2 className={styles.cardTitulo}>{nota.titulo}</h2>
        <p className={styles.cardPreview}>{nota.contenido}</p>
      </div>
      <footer className={styles.cardFooter}>
        <div className={styles.cardAutor}>
          <div className={styles.avatarMini}>{nombreUsuario.charAt(0).toUpperCase()}</div>
          <span>{nombreUsuario}</span>
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>
            <Calendar size={11} />
            {formatRelativa(nota.fecha_creacion)}
          </span>
          <span className={styles.metaItem}>
            <BookOpen size={11} />
            ~{minLectura(nota.contenido)} min
          </span>
        </div>
        <ChevronRight size={14} className={styles.cardArrow} />
      </footer>
    </button>
  )
}

function NotaDetalle({ nota, onVolver }) {
  const [copiado, setCopiado] = useState(false)
  const nombreUsuario = nota.usuario.nombre ?? `Usuario #${nota.id_usuario}`

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(nota.contenido)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* sin permisos */ }
  }

  return (
    <div className={styles.detallePage}>
      <div className={styles.bgGlow} />

      <div className={styles.detalleContainer}>
        <nav className={styles.breadcrumb}>
          <button className={styles.breadcrumbBtn} onClick={onVolver}>
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
            Notas compartidas
          </button>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>
            <Users size={12} />
            Detalle de nota
          </span>
        </nav>

        <div className={styles.badgeRow}>
          <span className={styles.badgeCompartida}>
            <Users size={11} />
            Nota compartida
          </span>
          {nota.id_recurso && (
            <span className={styles.badgeRecurso}>
              <BookOpen size={11} />
              {nota.recurso ? nota.recurso : `Recurso #${nota.id_recurso}`}
            </span>
          )}
        </div>

        <h1 className={styles.dTitulo}>{nota.titulo}</h1>

        <div className={styles.dMetaRow}>
          <span className={styles.dMetaItem}>
            <User size={13} />
            {nombreUsuario}
          </span>
          <span className={styles.dMetaDot} />
          <span className={styles.dMetaItem}>
            <Calendar size={13} />
            {formatRelativa(nota.fecha_creacion)}
          </span>
          <span className={styles.dMetaDot} />
          <span className={styles.dMetaItem}>
            ~{minLectura(nota.contenido)} min de lectura
          </span>
        </div>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <StickyNote size={14} className={styles.dividerIcon} />
          <div className={styles.dividerLine} />
        </div>

        <article className={styles.contenidoWrap}>
          <p className={styles.contenido}>{nota.contenido}</p>
        </article>

        <footer className={styles.dFooter}>
          <div>
            <p className={styles.footerFecha}>Creada el {formatLarga(nota.fecha_creacion)}</p>
            {nota.fecha_actualizacion !== nota.fecha_creacion && (
              <p className={styles.footerFecha}>· Editada el {formatLarga(nota.fecha_actualizacion)}</p>
            )}
          </div>
          <div className={styles.footerActions}>
            <button className={styles.btnCopiar} onClick={handleCopiar}>
              {copiado ? '✓ Copiado' : '⧉ Copiar texto'}
            </button>
            <button className={styles.btnVolverFooter} onClick={onVolver}>
              <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
              Volver a notas
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function NotasCompartidasPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [notas,       setNotas]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [busqueda,    setBusqueda]    = useState(searchParams.get('q') ?? '')
  const [modo,        setModo]        = useState(searchParams.get('modo') ?? 'titulo')
  const [notaDetalle, setNotaDetalle] = useState(null)

  const debounceRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    fetchNotasCompartidas()
      .then(data => setNotas(data))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const notasFiltradas = notas.filter(n => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    if (modo === 'titulo')  return n.titulo?.toLowerCase().includes(q)
    if (modo === 'autor')   return (n.nombre_usuario ?? '').toLowerCase().includes(q)
    if (modo === 'recurso') return (n.recurso ?? '').toLowerCase().includes(q)
    return true
  })

  const handleBusqueda = (valor) => {
    setBusqueda(valor)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (valor) { params.set('q', valor); params.set('modo', modo) }
      setSearchParams(params)
    }, 300)
  }

  const handleModo = (nuevoModo) => {
    setModo(nuevoModo)
    const params = new URLSearchParams()
    if (busqueda) { params.set('q', busqueda); params.set('modo', nuevoModo) }
    setSearchParams(params)
  }

  const handleLimpiar = () => {
    setBusqueda('')
    setSearchParams({})
  }

  const placeholders = {
    titulo:  'Buscar por título de nota…',
    autor:   'Buscar por nombre del autor…',
    recurso: 'Buscar por nombre del recurso…',
  }

  if (notaDetalle) {
    return (
      <>
        <Navbar />
        <NotaDetalle nota={notaDetalle} onVolver={() => setNotaDetalle(null)} />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Notas compartidas</h1>
          <p className={styles.heroSub}>
            Explora las anotaciones de la comunidad por recurso o autor
          </p>

          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={placeholders[modo]}
              value={busqueda}
              onChange={e => handleBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className={styles.clearBtn} onClick={handleLimpiar}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.modoSelector}>
            {[
              { key: 'titulo',  label: 'Título',   Icon: StickyNote },
              { key: 'autor',   label: 'Autor',    Icon: User },
              { key: 'recurso', label: 'Recurso',  Icon: BookOpen },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                className={`${styles.modoBtn} ${modo === key ? styles.modoBtnActive : ''}`}
                onClick={() => handleModo(key)}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && (
          <div className={styles.statsBar}>
            <span className={styles.statsText}>
              {busqueda
                ? `${notasFiltradas.length} resultado${notasFiltradas.length !== 1 ? 's' : ''} para "${busqueda}"`
                : `${notas.length} nota${notas.length !== 1 ? 's' : ''} compartida${notas.length !== 1 ? 's' : ''}`
              }
            </span>
          </div>
        )}

        <main className={styles.main}>
          {loading && (
            <div className={styles.estado}>
              <Loader size={32} className={styles.spinner} />
              <span>Cargando notas…</span>
            </div>
          )}

          {error && !loading && (
            <div className={styles.estado}>
              <AlertCircle size={36} className={styles.errorIcon} />
              <span className={styles.errorTxt}>No se pudieron cargar las notas</span>
              <span className={styles.errorDetail}>{error}</span>
            </div>
          )}

          {!loading && !error && notas.length === 0 && (
            <div className={styles.estado}>
              <StickyNote size={48} className={styles.emptyIcon} />
              <span className={styles.emptyTxt}>Aún no hay notas compartidas</span>
            </div>
          )}

          {!loading && !error && notas.length > 0 && notasFiltradas.length === 0 && (
            <div className={styles.estado}>
              <Search size={36} className={styles.emptyIcon} />
              <span className={styles.emptyTxt}>Sin resultados para "{busqueda}"</span>
              <button className={styles.btnLimpiar} onClick={handleLimpiar}>Limpiar búsqueda</button>
            </div>
          )}

          {!loading && !error && notasFiltradas.length > 0 && (
            <div className={styles.grid}>
              {notasFiltradas.map((nota, i) => (
                <NotaCard
                  key={nota.id_nota ?? nota.id}
                  nota={nota}
                  index={i}
                  onClick={() => setNotaDetalle(nota)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}