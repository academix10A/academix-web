import { offlineService } from './api'

const CACHE_NAME = 'offline-recursos-v1'
const IDB_NAME   = 'academix-offline'
const IDB_STORE  = 'recursos'

function esUrlCacheable(url) {
  if (!url) return false
  if (url.includes('drive.google.com'))              return false
  if (url.includes('youtube.com'))                   return false
  if (url.includes('youtu.be'))                      return false
  return true
}

function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)

    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id_recurso' })
      }
    }

    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
}

async function guardarMetadata(recurso) {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(IDB_STORE, 'readwrite')
    const store = tx.objectStore(IDB_STORE)

    store.put({
      id_recurso:     recurso.id_recurso,
      titulo:         recurso.titulo        ?? '',
      descripcion:    recurso.descripcion   ?? '',
      contenido:      recurso.contenido     ?? null,
      url_archivo:    recurso.url_archivo   ?? null,
      id_subtema:     recurso.id_subtema    ?? null,
      external_id:    recurso.external_id   ?? null,
      fecha_descarga: new Date().toISOString(),
    })

    tx.oncomplete = () => resolve()
    tx.onerror    = (e) => reject(e.target.error)
  })
}

async function eliminarMetadata(idRecurso) {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(IDB_STORE, 'readwrite')
    const store = tx.objectStore(IDB_STORE)

    store.delete(idRecurso)

    tx.oncomplete = () => resolve()
    tx.onerror    = (e) => reject(e.target.error)
  })
}

export async function obtenerMetadata(idRecurso) {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(IDB_STORE, 'readonly')
    const store = tx.objectStore(IDB_STORE)
    const req   = store.get(idRecurso)

    req.onsuccess = (e) => resolve(e.target.result ?? null)
    req.onerror   = (e) => reject(e.target.error)
  })
}

export async function listarOffline() {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(IDB_STORE, 'readonly')
    const store = tx.objectStore(IDB_STORE)
    const req   = store.getAll()

    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
}

export async function estaOffline(idRecurso) {
  const resultado = await obtenerMetadata(idRecurso)
  return resultado !== null
}

async function cachearArchivo(url) {
  if (!esUrlCacheable(url)) return

  try {
    const cache    = await caches.open(CACHE_NAME)
    const existing = await cache.match(url)
    if (existing) return 
    const response = await fetch(url, { mode: 'no-cors' })
    await cache.put(url, response)
  } catch {
    console.warn('[offline] No se pudo cachear el archivo:', url)
  }
}

async function eliminarArchivo(url) {
  if (!url) return
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.delete(url)
  } catch {
    console.warn('[offline] No se pudo eliminar del cache:', url)
  }
}

async function registrarEnBackend(idRecurso) {
  try {
    await offlineService.postOffline(idRecurso)
  } catch (err) {
    if (!err.message?.includes('409')) throw err
  }
}

async function eliminarDelBackend(idRecurso) {
  try {
    await offlineService.deleteOffline(idRecurso)
  } catch (err) {
    console.warn('[offline] No se pudo eliminar del backend:', err.message)
  }
}

export async function guardarRecursoOffline(recurso) {
  await registrarEnBackend(recurso.id_recurso)

  await guardarMetadata(recurso)

  if (recurso.url_archivo) {
    await cachearArchivo(recurso.url_archivo)
  }
}

export async function eliminarRecursoOffline(idRecurso, urlArchivo) {
  await eliminarDelBackend(idRecurso)

  await eliminarMetadata(idRecurso)

  if (urlArchivo) {
    await eliminarArchivo(urlArchivo)
  }
}