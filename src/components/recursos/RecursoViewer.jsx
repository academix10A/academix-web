// src/components/recursos/RecursoViewer.jsx
// Visor universal — detecta el tipo de URL y renderiza el player correcto
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Loader, AlertCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { recursosService } from '../../services/api'
import {
  detectUrlType, URL_TYPE,
  getDriveEmbedUrl, getYoutubeEmbedUrl,
} from '../../services/urlDetector'
import styles from './RecursoViewer.module.css'

export default function RecursoViewer({ onRecursoLoaded }) {
  const { idRecurso }     = useParams()
  const { token }         = useAuth()
  const navigate          = useNavigate()

  const [recurso, setRecurso]   = useState(null)
  const [olData, setOlData]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    recursosService.getById(idRecurso, token)
      .then(data => {
        setRecurso(data)
        onRecursoLoaded?.(data)
        if (data.external_id) {
          fetchOpenLibraryData(data.external_id)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [idRecurso, token])

  // 2 — Traer metadata de Open Library si aplica
  const fetchOpenLibraryData = async (workId) => {
    try {
      const res  = await fetch(`https://openlibrary.org/works/${workId}.json`)
      const data = await res.json()
      setOlData(data)
    } catch {
      // Si falla Open Library, no es crítico — el recurso sigue mostrándose
    }
  }

  const decodeHtml = (str) => {
    if (!str) return str
    const txt = document.createElement('textarea')
    txt.innerHTML = str
    return txt.value
  }

  if (loading) return (
    <div className={styles.centerWrap}>
      <Loader size={32} className={styles.spinner} />
      <p>Cargando recurso…</p>
    </div>
  )

  if (error || !recurso) return (
    <div className={styles.centerWrap}>
      <AlertCircle size={32} style={{ color: '#fc8181' }} />
      <p>No se pudo cargar el recurso</p>
      <span className={styles.errorMsg}>{error}</span>
    </div>
  )

  const urlType  = detectUrlType(recurso.url_archivo)
  const coverUrl = olData
    ? `https://covers.openlibrary.org/b/id/${olData.covers?.[0]}-L.jpg`
    : null

  return (
    <div className={styles.page}>

      {/* ── Sidebar con info del recurso ── */}
      <aside className={styles.sidebar}>
        {/* Portada Open Library si existe */}
        {coverUrl && (
          <img src={coverUrl} alt={recurso.titulo} className={styles.cover} />
        )}

        {!coverUrl && (
          <div className={styles.coverPlaceholder}>
            <BookOpen size={48} />
          </div>
        )}

        <div className={styles.meta}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} />
            <span>Regresar</span>
          </button>

          <h1 className={styles.titulo}>{recurso.titulo}</h1>

          {olData?.description && (
            <p className={styles.descripcion}>
              {typeof olData.description === 'string'
                ? olData.description
                : olData.description?.value ?? ''}
            </p>
          )}

          {!olData && recurso.descripcion && (
            <p className={styles.descripcion}>{decodeHtml(recurso.descripcion)}</p>
          )}

          <a
            href={recurso.url_archivo}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            <ExternalLink size={14} />
            Examen
          </a>
        </div>
      </aside>

      {/* ── Visor principal ── */}
      <main className={styles.viewer}>
        <ViewerContent recurso={recurso} urlType={urlType} />
      </main>
    </div>
  )
}

// ── Renderiza el player correcto según el tipo de URL ──────────────
function ViewerContent({ recurso, urlType }) {
  const url = recurso.url_archivo

  switch (urlType) {

    case URL_TYPE.DRIVE:
      return (
        <iframe
          src={getDriveEmbedUrl(url)}
          className={styles.iframe}
          allow="autoplay"
          title={recurso.titulo}
        />
      )

    case URL_TYPE.YOUTUBE:
      return (
        <iframe
          src={getYoutubeEmbedUrl(url)}
          className={styles.iframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
          title={recurso.titulo}
        />
      )

    case URL_TYPE.PDF:
      return (
        <iframe
          src={`${url}#toolbar=1&navpanes=1`}
          className={styles.iframe}
          title={recurso.titulo}
        />
      )

    case URL_TYPE.GUTENBERG:
    case URL_TYPE.HTML:
    case URL_TYPE.ARCHIVE:
      return (
        <iframe
          src={url}
          className={styles.iframe}
          title={recurso.titulo}
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      )

    case URL_TYPE.AUDIO:
      return (
        <div className={styles.audioWrap}>
          <BookOpen size={64} className={styles.audioIcon} />
          <p className={styles.audioTitle}>{recurso.titulo}</p>
          <audio controls className={styles.audioPlayer}>
            <source src={url} />
            Tu navegador no soporta audio.
          </audio>
        </div>
      )

    case URL_TYPE.VIDEO:
      return (
        <video controls className={styles.video}>
          <source src={url} />
          Tu navegador no soporta video.
        </video>
      )

    default:
      return (
        <div className={styles.unknownWrap}>
          <AlertCircle size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <p>No se puede previsualizar este recurso directamente.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.openBtn}
          >
            <ExternalLink size={16} />
            Abrir recurso
          </a>
        </div>
      )
  }
}