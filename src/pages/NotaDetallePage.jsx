// src/pages/NotaDetallePage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, StickyNote, Calendar, User,
  Users, BookOpen, Copy, Check,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import styles from './Notadetallepage.module.css'
import { notasService } from "../services/api";

async function fetchNota(idNota) {
  const res = await notasService.getById(idNota)
  if (!res) throw new Error(`Error ${res.status}`)
  return res
}

function formatFechaLarga(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFechaRelativa(fechaStr) {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr)
  const ahora = new Date()
  const diffMs = ahora - fecha
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semana${Math.floor(diffDias / 7) > 1 ? 's' : ''}`
  if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} mes${Math.floor(diffDias / 30) > 1 ? 'es' : ''}`
  return 'Hace más de un año'
}

export default function NotaDetallePage() {
  const { idNota }          = useParams()
  const [searchParams]      = useSearchParams()
  const navigate            = useNavigate()

  // Parámetros opcionales pasados por query string para el botón "volver"
  const idRecurso   = searchParams.get('idRecurso')
  const tituloRecurso = searchParams.get('titulo')   // título del recurso (opcional, para mostrar)

  const [nota,    setNota]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [copiado, setCopiado] = useState(false)

  // Token desde localStorage (igual que en el resto de la app)
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || null

  useEffect(() => {
    if (!idNota) return
    setLoading(true)
    setError(null)
    fetchNota(idNota, token)
      .then(data => setNota(data))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [idNota])

  const handleVolver = () => {
    if (idRecurso) {
      navigate(`/recursos/ver/${idRecurso}`)
    } else {
      navigate(-1)
    }
  }

  const handleCopiar = async () => {
    if (!nota?.contenido) return
    try {
      await navigator.clipboard.writeText(nota.contenido)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* sin permisos */ }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.fullCenter}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>Cargando nota…</span>
      </div>
    </>
  )

  if (error || !nota) return (
    <>
      <Navbar />
      <div className={styles.fullCenter}>
        <StickyNote size={40} className={styles.errorIcon} />
        <p className={styles.errorTitle}>No se pudo cargar la nota</p>
        <span className={styles.errorMsg}>{error}</span>
        <button className={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} />
          Volver
        </button>
      </div>
    </>
  )

  const palabras    = nota.contenido?.trim().split(/\s+/).length ?? 0
  const minLectura  = Math.max(1, Math.ceil(palabras / 200))

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* ── Fondo decorativo ──────────────────────────────────── */}
        <div className={styles.bgGlow} />

        <div className={styles.container}>

          {/* ── Breadcrumb / navegación ────────────────────────── */}
          <nav className={styles.breadcrumb}>
            <button className={styles.breadcrumbBtn} onClick={handleVolver}>
              <ArrowLeft size={14} />
              <span>
                {tituloRecurso
                  ? `Volver a "${decodeURIComponent(tituloRecurso)}"`
                  : idRecurso
                    ? 'Volver al recurso'
                    : 'Volver'}
              </span>
            </button>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>
              <Users size={12} />
              Notas compartidas
            </span>
          </nav>

          {/* ── Cabecera de la nota ────────────────────────────── */}
          <header className={styles.header}>
            <div className={styles.badgeRow}>
              <span className={styles.badgeCompartida}>
                <Users size={11} />
                Nota compartida
              </span>
              {idRecurso && (
                <span className={styles.badgeRecurso}>
                  <BookOpen size={11} />
                  Recurso #{idRecurso}
                </span>
              )}
            </div>

            <h1 className={styles.titulo}>{nota.titulo}</h1>

            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <User size={13} />
                Usuario #{nota.usuario.nombre}
              </span>
              <span className={styles.metaDot} />
              <span className={styles.metaItem}>
                <Calendar size={13} />
                {formatFechaRelativa(nota.fecha_creacion)}
              </span>
              <span className={styles.metaDot} />
              <span className={styles.metaItem}>
                ~{minLectura} min de lectura
              </span>
            </div>
          </header>

          {/* ── Divider decorativo ─────────────────────────────── */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <StickyNote size={14} className={styles.dividerIcon} />
            <div className={styles.dividerLine} />
          </div>

          {/* ── Contenido ──────────────────────────────────────── */}
          <article className={styles.contenidoWrap}>
            <p className={styles.contenido}>{nota.contenido}</p>
          </article>

          {/* ── Footer con acciones ────────────────────────────── */}
          <footer className={styles.footer}>
            <div className={styles.footerMeta}>
              <span className={styles.footerFecha}>
                Creada el {formatFechaLarga(nota.fecha_creacion)}
              </span>
              {nota.fecha_actualizacion !== nota.fecha_creacion && (
                <span className={styles.footerFecha}>
                  · Editada el {formatFechaLarga(nota.fecha_actualizacion)}
                </span>
              )}
            </div>

            <div className={styles.footerActions}>
              <button className={styles.btnCopiar} onClick={handleCopiar}>
                {copiado ? <Check size={14} /> : <Copy size={14} />}
                {copiado ? 'Copiado' : 'Copiar texto'}
              </button>

              <button className={styles.btnVolverFooter} onClick={handleVolver}>
                <ArrowLeft size={14} />
                {idRecurso ? 'Volver al recurso' : 'Volver'}
              </button>
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}