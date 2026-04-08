import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, Loader, AlertCircle,
  BookOpen, WifiOff, CheckCircle, Info, Users,
} from 'lucide-react'
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
import styles from './RecursoViewer.module.css'
import NotasCompartidasPanel from '../NotasCompartidasPanel'

function resolverEstrategia(urlType, tieneUrl, tieneContenido) {
  if (!tieneUrl && tieneContenido) return ESTRATEGIA.TEXTO
  return 'otro'
}

export default function RecursoViewer({ onRecursoLoaded }) {
  const { idRecurso }   = useParams()
  const { token, user } = useAuth()
  const navigate        = useNavigate()
  
  const [mostrarNotas, setMostrarNotas] = useState(false)
  const [recurso,   setRecurso]   = useState(null)
  const [olData,    setOlData]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [esOffline, setEsOffline] = useState(false)

  const mediaRef = useRef(null)

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

  useEffect(() => { cargarRecurso() }, [idRecurso, token])

  async function cargarRecurso() {
    setLoading(true)
    setError(null)
    try {
      const data = await recursosService.getById(idRecurso, token)
      setRecurso(data)
      setEsOffline(false)
      onRecursoLoaded?.(data)
      if (data.external_id) fetchOpenLibraryData(data.external_id)
      setLoading(false)
      return
    } catch { /* sin red */ }

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

  const fetchOpenLibraryData = async (workId) => {
    try {
      const res  = await fetch(`https://openlibrary.org/works/${workId}.json`)
      const data = await res.json()
      setOlData(data)
    } catch { /* no crítico */ }
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

          {/* ── Progreso (solo con red) ── */}
          {!esOffline && recurso && (
            <div className={styles.progresoWrap}>

              {/* Barra solo texto */}
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

              {/* Mensaje para NO texto */}
              {estrategia !== ESTRATEGIA.TEXTO && (
                <div className={styles.progresoAviso}>
                  <Info size={12} />
                  <span>
                    Este tipo de recurso (PDF, video, audio, etc.) no guarda progreso de lectura.
                  </span>
                </div>
              )}

              {/* Botón solo texto */}
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
            onClick={() => setMostrarNotas(true)}
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

      <main className={styles.viewer}>
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
        <div
          id="texto-contenido"
          className={styles.textContent}
        >
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

  if (esOffline && (urlType === URL_TYPE.DRIVE || urlType === URL_TYPE.YOUTUBE)) {
    return (
      <div className={styles.unknownWrap}>
        <WifiOff size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <p>Este tipo de recurso requiere conexión a internet.</p>
      </div>
    )
  }

  switch (urlType) {

    case URL_TYPE.DRIVE:
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
      return (
        <iframe
          src={`${urlNormalizada}#toolbar=1&navpanes=1`}
          className={styles.iframe}
          title={recurso.titulo}
        />
      )

    case URL_TYPE.GUTENBERG:
    case URL_TYPE.HTML:
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