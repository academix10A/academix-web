// src/hooks/useNotes.js
import { useState, useEffect } from 'react'
import localforage from 'localforage'

const NOTES_KEY = 'academix_notes'
const API_URL   = 'http://localhost:8000/api/notas'

export const SyncError = {
  NONE:         'none',
  NO_INTERNET:  'no_internet',
  SERVER_ERROR: 'server_error',
  UNKNOWN:      'unknown',
}

async function checkOnline() {
  if (!navigator.onLine) return false
  try {
    await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      mode:   'no-cors',
      cache:  'no-store',
      signal: AbortSignal.timeout(3000),
    })
    return true
  } catch {
    return false
  }
}

// Hook principal 
// Recibe token e id_usuario desde el contexto de auth (useAuth)
export function useNotes({ token, id_usuario } = {}) {
  const [notes, setNotes] = useState([])

  // Cargar notas del usuario actual desde localForage al montar
  // Usamos una clave por usuario para separar notas entre cuentas
  const storageKey = id_usuario ? `${NOTES_KEY}_${id_usuario}` : NOTES_KEY

  useEffect(() => {
    localforage.getItem(storageKey).then(saved => {
      if (Array.isArray(saved)) setNotes(saved)
      else setNotes([])
    })
  }, [storageKey])

  // Persistir en localForage ante cada cambio (offline-first)
  useEffect(() => {
    localforage.setItem(storageKey, notes)
  }, [notes, storageKey])

  const addNote = async ({ contenido, es_compartida, id_recurso }) => {
    // Validaciones locales
    if (!contenido?.trim())
      return { note: null, syncError: 'El contenido no puede estar vacío.', syncErrorType: SyncError.UNKNOWN }
    if (!id_recurso || id_recurso <= 0)
      return { note: null, syncError: 'Debes seleccionar un recurso válido.', syncErrorType: SyncError.UNKNOWN }
    if (!id_usuario || id_usuario <= 0)
      return { note: null, syncError: 'Debes iniciar sesión para guardar notas.', syncErrorType: SyncError.UNKNOWN }

    // Guardar localmente de inmediato — esto nunca falla
    const newNote = {
      id:            Date.now(),           // ID temporal local
      id_nota:       null,                 // ID real que vendrá del backend
      contenido:     contenido.trim(),
      es_compartida: Boolean(es_compartida),
      id_usuario,
      id_recurso,
      createdAt:     new Date().toISOString(),
      synced:        false,
      syncError:     null,
      syncErrorType: SyncError.NONE,
    }
    setNotes(prev => [newNote, ...prev])

    // Intentar sincronizar con el backend
    let syncError     = null
    let syncErrorType = SyncError.NONE

    const isOnline = await checkOnline()

    if (!isOnline) {
      syncError     = 'Sin conexión a internet. La nota se guardó localmente y se sincronizará cuando recuperes la conexión.'
      syncErrorType = SyncError.NO_INTERNET
    } else if (!token) {
      // Sin token no podemos llamar al backend protegido
      syncError     = 'Sesión no válida. Inicia sesión de nuevo para sincronizar.'
      syncErrorType = SyncError.SERVER_ERROR
    } else {
      try {
        const res = await fetch(API_URL, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,   
          },
          body: JSON.stringify({
            contenido:     newNote.contenido,
            es_compartida: newNote.es_compartida,
            id_usuario,    
            id_recurso,
          }),
          signal: AbortSignal.timeout(8000),
        })

        if (res.ok) {
          const data = await res.json()
          // Actualizar nota local con el id_nota real que asignó el backend
          setNotes(prev =>
            prev.map(n => n.id === newNote.id
              ? { ...n, id_nota: data.id_nota, synced: true, syncError: null, syncErrorType: SyncError.NONE }
              : n
            )
          )
        } else {
          let detail = ''
          try {
            const body = await res.json()
            detail = body?.detail || ''
          } catch { /* body no es JSON */ }

          syncError     = `El servidor rechazó la nota (HTTP ${res.status}${detail ? ': ' + detail : ''}). Guardada localmente.`
          syncErrorType = SyncError.SERVER_ERROR
        }
      } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          syncError     = 'El servidor tardó demasiado (timeout). Nota guardada localmente.'
          syncErrorType = SyncError.SERVER_ERROR
        } else {
          syncError     = 'No se pudo conectar con el servidor backend. Nota guardada localmente.'
          syncErrorType = SyncError.SERVER_ERROR
        }
      }
    }

    // Persistir el error de sync en la nota local para mostrarlo en la UI
    if (syncError) {
      setNotes(prev =>
        prev.map(n => n.id === newNote.id
          ? { ...n, syncError, syncErrorType }
          : n
        )
      )
    }

    return { note: newNote, syncError, syncErrorType }
  }

/* retrySingle — reintenta sincronizar UNA nota pendiente por su id local.*/
  const retrySingle = async (localId) => {
    const nota = notes.find(n => n.id === localId)
    if (!nota || nota.synced) return

    const isOnline = await checkOnline()

    if (!isOnline) {
      // Sigue sin internet — solo actualizar el mensaje, no crear nada
      setNotes(prev => prev.map(n => n.id === localId
        ? { ...n,
            syncError: 'Sin conexión a internet. Se sincronizará cuando recuperes la conexión.',
            syncErrorType: SyncError.NO_INTERNET }
        : n
      ))
      return
    }

    if (!token) {
      setNotes(prev => prev.map(n => n.id === localId
        ? { ...n,
            syncError: 'Sesión no válida. Inicia sesión de nuevo.',
            syncErrorType: SyncError.SERVER_ERROR }
        : n
      ))
      return
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contenido:     nota.contenido,
          es_compartida: nota.es_compartida,
          id_usuario,
          id_recurso:    nota.id_recurso,
        }),
        signal: AbortSignal.timeout(8000),
      })

      if (res.ok) {
        const data = await res.json()
        // Reemplazar la nota pendiente con los datos confirmados del servidor
        setNotes(prev => prev.map(n => n.id === localId
          ? {
              ...n,
              id_nota:       data.id_nota,   // id real del backend
              synced:        true,
              syncError:     null,
              syncErrorType: SyncError.NONE,
            }
          : n
        ))
      } else {
        let detail = ''
        try { const b = await res.json(); detail = b?.detail || '' } catch {}
        setNotes(prev => prev.map(n => n.id === localId
          ? { ...n,
              syncError: `Error del servidor (HTTP ${res.status}${detail ? ': ' + detail : ''}). Guardada localmente.`,
              syncErrorType: SyncError.SERVER_ERROR }
          : n
        ))
      }
    } catch (err) {
      const msg = (err.name === 'TimeoutError' || err.name === 'AbortError')
        ? 'El servidor tardó demasiado (timeout). Guardada localmente.'
        : 'No se pudo conectar con el servidor. Guardada localmente.'
      setNotes(prev => prev.map(n => n.id === localId
        ? { ...n, syncError: msg, syncErrorType: SyncError.SERVER_ERROR }
        : n
      ))
    }
  }

  /** Reintenta sincronizar TODAS las notas pendientes una por una */
  const retryPending = async () => {
    const pending = notes.filter(n => !n.synced)
    for (const n of pending) {
      await retrySingle(n.id)   // usa el id local, no crea notas nuevas
    }
  }

  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id))

  const pendingCount = notes.filter(n => !n.synced).length

  return { notes, addNote, deleteNote, retryPending, pendingCount }
}