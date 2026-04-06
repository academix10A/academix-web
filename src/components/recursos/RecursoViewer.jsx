// src/components/recursos/RecursoViewer.jsx
/*import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Loader, AlertCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { recursosService } from '../../services/api'
import {
  detectUrlType, URL_TYPE,
  getDriveEmbedUrl, getYoutubeEmbedUrl,
} from '../../services/urlDetector'
import { useTextSelection } from '../../hooks/useTextSelection'
import AITooltip from './AITooltip'
import styles from './RecursoViewer.module.css'
 
export default function RecursoViewer({ onRecursoLoaded }) {
  const { idRecurso }   = useParams()
  const { token }       = useAuth()
  const navigate        = useNavigate()
 
  const [recurso, setRecurso] = useState(null)
  const [olData, setOlData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
 
  const viewerRef = useRef(null)
  const [selection, clearSelection] = useTextSelection(viewerRef)
 
  useEffect(() => {
    recursosService.getById(idRecurso, token)
      .then(data => {
        setRecurso(data)
        onRecursoLoaded?.(data)
        if (data.external_id) fetchOpenLibraryData(data.external_id)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [idRecurso, token])
 
  const fetchOpenLibraryData = async (workId) => {
    try {
      const res  = await fetch(`https://openlibrary.org/works/${workId}.json`)
      const data = await res.json()
      setOlData(data)
    } catch {
      // no crítico
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
 
      <aside className={styles.sidebar}>
        {coverUrl
          ? <img src={coverUrl} alt={recurso.titulo} className={styles.cover} />
          : <div className={styles.coverPlaceholder}><BookOpen size={48} /></div>
        }
 
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
 
          <button
            className={styles.externalLink}
            onClick={() => navigate(`/examenes?subtema=${recurso.id_subtema}`)}
          >
            <BookOpen size={14} />
            Ver examen del tema
          </button>
        </div>
      </aside>
 
      <main ref={viewerRef} className={styles.viewer}>
        <ViewerContent recurso={recurso} urlType={urlType} />
        <AITooltip
          text={selection.text}
          rect={selection.rect}
          onClose={clearSelection}
        />
      </main>
 
    </div>
  )
}
 
function ProxyViewer({ url }) {
  const [html, setHtml]       = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
 
  useEffect(() => {
    setLoading(true)
    fetch(`http://127.0.0.1:8000/api/proxy/libro?url=${encodeURIComponent(url)}`)
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar el libro')
        return r.text()
      })
      .then(data => { setHtml(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [url])
 
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)' }}>
      <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: '#d4af37' }} />
    </div>
  )
 
  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)' }}>
      <p>{error}</p>
    </div>
  )
 
  return (
    <div
      className={styles.proxyContent}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
 
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
      return <ProxyViewer url={url} />
 
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
}*/
// src/components/recursos/RecursoViewer.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Loader, AlertCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { recursosService } from '../../services/api'
import {
  detectUrlType, URL_TYPE,
  getDriveEmbedUrl, getYoutubeEmbedUrl,
} from '../../services/urlDetector'
import { useTextSelection } from '../../hooks/useTextSelection'
import AIPanel from './AIPanel'
import styles from './RecursoViewer.module.css'

export default function RecursoViewer({ onRecursoLoaded }) {
  const { idRecurso }   = useParams()
  const { token }       = useAuth()
  const navigate        = useNavigate()

  const [recurso, setRecurso]           = useState(null)
  const [olData, setOlData]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [textoSeleccionado, setTextoSeleccionado] = useState(null)

  const viewerRef = useRef(null)
  const [selection, clearSelection] = useTextSelection(viewerRef)

  useEffect(() => {
    if (!selection.text) return
    setTextoSeleccionado(selection.text)
    setPanelAbierto(true)
    clearSelection()
  }, [selection.text])

  useEffect(() => {
    recursosService.getById(idRecurso, token)
      .then(data => {
        setRecurso(data)
        onRecursoLoaded?.(data)
        if (data.external_id) fetchOpenLibraryData(data.external_id)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [idRecurso, token])

  const fetchOpenLibraryData = async (workId) => {
    try {
      const res  = await fetch(`https://openlibrary.org/works/${workId}.json`)
      const data = await res.json()
      setOlData(data)
    } catch {
      // no crítico
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

      <aside className={styles.sidebar}>
        {coverUrl
          ? <img src={coverUrl} alt={recurso.titulo} className={styles.cover} />
          : <div className={styles.coverPlaceholder}><BookOpen size={48} /></div>
        }

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

          <button
            className={styles.externalLink}
            onClick={() => navigate(`/examenes?subtema=${recurso.id_subtema}`)}
          >
            <BookOpen size={14} />
            Ver examen del tema
          </button>
        </div>
      </aside>

      <main ref={viewerRef} className={styles.viewer}>
        <ViewerContent recurso={recurso} urlType={urlType} />
      </main>

      {panelAbierto && (
        <AIPanel
          selectedText={textoSeleccionado}
          onClose={() => setPanelAbierto(false)}
        />
      )}

    </div>
  )
}

function ProxyViewer({ url }) {
  const [html, setHtml]       = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const containerRef          = useRef(null)

  useEffect(() => {
    setLoading(true)
    fetch(`http://127.0.0.1:8000/api/proxy/libro?url=${encodeURIComponent(url)}`)
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar el libro')
        return r.text()
      })
      .then(data => { setHtml(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [url])

  useEffect(() => {
    if (!html || !containerRef.current) return
    const host = containerRef.current
    if (!host.shadowRoot) {
      host.attachShadow({ mode: 'open' })
    }
    host.shadowRoot.innerHTML = html
  }, [html])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)' }}>
      <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: '#d4af37' }} />
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)' }}>
      <p>{error}</p>
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={styles.proxyContent}
    />
  )
}

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
      return <ProxyViewer url={url} />

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