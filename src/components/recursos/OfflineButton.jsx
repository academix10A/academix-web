import { useState, useEffect } from 'react'
import { Download, CheckCircle, Loader, Trash2 } from 'lucide-react'
import {
  guardarRecursoOffline,
  eliminarRecursoOffline,
  estaOffline,
} from '../../services/offlineService'
import styles from './Offlinebutton.module.css'

export default function OfflineButton({ recurso, esPremium }) {
  const [guardado,  setGuardado]  = useState(false)
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!recurso?.id_recurso || !esPremium) return
    estaOffline(recurso.id_recurso)
      .then(setGuardado)
      .catch(() => setGuardado(false))
  }, [recurso?.id_recurso, esPremium])

  if (!esPremium) return null

  const handleDescargar = async () => {
    setCargando(true)
    setError(null)
    try {
      await guardarRecursoOffline(recurso)
      setGuardado(true)
    } catch (err) {
      console.error('[OfflineButton] Error al guardar:', err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const handleEliminar = async () => {
    setCargando(true)
    setError(null)
    try {
      await eliminarRecursoOffline(recurso.id_recurso, recurso.url_archivo)
      setGuardado(false)
    } catch (err) {
      console.error('[OfflineButton] Error al eliminar:', err)
      setError('No se pudo eliminar. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <button className={`${styles.btn} ${styles.cargando}`} disabled>
        <Loader size={15} className={styles.spinner} />
        <span>Guardando…</span>
      </button>
    )
  }

  if (guardado) {
    return (
      <div className={styles.wrap}>
        <button
          className={`${styles.btn} ${styles.guardado}`}
          onClick={handleEliminar}
          title="Toca para quitar del almacenamiento offline"
        >
          <CheckCircle size={15} />
          <span>Guardado offline</span>
          <Trash2 size={13} className={styles.trash} />
        </button>
        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.btn} ${styles.descargar}`}
        onClick={handleDescargar}
      >
        <Download size={15} />
        <span>Guardar offline</span>
      </button>
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}