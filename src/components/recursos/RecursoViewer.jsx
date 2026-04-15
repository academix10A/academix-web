import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, Loader, AlertCircle,
  BookOpen, WifiOff, CheckCircle, Info, Users,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useAuth } from '../../hooks/useAuth'
import { recursosService } from '../../services/api'
import {
  detectUrlType, URL_TYPE,
  getDriveEmbedUrl, getYoutubeEmbedUrl,
  resolveUrl,
} from '../../services/urlDetector'
import OfflineButton from './OfflineButton'
import { obtenerMetadata } from '../../services/offlineService'
import { useProgreso, ESTRATEGIA } from '../../hooks/useProgreso'
import { useTextSelection } from '../../hooks/useTextSelection'
import AIPanel from './Aipanel'
import styles from './RecursoViewer.module.css'
import NotasCompartidasPanel from '../NotasCompartidasPanel'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

const PROXY = `${import.meta.env.VITE_API_URL}
`

const extractDriveFileId = (url) => {
  if (!url) return null
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function resolverEstrategia(urlType, tieneUrl, tieneContenido) {
  if (!tieneUrl && tieneContenido) return ESTRATEGIA.TEXTO
  return 'otro'
}

export default function RecursoViewer({ onRecursoLoaded }) {
  const { idRecurso }   = useParams()
  const { token, user } = useAuth()
  const navigate        = useNavigate()

  const [mostrarNotas, setMostrarNotas]           = useState(false)
  const [recurso, setRecurso]                     = useState(null)
  const [olData, setOlData]                       = useState(null)
  const [coverUrl, setCoverUrl]                   = useState(null)
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState(null)
  const [esOffline, setEsOffline]                 = useState(false)
  const [panelAbierto, setPanelAbierto]           = useState(false)
  const [textoSeleccionado, setTextoSeleccionado] = useState(null)

  const mediaRef  = useRef(null)
  const viewerRef = useRef(null)

  const [selection, clearSelection] = useTextSelection(viewerRef)

  const tieneUrl       = !!recurso?.url_archivo?.trim()
  const tieneContenido = !!recurso?.contenido?.trim()
  const urlNormalizada = tieneUrl ? resolveUrl(recurso.url_archivo) : null
  const urlType        = tieneUrl ? detectUrlType(urlNormalizada) : null
  const estrategia     = recurso
    ? resolverEstrategia(urlType, tieneUrl, tieneContenido)
    : null

  const usarProgreso = estrategia === ESTRATEGIA.TEXTO

  const {
    porcentaje,
    completado,
    ultimaPosicion,
    marcarCompletado,
  } = useProgreso(
    recurso && !esOffline && usarProgreso ? parseInt(idRecurso) : null,
    estrategia,
    mediaRef,
  )

  // useEffect(() => {
  //   if (!selection.text) return
  //   setTextoSeleccionado(selection.text)
  //   setPanelAbierto(true)
  //   clearSelection()
  // }, [selection.text])

  useEffect(() => {
    if (!selection.text) return
    setTextoSeleccionado(selection.text)
    setPanelAbierto(true)
    setMostrarNotas(false)   // ← cierra notas al abrir IA
    clearSelection()
  }, [selection.text])

  useEffect(() => { cargarRecurso() }, [idRecurso, token])

  async function cargarRecurso() {
    setLoading(true)
    setError(null)
    try {
      const data = await recursosService.getById(idRecurso, token)
      setRecurso(data)
      setEsOffline(false)
      onRecursoLoaded?.(data)
      if (data.external_id && /^OL.*W$/i.test(data.external_id)) {
        fetchOpenLibraryData(data.external_id)
      }
      setLoading(false)
      return
    } catch { }

    try {
      const metadata = await obtenerMetadata(parseInt(idRecurso))
      if (metadata) {
        setRecurso(metadata)
        setEsOffline(true)
        onRecursoLoaded?.(metadata)
      } else {
        setError('No hay conexión y este recurso no está guardado offline.')
      }
    } catch {
      setError('No se pudo cargar el recurso.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!recurso?.url_archivo) {
      setCoverUrl(null)
      return
    }

    if (recurso.url_archivo.includes('archive.org/details/')) {
      const identifier = recurso.url_archivo.split('archive.org/details/')[1]?.split('/')[0]
      if (identifier) {
        setCoverUrl(`https://archive.org/services/img/${identifier}`)
        return
      }
    }

    const driveId = extractDriveFileId(recurso.url_archivo)
    if (driveId) {
      const driveThumbUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`
      setCoverUrl(`${PROXY}/proxy/portada?url=${encodeURIComponent(driveThumbUrl)}`)
      return
    }

    if (olData?.covers?.[0]) {
      const coverImgUrl = `https://covers.openlibrary.org/b/id/${olData.covers[0]}-L.jpg`
      setCoverUrl(`${PROXY}/proxy/portada?url=${encodeURIComponent(coverImgUrl)}`)
      return
    }

    setCoverUrl(null)
  }, [recurso, olData])

  const fetchOpenLibraryData = async (workId) => {
    try {
      const res  = await fetch(`https://openlibrary.org/works/${workId}.json`)
      const data = await res.json()
      setOlData(data)
    } catch { }
  }

  const decodeHtml = (str) => {
    if (!str) return str
    const txt = document.createElement('textarea')
    txt.innerHTML = str
    return txt.value
  }

  const esPremium = user?.rol === 'premium' || user?.rol === 'admin'

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

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <img
          src={coverUrl || '/book-placeholder.png'}
          alt={recurso.titulo}
          className={styles.cover}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/book-placeholder.png'
          }}
        />

        <div className={styles.meta}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} />
            <span>Regresar</span>
          </button>

          {esOffline && (
            <div className={styles.offlineBadge}>
              <WifiOff size={13} />
              <span>Modo offline</span>
            </div>
          )}

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

          {!esOffline && recurso && (
            <div className={styles.progresoWrap}>
              {estrategia === ESTRATEGIA.TEXTO && (
                <>
                  <div className={styles.progresoBar}>
                    <div
                      className={styles.progresoFill}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <span className={styles.progresoPct}>{porcentaje}% leído</span>
                </>
              )}

              {estrategia !== ESTRATEGIA.TEXTO && (
                <div className={styles.progresoAviso}>
                  <Info size={12} />
                  <span>
                    Este tipo de recurso (PDF, video, audio, etc.) no guarda progreso de lectura.
                  </span>
                </div>
              )}

              {estrategia === ESTRATEGIA.TEXTO && (
                completado ? (
                  <div className={styles.completadoBadge}>
                    <CheckCircle size={14} />
                    <span>Completado</span>
                  </div>
                ) : (
                  <button
                    className={styles.btnCompletado}
                    onClick={marcarCompletado}
                  >
                    <CheckCircle size={14} />
                    Marcar como leído
                  </button>
                )
              )}
            </div>
          )}

          {!esOffline && (
            <OfflineButton recurso={recurso} esPremium={esPremium} />
          )}

          <button
            className={styles.externalLink}
            onClick={() => navigate(`/examenes?subtema=${recurso.id_subtema}`)}
          >
            <BookOpen size={14} />
            Ver examen del tema
          </button>

          <button
            className={styles.notasBtn}
            onClick={() => { setMostrarNotas(true); setPanelAbierto(false) }}
          >
            <Users size={14} />
            Ver notas compartidas
          </button>

          {mostrarNotas && (
            <NotasCompartidasPanel
              idRecurso={parseInt(idRecurso)}
              token={token}
              onClose={() => setMostrarNotas(false)}
            />
          )}
        </div>
      </aside>

      <main ref={viewerRef} className={styles.viewer}>
        <ViewerContent
          recurso={recurso}
          urlNormalizada={urlNormalizada}
          urlType={urlType}
          tieneUrl={tieneUrl}
          tieneContenido={tieneContenido}
          esOffline={esOffline}
          estrategia={estrategia}
          ultimaPosicion={ultimaPosicion}
          mediaRef={mediaRef}
        />
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
    fetch(`${PROXY}/proxy/libro?url=${encodeURIComponent(url)}`)
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

function PdfJsViewer({ url, title }) {
  const [numPages, setNumPages]   = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageWidth, setPageWidth] = useState(900)
  const wrapRef = useRef(null)

  useEffect(() => {
    const updateWidth = () => {
      if (!wrapRef.current) return
      setPageWidth(Math.max(320, Math.min(wrapRef.current.clientWidth - 32, 1100)))
    }
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    if (wrapRef.current) observer.observe(wrapRef.current)
    window.addEventListener('resize', updateWidth)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  const pdfUrl = `${PROXY}/proxy/pdf?url=${encodeURIComponent(url)}`

  return (
    <div ref={wrapRef} className={styles.pdfWrap}>
      <div className={styles.pdfScrollArea}>
        <div className={styles.pdfToolbar}>
          <button
            className={styles.pdfNavBtn}
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <span className={styles.pdfCounter}>
            Página {pageNumber} de {numPages || '...'}
          </span>

          <button
            className={styles.pdfNavBtn}
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={!numPages || pageNumber >= numPages}
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>

        <div className={styles.pdfDocumentWrap}>
          <Document
            file={pdfUrl}
            loading={
              <div className={styles.pdfLoading}>
                <Loader size={28} className={styles.spinner} />
                <p>Cargando PDF…</p>
              </div>
            }
            error={
              <div className={styles.pdfError}>
                <AlertCircle size={28} />
                <p>No se pudo abrir el PDF.</p>
              </div>
            }
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages)
              setPageNumber(1)
            }}
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  )
}

function ViewerContent({
  recurso, urlNormalizada, urlType,
  tieneUrl, tieneContenido, esOffline,
  estrategia, ultimaPosicion, mediaRef,
}) {
  useEffect(() => {
    if (estrategia !== ESTRATEGIA.TEXTO) return
    const el = document.getElementById('texto-contenido')
    if (el && ultimaPosicion > 0) {
      setTimeout(() => { el.scrollTop = ultimaPosicion }, 100)
    }
  }, [ultimaPosicion, estrategia])

  if (!tieneUrl) {
    if (tieneContenido) {
      return (
        <div id="texto-contenido" className={styles.textContent}>
          <div className={styles.textBody} style={{ whiteSpace: 'pre-wrap' }}>
            {recurso.contenido}
          </div>
        </div>
      )
    }
    return (
      <div className={styles.unknownWrap}>
        <AlertCircle size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <p>Este recurso no tiene contenido disponible todavía.</p>
      </div>
    )
  }

  // if (esOffline && (urlType === URL_TYPE.DRIVE || urlType === URL_TYPE.YOUTUBE)) {
  //   return (
  //     <div className={styles.unknownWrap}>
  //       <WifiOff size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
  //       <p>Este tipo de recurso requiere conexión a internet.</p>
  //     </div>
  //   )
  // }

  switch (urlType) {
    case URL_TYPE.DRIVE:
      if (recurso.id_tipo === 1) {
        return <PdfJsViewer url={urlNormalizada} title={recurso.titulo} />
      }
      return (
        <iframe
          src={getDriveEmbedUrl(urlNormalizada)}
          className={styles.iframe}
          allow="autoplay"
          title={recurso.titulo}
        />
      )

    case URL_TYPE.YOUTUBE:
      return (
        <iframe
          src={getYoutubeEmbedUrl(urlNormalizada)}
          className={styles.iframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
          title={recurso.titulo}
        />
      )

    case URL_TYPE.PDF:
      return <PdfJsViewer url={urlNormalizada} title={recurso.titulo} />

    case URL_TYPE.GUTENBERG:
    case URL_TYPE.HTML:
      return <ProxyViewer url={urlNormalizada} />

    case URL_TYPE.ARCHIVE:
      return (
        <iframe
          src={urlNormalizada}
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
          <audio
            ref={mediaRef}
            controls
            className={styles.audioPlayer}
            onLoadedMetadata={() => {
              if (mediaRef.current && ultimaPosicion > 0) {
                mediaRef.current.currentTime = ultimaPosicion
              }
            }}
          >
            <source src={urlNormalizada} />
            Tu navegador no soporta audio.
          </audio>
        </div>
      )

    case URL_TYPE.VIDEO:
      return (
        <video
          ref={mediaRef}
          controls
          className={styles.video}
          onLoadedMetadata={() => {
            if (mediaRef.current && ultimaPosicion > 0) {
              mediaRef.current.currentTime = ultimaPosicion
            }
          }}
        >
          <source src={urlNormalizada} />
          Tu navegador no soporta video.
        </video>
      )

    default:
      return (
        <div className={styles.unknownWrap}>
          <AlertCircle size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <p>No se puede previsualizar este recurso directamente.</p>
          <a
            href={urlNormalizada}
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