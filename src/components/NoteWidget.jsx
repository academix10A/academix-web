// src/components/NoteWidget.jsx
import { useState, useRef } from 'react'
import {
  Plus, X, Trash2, Wifi, WifiOff, StickyNote,
  RefreshCw, AlertCircle, CheckCircle, ServerCrash,
  Search, BookOpen, LogIn
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotes, SyncError } from '../hooks/useNotes'
import { useAuth } from '../hooks/useAuth'
import styles from './NoteWidget.module.css'

export default function NoteWidget() {
  const { token, user, isAuthenticated } = useAuth()

  // Pasamos token e id_usuario al hook — el hook los usa para el fetch y para
  // separar el storage key por usuario (notas de un usuario no mezclan con otro)
  const { notes, addNote, deleteNote, retryPending, pendingCount } = useNotes({
    token,
    id_usuario: user?.id_usuario,
  })

  const [open, setOpen]               = useState(false)
  const [text, setText]               = useState('')
  const [compartida, setCompartida]   = useState(false)
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState(null)
  const [retrying, setRetrying]       = useState(false)

  // Búsqueda de recurso por título
  const [tituloInput, setTituloInput]   = useState('')
  const [recursoFound, setRecursoFound] = useState(null)
  const [searching, setSearching]       = useState(false)
  const [searchError, setSearchError]   = useState(null)
  const debounceRef = useRef(null)

  //  Toast 
  const showToast = (msg, type = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }

  //  Buscar recurso por título 
  const handleTituloChange = (e) => {
    const val = e.target.value
    setTituloInput(val)
    setRecursoFound(null)
    setSearchError(null)
    clearTimeout(debounceRef.current)
    if (!val.trim()) return

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `http://localhost:8000/api/recurso/titulo/${encodeURIComponent(val.trim())}`,
          {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            signal:  AbortSignal.timeout(5000),
          }
        )
        if (res.ok) {
          const data    = await res.json()
          const recurso = Array.isArray(data) ? data[0] : data
          if (recurso?.id_recurso) {
            setRecursoFound(recurso)
          } else {
            setSearchError('No se encontró ningún recurso con ese título.')
          }
        } else if (res.status === 404) {
          setSearchError('No se encontró ningún recurso con ese título.')
        } else {
          setSearchError(`Error del servidor (HTTP ${res.status}).`)
        }
      } catch {
        setSearchError('No se pudo conectar con el servidor para buscar el recurso.')
      } finally {
        setSearching(false)
      }
    }, 500)
  }

  const clearRecurso = () => {
    setTituloInput('')
    setRecursoFound(null)
    setSearchError(null)
  }

  // Guardar nota 
  const handleSave = async () => {
    if (!text.trim()) return
    if (!recursoFound) {
      showToast('Escribe el título del recurso para asociar la nota.', 'warn')
      return
    }

    setSaving(true)
    const { syncError, syncErrorType } = await addNote({
      contenido:     text.trim(),
      es_compartida: compartida,
      id_recurso:    recursoFound.id_recurso,
    })
    setText('')
    setCompartida(false)
    clearRecurso()
    setSaving(false)

    if (!syncError) {
      showToast('Nota guardada y sincronizada correctamente.', 'success')
    } else if (syncErrorType === SyncError.NO_INTERNET) {
      showToast('Sin internet — nota guardada localmente. Se sincronizará al recuperar la conexión.', 'warn')
    } else {
      showToast('Fallo del servidor — nota guardada localmente. Se sincronizará cuando esté disponible.', 'error')
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    await retryPending()
    setRetrying(false)
    showToast('Reintento completado.', 'success')
  }

  const SyncIcon = ({ note }) => {
    if (note.synced)
      return <Wifi size={12} className={styles.synced} title="Sincronizada con el servidor" />
    if (note.syncErrorType === SyncError.NO_INTERNET)
      return <WifiOff size={12} className={styles.offline} title="Sin internet al guardar" />
    if (note.syncErrorType === SyncError.SERVER_ERROR)
      return <ServerCrash size={12} className={styles.serverErr} title="Error del servidor" />
    return <WifiOff size={12} className={styles.offline} title="Pendiente de sincronización" />
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* FAB */}
      <button
        className={styles.fab}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Cerrar notas' : 'Abrir notas'}
      >
        {pendingCount > 0 && !open && (
          <span className={styles.pendingBadge}>{pendingCount}</span>
        )}
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>

      {/* Panel */}
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <StickyNote size={18} />
          <span>Mis Notas</span>
          {isAuthenticated && <span className={styles.count}>{notes.length}</span>}
          {pendingCount > 0 && (
            <button
              className={styles.retryBtn}
              onClick={handleRetry}
              disabled={retrying}
            >
              <RefreshCw size={13} className={retrying ? styles.spinning : ''} />
              <span>{retrying ? 'Reintentando…' : `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`}</span>
            </button>
          )}
        </div>

        {/* Si no está autenticado — bloquear con mensaje */}
        {!isAuthenticated ? (
          <div className={styles.authGate}>
            {/* <LogIn size={32} className={styles.authIcon} /> */}
            <p className={styles.authMsg}>Inicia sesión para crear y guardar notas</p>
            <Link to="/login" className={styles.authBtn} onClick={() => setOpen(false)}>
              Iniciar Sesión
            </Link>
          </div>
        ) : (
          <>
            {/* Formulario */}
            <div className={styles.inputArea}>
              {/* Buscador de recurso */}
              <div className={styles.recursoSearch}>
                <label className={styles.recursoLabel}>Recurso asociado</label>
                {recursoFound ? (
                  <div className={styles.recursoChip}>
                    <BookOpen size={13} />
                    <span className={styles.recursoChipTitle}>{recursoFound.titulo}</span>
                    <button className={styles.recursoChipClear} onClick={clearRecurso} title="Cambiar recurso">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.recursoInputWrap}>
                    <Search size={14} className={styles.recursoSearchIcon} />
                    <input
                      className={styles.recursoInput}
                      type="text"
                      placeholder="Escribe el título del recurso…"
                      value={tituloInput}
                      onChange={handleTituloChange}
                    />
                    {searching && <span className={styles.searchingDot} />}
                  </div>
                )}
                {searchError && <p className={styles.recursoError}>{searchError}</p>}
              </div>

              <textarea
                className={styles.textarea}
                placeholder="Escribe tu nota aquí…"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSave() }}
              />

              {/* Switch compartida */}
              <div className={styles.switchRow}>
                <span className={styles.switchLabel}>Compartir con la comunidad</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={compartida}
                  className={`${styles.switch} ${compartida ? styles.switchOn : ''}`}
                  onClick={() => setCompartida(v => !v)}
                >
                  <span className={styles.switchThumb} />
                </button>
              </div>

              <div className={styles.inputFooter}>
                <span className={styles.hint}>Ctrl + Enter para guardar</span>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving || !text.trim() || !recursoFound}
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>

            {/* Lista de notas */}
            <ul className={styles.list}>
              {notes.length === 0 && (
                <li className={styles.empty}>No hay notas aún</li>
              )}
              {notes.map(n => (
                <li key={n.id} className={`${styles.noteItem} ${!n.synced ? styles.noteItemPending : ''}`}>
                  <p className={styles.noteText}>{n.contenido}</p>
                  {n.syncError && (
                    <p className={styles.noteError}>
                      {n.syncErrorType === SyncError.NO_INTERNET
                        ? '📶 Sin internet al guardar'
                        : '🔴 Error de servidor al guardar'}
                      {' — guardada localmente'}
                    </p>
                  )}
                  <div className={styles.noteMeta}>
                    <SyncIcon note={n} />
                    {n.es_compartida && <span className={styles.sharedTag}>Compartida</span>}
                    <span>
                      {new Date(n.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button className={styles.deleteBtn} onClick={() => deleteNote(n.id)} aria-label="Eliminar nota">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}