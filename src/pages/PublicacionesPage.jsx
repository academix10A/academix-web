// src/pages/PublicacionesPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, X, Tag, User, BookOpen,
  Clock, ArrowRight, Loader, AlertCircle, Feather,
  Plus, Pencil, Trash2, Check,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import styles from './PublicacionesPage.module.css'
import { publicacionesService } from '../services/api'
import { useAuth } from '../hooks/useAuth'

// ── Helpers ────────────────────────────────────────────────────────────────
function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
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

const ACCENT_COLORS = ['#d4af37', '#63b3ed', '#68d391', '#fc8181', '#b794f4', '#f6ad55']

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, tipo = 'success', onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3000)
    return () => clearTimeout(t)
  }, [msg])
  return (
    <div className={`${styles.toast} ${tipo === 'error' ? styles.toastError : styles.toastSuccess}`}>
      {tipo === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  )
}

// ── Modal de formulario (crear / editar) ───────────────────────────────────
function FormModal({ pubInicial, onClose, onSaved }) {
  const esEdicion = !!pubInicial
  const [titulo,      setTitulo]      = useState(pubInicial?.titulo      ?? '')
  const [descripcion, setDescripcion] = useState(pubInicial?.descripcion ?? '')
  const [texto,       setTexto]       = useState(pubInicial?.texto       ?? '')
  const [etiquetas,   setEtiquetas]   = useState(
    pubInicial?.etiquetas?.map(e => (typeof e === 'string' ? e : e.nombre)) ?? []
  )
  const [tagInput, setTagInput] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)

  const valido = titulo.trim() && texto.trim()

  const addTag = () => {
    const v = tagInput.trim().replace(/,+$/, '')
    if (v && !etiquetas.includes(v)) setEtiquetas(prev => [...prev, v])
    setTagInput('')
  }
  const removeTag = (i) => setEtiquetas(prev => prev.filter((_, idx) => idx !== i))
  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
    if (e.key === 'Backspace' && !tagInput && etiquetas.length) setEtiquetas(prev => prev.slice(0, -1))
  }

  const handleSubmit = async () => {
    if (!valido) return
    setSaving(true)
    setError(null)
    const payload = { titulo: titulo.trim(), descripcion: descripcion.trim(), texto: texto.trim(), etiquetas: etiquetas.filter(e => e.trim() !== '') }
    try {
      let resultado
      if (esEdicion) {
        resultado = await publicacionesService.updatePublicacion(pubInicial.id_publicacion, payload)
      } else {
        resultado = await publicacionesService.createPublicacion(payload)
      }
      onSaved(resultado, esEdicion)
    } catch (err) {
      setError(err.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlayWrap} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{esEdicion ? 'Editar publicación' : 'Nueva publicación'}</span>
          <button className={styles.btnClose} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.modalBody}>
          {error && (
            <div className={styles.formError}><AlertCircle size={14} />{error}</div>
          )}
          <div className={styles.field}>
            <label>Título</label>
            <input type="text" placeholder="Título de tu publicación…" value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={200} />
          </div>
          <div className={styles.field}>
            <label>Descripción <span className={styles.fieldOpt}>(opcional)</span></label>
            <input type="text" placeholder="Un breve resumen…" value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={300} />
          </div>
          <div className={styles.field}>
            <label>Contenido</label>
            <textarea placeholder="Escribe tu artículo aquí…" value={texto} onChange={e => setTexto(e.target.value)} rows={7} />
          </div>
          <div className={styles.field}>
            <label>Etiquetas <span className={styles.fieldOpt}>(opcional)</span></label>
            <div className={styles.tagInputWrap} onClick={() => document.getElementById('tag-input-field')?.focus()}>
              {etiquetas.map((t, i) => (
                <span key={i} className={styles.tagPill}>
                  {t}
                  <button type="button" onClick={() => removeTag(i)}>×</button>
                </span>
              ))}
              <input
                id="tag-input-field"
                className={styles.tagInput}
                placeholder={etiquetas.length ? '' : 'Escribe y presiona Enter…'}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={addTag}
              />
            </div>
            <span className={styles.tagHint}>Presiona Enter o coma para añadir cada etiqueta</span>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={saving}>Cancelar</button>
          <button className={styles.btnSave} onClick={handleSubmit} disabled={!valido || saving}>
            {saving ? <><Loader size={14} className={styles.spinnerSm} /> Guardando…</> : esEdicion ? 'Guardar cambios' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal confirmación eliminación ─────────────────────────────────────────
function ConfirmModal({ titulo, onCancel, onConfirm, deleting }) {
  return (
    <div className={styles.confirmWrap}>
      <div className={styles.confirmBox}>
        <div className={styles.confirmIcon}><Trash2 size={22} /></div>
        <p className={styles.confirmTitle}>Eliminar publicación</p>
        <p className={styles.confirmSub}>
          ¿Seguro que quieres eliminar <strong>"{titulo}"</strong>? Esta acción no se puede deshacer.
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.btnCancel} onClick={onCancel} disabled={deleting}>Cancelar</button>
          <button className={styles.btnDelete} onClick={onConfirm} disabled={deleting}>
            {deleting ? <><Loader size={13} className={styles.spinnerSm} /> Eliminando…</> : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tarjeta explorar ───────────────────────────────────────────────────────
function PublicacionCard({ pub, onClick }) {
  const autor = pub.usuario
    ? `${pub.usuario.nombre} ${pub.usuario.apellido_paterno}`
    : 'Autor desconocido'
  const etiquetas = pub.etiquetas ?? []

  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.cardAccent} style={{ '--hue': (pub.id_publicacion * 47) % 360 }} />
      <div className={styles.cardBody}>
        {etiquetas.length > 0 && (
          <div className={styles.tags}>
            {etiquetas.slice(0, 3).map(e => (
              <span key={e.id_etiqueta ?? e} className={styles.tag}>
                <Tag size={10} />
                {typeof e === 'string' ? e : e.nombre}
              </span>
            ))}
            {etiquetas.length > 3 && <span className={styles.tagMore}>+{etiquetas.length - 3}</span>}
          </div>
        )}
        <h2 className={styles.cardTitulo}>{pub.titulo}</h2>
        <p className={styles.cardDesc}>{pub.descripcion}</p>
      </div>
      <footer className={styles.cardFooter}>
        <div className={styles.cardAutor}>
          <div className={styles.avatarMini}>{autor.charAt(0).toUpperCase()}</div>
          <span>{autor}</span>
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}><Clock size={11} />{formatRelativa(pub.fecha_creacion)}</span>
          <span className={styles.metaItem}><BookOpen size={11} />{minLectura(pub.texto)} min</span>
        </div>
        <ArrowRight size={14} className={styles.cardArrow} />
      </footer>
    </article>
  )
}

// ── Tarjeta mis publicaciones ──────────────────────────────────────────────
function MiPubCard({ pub, index, onEditar, onEliminar, onVer }) {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length]
  const etiquetas = pub.etiquetas?.map(e => (typeof e === 'string' ? e : e.nombre)) ?? []

  return (
    <article className={`${styles.card} ${styles.cardOwned}`}>
      <div className={styles.cardAccent} style={{ background: accentColor }} />
      <div className={styles.cardBody}>
        {etiquetas.length > 0 && (
          <div className={styles.tags}>
            {etiquetas.slice(0, 3).map((e, i) => (
              <span key={i} className={styles.tag}><Tag size={10} />{e}</span>
            ))}
            {etiquetas.length > 3 && <span className={styles.tagMore}>+{etiquetas.length - 3}</span>}
          </div>
        )}
        <h2 className={styles.cardTitulo}>{pub.titulo}</h2>
        <p className={styles.cardDesc}>{pub.descripcion || pub.texto}</p>
      </div>
      <footer className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}><Clock size={11} />{formatRelativa(pub.fecha_creacion)}</span>
          <span className={styles.metaDot} />
          <span className={styles.metaItem}><BookOpen size={11} />{minLectura(pub.texto)} min</span>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.btnIcon} onClick={() => onVer(pub.id_publicacion)} title="Ver">
            <ArrowRight size={13} />Ver
          </button>
          <button className={`${styles.btnIcon} ${styles.btnEdit}`} onClick={() => onEditar(pub)} title="Editar">
            <Pencil size={13} />Editar
          </button>
          <button className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => onEliminar(pub)} title="Eliminar">
            <Trash2 size={13} />Eliminar
          </button>
        </div>
      </footer>
    </article>
  )
}

// ── Tab: Explorar ──────────────────────────────────────────────────────────
function TabExplorar({ navigate }) {
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

  const cargar = useCallback(async (q, modo, nuevoSkip = 0, acumular = false) => {
    if (!acumular) setLoading(true); else setLoadingMore(true)
    setError(null)
    const filtros = {}
    if (q) {
      if (modo === 'titulo')   filtros.titulo         = q
      if (modo === 'usuario')  filtros.nombre_usuario = q
      if (modo === 'etiqueta') filtros.etiqueta       = q
    }
    try {
      const params = new URLSearchParams()
      params.set('skip', nuevoSkip); params.set('limit', LIMIT)
      Object.entries(filtros).forEach(([k, v]) => params.set(k, v))
      const data = await publicacionesService.getAllWithFilters(params)
      setTotal(data.total)
      setPublicaciones(prev => acumular ? [...prev, ...data.items] : data.items)
      setSkip(nuevoSkip + LIMIT)
    } catch (err) { setError(err.message) }
    finally { setLoading(false); setLoadingMore(false) }
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    const modo = searchParams.get('modo') ?? 'titulo'
    setBusqueda(q); setModoFiltro(modo)
    cargar(q, modo, 0, false)
  }, [])

  const handleBusqueda = (valor) => {
    setBusqueda(valor)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const p = new URLSearchParams()
      if (valor) { p.set('q', valor); p.set('modo', modoFiltro) }
      setSearchParams(p)
      cargar(valor, modoFiltro, 0, false)
    }, 400)
  }
  const handleModo = (m) => {
    setModoFiltro(m)
    const p = new URLSearchParams()
    if (busqueda) { p.set('q', busqueda); p.set('modo', m) }
    setSearchParams(p)
    cargar(busqueda, m, 0, false)
  }
  const handleLimpiar = () => { setBusqueda(''); setSearchParams({}); cargar('', modoFiltro, 0, false) }

  const modos = [
    { key: 'titulo',   label: 'Título',   Icon: BookOpen },
    { key: 'usuario',  label: 'Autor',    Icon: User },
    { key: 'etiqueta', label: 'Etiqueta', Icon: Tag },
  ]

  return (
    <>
      <div className={styles.subHero}>
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={
              modoFiltro === 'titulo' ? 'Buscar por título…' :
              modoFiltro === 'usuario' ? 'Buscar por nombre del autor…' :
              'Buscar por etiqueta…'
            }
            value={busqueda}
            onChange={e => handleBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className={styles.clearBtn} onClick={handleLimpiar}><X size={14} /></button>
          )}
        </div>
        <div className={styles.modoSelector}>
          {modos.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`${styles.modoBtn} ${modoFiltro === key ? styles.modoBtnActive : ''}`}
              onClick={() => handleModo(key)}
            >
              <Icon size={13} />{label}
            </button>
          ))}
        </div>
      </div>

      {!loading && !error && (
        <div className={styles.statsBar}>
          <span className={styles.statsText}>
            {busqueda
              ? `${total} resultado${total !== 1 ? 's' : ''} para "${busqueda}"`
              : `${total} publicación${total !== 1 ? 'es' : ''}`}
          </span>
        </div>
      )}

      <main className={styles.main}>
        {loading && <div className={styles.estado}><Loader size={32} className={styles.spinner} /><span>Cargando publicaciones…</span></div>}
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
            <span className={styles.emptyTxt}>{busqueda ? 'Sin resultados para tu búsqueda' : 'Aún no hay publicaciones'}</span>
            {busqueda && <button className={styles.btnLimpiar} onClick={handleLimpiar}>Limpiar búsqueda</button>}
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
                <button className={styles.btnVerMas} onClick={() => cargar(busqueda, modoFiltro, skip, true)} disabled={loadingMore}>
                  {loadingMore ? <><Loader size={15} className={styles.spinnerSm} /> Cargando…</> : 'Ver más publicaciones'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}

// ── Tab: Mis publicaciones ─────────────────────────────────────────────────
function TabMias({ navigate, onModalForm, onConfirmDelete, modalForm, onSaved, pubAEliminar, onCancelDelete, onConfirm, deleting, toast, onHideToast }) {
  const [publicaciones, setPublicaciones] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await publicacionesService.getMisPublicaciones()
      setPublicaciones(Array.isArray(data) ? data : data.items ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Exponer setter al padre para que pueda actualizar después de crear/editar/eliminar
  useEffect(() => {
    window.__setPubsMias = setPublicaciones
    return () => { delete window.__setPubsMias }
  }, [])

  return (
    <>
      {!loading && !error && (
        <div className={styles.statsBar}>
          <span className={styles.statsText}>
            {publicaciones.length} publicación{publicaciones.length !== 1 ? 'es' : ''} tuyas
          </span>
        </div>
      )}
      <main className={styles.main}>
        {toast && <Toast msg={toast.msg} tipo={toast.tipo} onHide={onHideToast} />}
        {loading && <div className={styles.estado}><Loader size={32} className={styles.spinner} /><span>Cargando tus publicaciones…</span></div>}
        {error && !loading && (
          <div className={styles.estado}>
            <AlertCircle size={36} className={styles.errorIcon} />
            <span className={styles.errorTxt}>No se pudieron cargar las publicaciones</span>
            <span className={styles.errorDetail}>{error}</span>
            <button className={styles.btnLimpiar} onClick={cargar}>Reintentar</button>
          </div>
        )}
        {!loading && !error && publicaciones.length === 0 && (
          <div className={styles.estado}>
            <Feather size={52} className={styles.emptyIcon} />
            <span className={styles.emptyTxt}>Aún no tienes publicaciones</span>
            <p className={styles.emptySub}>Comparte ideas y reflexiones con la comunidad</p>
            <button className={styles.btnNueva} onClick={() => onModalForm('crear')}>
              <Plus size={15} />Crear mi primera publicación
            </button>
          </div>
        )}
        {!loading && !error && publicaciones.length > 0 && (
          <div className={styles.grid}>
            {publicaciones.map((pub, i) => (
              <MiPubCard
                key={pub.id_publicacion}
                pub={pub}
                index={i}
                onVer={(id) => navigate(`/publicaciones/${id}`)}
                onEditar={(pub) => onModalForm(pub)}
                onEliminar={(pub) => onConfirmDelete(pub)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}

// ── Página principal ───────────────────────────────────────────────────────
export default function PublicacionesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tabInicial = searchParams.get('tab') === 'mias' ? 'mias' : 'explorar'
  const [tabActual, setTabActual] = useState(tabInicial)

  const [modalForm,    setModalForm]    = useState(null)
  const [pubAEliminar, setPubAEliminar] = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [toast,        setToast]        = useState(null)

  const showToast = (msg, tipo = 'success') => setToast({ msg, tipo })

  const handleSaved = (resultado, esEdicion) => {
    if (esEdicion) {
      window.__setPubsMias?.(prev =>
        prev.map(p => p.id_publicacion === resultado.id_publicacion ? resultado : p)
      )
      showToast('Publicación actualizada correctamente')
    } else {
      window.__setPubsMias?.(prev => [resultado, ...prev])
      showToast('Publicación creada exitosamente')
    }
    setModalForm(null)
  }

  const handleEliminar = async () => {
    if (!pubAEliminar) return
    setDeleting(true)
    try {
      await publicacionesService.deletePublicacion(pubAEliminar.id_publicacion)
      window.__setPubsMias?.(prev => prev.filter(p => p.id_publicacion !== pubAEliminar.id_publicacion))
      showToast('Publicación eliminada')
    } catch (err) {
      showToast(err.message ?? 'Error al eliminar', 'error')
    } finally {
      setDeleting(false)
      setPubAEliminar(null)
    }
  }

  return (
    <>
      <Navbar />

      {modalForm !== null && (
        <FormModal
          pubInicial={modalForm === 'crear' ? null : modalForm}
          onClose={() => setModalForm(null)}
          onSaved={handleSaved}
        />
      )}
      {pubAEliminar && (
        <ConfirmModal
          titulo={pubAEliminar.titulo}
          onCancel={() => setPubAEliminar(null)}
          onConfirm={handleEliminar}
          deleting={deleting}
        />
      )}

      <div className={styles.page}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Publicaciones</h1>
          <p className={styles.heroSub}>Ideas, análisis y reflexiones de nuestra comunidad de lectores</p>

          <div className={styles.heroTabs}>
            <button
              className={`${styles.heroTab} ${tabActual === 'explorar' ? styles.heroTabActive : ''}`}
              onClick={() => setTabActual('explorar')}
            >
              <Feather size={14} />
              Explorar
            </button>
            <button
              className={`${styles.heroTab} ${tabActual === 'mias' ? styles.heroTabActive : ''}`}
              onClick={() => setTabActual('mias')}
            >
              <User size={14} />
              Mis publicaciones
            </button>
          </div>

          {tabActual === 'mias' && (
            <button className={styles.btnNueva} onClick={() => setModalForm('crear')}>
              <Plus size={15} />
              Nueva publicación
            </button>
          )}
        </div>

        {tabActual === 'explorar' && <TabExplorar navigate={navigate} />}
        {tabActual === 'mias' && (
          <TabMias
            navigate={navigate}
            onModalForm={setModalForm}
            onConfirmDelete={setPubAEliminar}
            toast={toast}
            onHideToast={() => setToast(null)}
          />
        )}
      </div>
    </>
  )
}