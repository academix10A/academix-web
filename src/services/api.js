// src/services/api.js
// Centraliza todas las llamadas al backend — un solo lugar para cambiar la URL base

const BASE_URL = 'http://localhost:8000/api'

// Helper para hacer fetch con el token automáticamente
async function apiFetch(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    signal: options.signal ?? AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || `Error ${res.status}`)
  }

  return res.json()
}

// ── Recursos ──────────────────────────────────────────────────────
export const recursosService = {
  getAll:       (token) => apiFetch('/recurso/', {}, token),
  getById:      (id, token) => apiFetch(`/recurso/${id}`, {}, token),
  getByTitulo:  (titulo, token) => apiFetch(`/recurso/titulo/${encodeURIComponent(titulo)}`, {}, token),
}

// ── Tipos (libro, audiolibro, video) ──────────────────────────────
export const tiposService = {
  getAll: (token) => apiFetch('/tipo/', {}, token),
}

// ── Subtemas / Categorías ─────────────────────────────────────────
export const subtemasService = {
  getAll: (token) => apiFetch('/subtemas/', {}, token),
}

export const examenesService = {
  getAll:     (token) => apiFetch('/examen/', {}, token),
  getById:    (id, token) => apiFetch(`/examen/${id}`, {}, token),
  getCompleto:(id, token) => apiFetch(`/examen/${id}/completo`, {}, token),
  submit:     (data, token) => apiFetch('/examen/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
}

// ── Publicaciones ─────────────────────────────────────────────────
export const publicacionesService = {
  getAll:  (token) => apiFetch('/publicacion/', {}, token),
  getById: (id, token) => apiFetch(`/publicacion/${id}`, {}, token),
}

// ── Membresías ────────────────────────────────────────────────────
export const membresiasService = {
  getAll: (token) => apiFetch('/membresia/', {}, token),
}


