// src/pages/PublicacionDetallePage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Tag, Clock, BookOpen, User,
  Calendar, Copy, Check, Feather, ChevronRight,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import styles from './PublicacionDetallePage.module.css'
import { publicacionesService } from '../services/api'

async function fetchPublicacion(id) {
  const res = await publicacionesService.getById(id)
  if (!res) throw new Error(`Error ${res.status}`)
  return res
}

function formatFechaLarga(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatRelativa(fechaStr) {
  if (!fechaStr) return ''
  const dias = Math.floor((Date.now() - new Date(fechaStr)) / 86400000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7)  return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semana${Math.floor(dias / 7) > 1 ? 's' : ''}`
  return formatFechaLarga(fechaStr)
}

function minLectura(texto) {
  if (!texto) return 1
  return Math.max(1, Math.ceil(texto.trim().split(/\s+/).length / 200))
}

// Divide el texto en párrafos para mejor presentación
function renderTexto(texto) {
  if (!texto) return null
  return texto.split(/\n\n+/).map((parrafo, i) => (
    <p key={i} className={styles.parrafo}>
      {parrafo.split('\n').map((linea, j) => (
        <span key={j}>
          {linea}
          {j < parrafo.split('\n').length - 1 && <br />}
        </span>
      ))}
    </p>
  ))
}

export default function PublicacionDetallePage() {
  const { idPublicacion } = useParams()
  const navigate          = useNavigate()

  const [pub,     setPub]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!idPublicacion) return
    setLoading(true)
    setError(null)
    fetchPublicacion(idPublicacion)
      .then(setPub)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [idPublicacion])

  const handleCopiar = async () => {
    if (!pub?.texto) return
    try {
      await navigator.clipboard.writeText(pub.texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* sin permisos */ }
  }

  const autor = pub?.usuario
    ? `${pub.usuario.nombre} ${pub.usuario.apellido_paterno}`
    : 'Autor desconocido'

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.fullCenter}>
        <div className={styles.spinner} />
        <span>Cargando publicación…</span>
      </div>
    </>
  )

  if (error || !pub) return (
    <>
      <Navbar />
      <div className={styles.fullCenter}>
        <Feather size={40} className={styles.errorIcon} />
        <p className={styles.errorTitle}>No se pudo cargar la publicación</p>
        <span className={styles.errorMsg}>{error}</span>
        <button className={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={14} />
          Volver
        </button>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* ── Fondo decorativo ────────────────────────────────── */}
        <div className={styles.bgDecor} />

        {/* ── Breadcrumb ──────────────────────────────────────── */}
        <nav className={styles.breadcrumb}>
          <Link to="/publicaciones" className={styles.breadcrumbLink}>
            <Feather size={12} />
            Publicaciones
          </Link>
          <ChevronRight size={12} className={styles.breadcrumbSep} />
          <span className={styles.breadcrumbCurrent}>{pub.titulo}</span>
        </nav>

        <div className={styles.layout}>

          {/* ── Columna principal ────────────────────────────── */}
          <article className={styles.article}>

            {/* Cabecera del artículo */}
            <header className={styles.articleHeader}>

              {/* Etiquetas */}
              {pub.etiquetas?.length > 0 && (
                <div className={styles.tags}>
                  {pub.etiquetas.map(e => (
                    <Link
                      key={e.id_etiqueta}
                      to={`/publicaciones?q=${encodeURIComponent(e.nombre)}&modo=etiqueta`}
                      className={styles.tag}
                    >
                      <Tag size={11} />
                      {e.nombre}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className={styles.titulo}>{pub.titulo}</h1>
              <p className={styles.descripcion}>{pub.descripcion}</p>

              {/* Meta del autor */}
              <div className={styles.autorRow}>
                <div className={styles.avatar}>
                  {autor.charAt(0).toUpperCase()}
                </div>
                <div className={styles.autorInfo}>
                  <span className={styles.autorNombre}>{autor}</span>
                  <div className={styles.autorMeta}>
                    <span className={styles.metaItem}>
                      <Calendar size={11} />
                      {formatRelativa(pub.fecha_creacion)}
                    </span>
                    <span className={styles.metaDot} />
                    <span className={styles.metaItem}>
                      <BookOpen size={11} />
                      {minLectura(pub.texto)} min de lectura
                    </span>
                  </div>
                </div>

                <button className={styles.btnCopiar} onClick={handleCopiar} title="Copiar texto">
                  {copiado ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </header>

            {/* Divisor editorial */}
            <div className={styles.divisor}>
              <div className={styles.divisorLinea} />
              <Feather size={14} className={styles.divisorIcon} />
              <div className={styles.divisorLinea} />
            </div>

            {/* Texto completo */}
            <div className={styles.cuerpo}>
              {renderTexto(pub.texto)}
            </div>

            {/* Footer del artículo */}
            <footer className={styles.articleFooter}>
              <div className={styles.footerFecha}>
                <Clock size={13} />
                Publicado el {formatFechaLarga(pub.fecha_creacion)}
              </div>

              <button
                className={styles.btnVolver}
                onClick={() => navigate('/publicaciones')}
              >
                <ArrowLeft size={14} />
                Volver a publicaciones
              </button>
            </footer>
          </article>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className={styles.sidebar}>

            {/* Card del autor */}
            <div className={styles.sideCard}>
              <p className={styles.sideCardLabel}>Autor</p>
              <div className={styles.sideAutor}>
                <div className={styles.avatarGrande}>
                  {autor.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={styles.sideAutorNombre}>{autor}</p>
                  <p className={styles.sideAutorSub}>Miembro de la comunidad</p>
                </div>
              </div>
              <Link
                to={`/publicaciones?q=${encodeURIComponent(pub.usuario?.nombre ?? '')}&modo=usuario`}
                className={styles.sideLink}
              >
                <User size={12} />
                Ver más publicaciones
              </Link>
            </div>

            {/* Card de etiquetas */}
            {pub.etiquetas?.length > 0 && (
              <div className={styles.sideCard}>
                <p className={styles.sideCardLabel}>Etiquetas</p>
                <div className={styles.sideTagsWrap}>
                  {pub.etiquetas.map(e => (
                    <Link
                      key={e.id_etiqueta}
                      to={`/publicaciones?q=${encodeURIComponent(e.nombre)}&modo=etiqueta`}
                      className={styles.sideTag}
                    >
                      <Tag size={11} />
                      {e.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Card de info */}
            <div className={styles.sideCard}>
              <p className={styles.sideCardLabel}>Información</p>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Clock size={13} className={styles.infoIcon} />
                  <div>
                    <p className={styles.infoVal}>{minLectura(pub.texto)} min</p>
                    <p className={styles.infoKey}>Lectura</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <BookOpen size={13} className={styles.infoIcon} />
                  <div>
                    <p className={styles.infoVal}>
                      {pub.texto?.trim().split(/\s+/).length ?? 0}
                    </p>
                    <p className={styles.infoKey}>Palabras</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}