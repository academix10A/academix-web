import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Loader, AlertCircle, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { recursosService } from '../../services/api'
import { getYoutubeEmbedUrl } from '../../services/urlDetector'
import styles from './VideoViewer.module.css'

export default function VideoViewer() {
  const { idRecurso }   = useParams()
  const { token }       = useAuth()
  const navigate        = useNavigate()

  const [recurso, setRecurso]         = useState(null)
  const [similares, setSimilares]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!token) return
    recursosService.getById(idRecurso, token)
      .then(data => {
        setRecurso(data)
        return recursosService.getAll(token).then(todos => {
          const arr = Array.isArray(todos) ? todos : todos.items ?? []
          const filtrados = arr.filter(r =>
            String(r.id_recurso) !== String(idRecurso) &&
            String(r.id_tipo)    === String(data.id_tipo) &&
            String(r.id_subtema) === String(data.id_subtema)
          )
          setSimilares(filtrados)
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [idRecurso, token])

  if (loading) return (
    <div className={styles.centerWrap}>
      <Loader size={32} className={styles.spinner} />
    </div>
  )

  if (error || !recurso) return (
    <div className={styles.centerWrap}>
      <AlertCircle size={32} style={{ color: '#fc8181' }} />
      <p>No se pudo cargar el video</p>
    </div>
  )

  const embedUrl = getYoutubeEmbedUrl(recurso.url_archivo)

  return (
    <div className={styles.page}>

      {/*  Sidebar videos similares */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>

        {/* Botón toggle — siempre visible */}
        <button
          className={styles.toggleBtn}
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'Cerrar' : 'Ver videos similares'}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Contenido del sidebar — solo visible cuando está abierto */}
        {sidebarOpen && (
          <div className={styles.sidebarContent}>
            <p className={styles.sidebarTitle}>Videos similares</p>
            {similares.length === 0 ? (
              <p className={styles.sidebarEmpty}>No hay más videos en este tema</p>
            ) : (
              <div className={styles.videoList}>
                {similares.map(v => (
                  <button
                    key={v.id_recurso}
                    className={styles.videoItem}
                    onClick={() => navigate(`/recursos/ver/${v.id_recurso}`)}
                  >
                    {/* Miniatura de YouTube */}
                    <div className={styles.thumbnail}>
                      <img
                        src={getYoutubeThumbnail(v.url_archivo)}
                        alt={v.titulo}
                        className={styles.thumbnailImg}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <div className={styles.playOverlay}>
                        <Play size={16} />
                      </div>
                    </div>
                    <p className={styles.videoTitle}>{v.titulo}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>

      {/*  Video player principal  */}
      <main className={styles.playerWrap}>

        {/* Header del video */}
        <div className={styles.videoHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Regresar
          </button>
          <h1 className={styles.videoTitulo}>{recurso.titulo}</h1>
          <a
            href={recurso.url_archivo}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            <ExternalLink size={14} />
            Ver en YouTube
          </a>
        </div>

        {/* iframe YouTube */}
        <div className={styles.iframeWrap}>
          <iframe
            src={embedUrl}
            className={styles.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={recurso.titulo}
          />
        </div>

        {/* Descripción */}
        {recurso.descripcion && (
          <div className={styles.descripcionWrap}>
            <p className={styles.descripcion}>{recurso.descripcion}</p>
          </div>
        )}

      </main>
    </div>
  )
}

function getYoutubeThumbnail(url) {
  if (!url) return ''
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return `https://img.youtube.com/vi/${watchMatch[1]}/mqdefault.jpg`
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return `https://img.youtube.com/vi/${shortMatch[1]}/mqdefault.jpg`
  return ''
}