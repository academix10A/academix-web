// src/services/api.js
// Centraliza todas las llamadas al backend

const BASE_URL = import.meta.env.VITE_API_URL
const API_KEY = import.meta.env.VITE_API_KEY

// Token en memoria — se setea desde AuthContext al iniciar/loguear
let authToken = null

export function setAuthToken(token) {
  authToken = token
}

// Helper central de fetch
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    signal: options.signal ?? AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    if (res.status === 401) {
      // Aquí puedes conectar un logout global en el futuro
      // Por ahora solo limpiamos el token en memoria
      authToken = null
    }

    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || `Error ${res.status}`)
  }

  return res.json()
}

export const loginService = {
  login: (email, password) => {
    const body = new URLSearchParams()
    body.append('grant_type',    'password')
    body.append('username',      email)
    body.append('password',      password)
    body.append('scope',         '')
    body.append('client_id',     '')
    body.append('client_secret', '')

    return apiFetch('/login/access-token', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }
}

// Recursos
export const recursosService = {
  getAll:      () => apiFetch('/recurso/'),
  getById:     (id) => apiFetch(`/recurso/${id}`),
  getByTitulo: (titulo) => apiFetch(`/recurso/titulo/${encodeURIComponent(titulo)}`),
  postRecurso:      (data) => apiFetch('/recurso/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  putRecurso:      (id, data) => apiFetch(`/recurso/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteRecurso:      (id) => apiFetch(`/recurso/${id}`, {
    method: 'DELETE',
  }),
}

export const notasService = {
  getById: (id) => apiFetch(`/notas/${id}`),
  getNotaCompartida: (id) => apiFetch(`/notas/recurso/${id}/compartidas`),
  getNotasCompartidas: () => apiFetch('/notas/compartidas/'),
}

// Tipos
export const tiposService = {
  getAll: () => apiFetch('/tipo/'),
}

// Subtemas
export const subtemasService = {
  getAll: () => apiFetch('/subtemas/'),
  postSubtemas: (data) => apiFetch('/subtemas/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  putSubtemas: (id, data) => apiFetch(`/subtemas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteSubtemas: (id) => apiFetch(`/subtemas/${id}`, {
    method: 'PUT',
  }),
}

// Exámenes
export const examenesService = {
  getAll:      () => apiFetch('/examen/'),
  getById:     (id) => apiFetch(`/examen/${id}`),
  getCompleto: (id) => apiFetch(`/examen/${id}/completo`),
  submit:      (data) => apiFetch('/examen/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  postExamen: (data) => apiFetch('/examen/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  putExamen: (id, data) => apiFetch(`/examen/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteExamen: (id) => apiFetch(`/examen/${id}`, {
    method: 'DELETE',
  }),
}

// Publicaciones
export const publicacionesService = {
  getAll:  () => apiFetch('/publicacion/'),
  getAllWithFilters:  (params) => apiFetch(`/publicacion/filtros/?${params}`),
  getById: (id) => apiFetch(`/publicacion/${id}`),
  getMisPublicaciones: () => apiFetch('/publicacion/usuario'),
  createPublicacion: (data) => apiFetch('/publicacion/', { method: 'POST', body: JSON.stringify(data) }),
  updatePublicacion: (id, data) => apiFetch(`/publicacion/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePublicacion: (id) => apiFetch(`/publicacion/${id}`, { method: 'DELETE' }),
}

// Membresías (pública, sin token)
export const membresiasService = {
  getAll: () => apiFetch('/membresias/'),
  postMembresia: (data) => apiFetch('/membresias/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  putMembresia: (id, data) => apiFetch(`/membresias/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteMembresia: (id) => apiFetch(`/membresias/${id}/`, {
    method: 'DELETE',
  }),
}

// PayPal
export const paypalService = {
  createOrder: (idMembresia) =>
    apiFetch('/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ id_membresia: idMembresia }),
    }),

  captureOrder: (orderID, idMembresia) =>
    apiFetch(`/paypal/capture/${orderID}`, {
      method: 'POST',
      body: JSON.stringify({
        id_membresia: idMembresia,
      }),
    }),
}

// Usuarios
export const usuarioMembresiaService = {
  getAll: () => apiFetch('/usuario_membresia/'),
}

export const usuariosService = {
  getAll: () => apiFetch('/usuarios/'),
  getMe: () => apiFetch('/usuarios/refresh'),
  getById: (id) => apiFetch(`/usuarios/${id}/`),
  putUserEmail: (id, data) => apiFetch(`/usuarios/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  putUser: (id, data) => apiFetch(`/usuarios/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  patchUserPassword: (id, contraseniaActual, contraseniaNueva) => apiFetch(`/usuarios/${id}/cambiar-contrasena?contrasena_actual=${encodeURIComponent(contraseniaActual)}&contrasena_nueva=${encodeURIComponent(contraseniaNueva)}`, {
    method: 'PATCH',
  }),
  postUser: (data) => apiFetch('/usuarios/', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export const beneficiosService = {
  getAll: () => apiFetch('/beneficios/'),
  postBeneficio: (data) => apiFetch('/beneficios/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  putBeneficio: (id, data) => apiFetch(`/beneficios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteBeneficio: (id) => apiFetch(`/beneficios/${id}`, {
    method: 'DELETE',
  }),
}

export const intentoService = {
  getAll: () => apiFetch('/intento/'),
}

export const preguntaService = {
  getAll: () => apiFetch('/pregunta/'),
  postPregunta: (data) => apiFetch('/pregunta/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  putPregunta: (id, data) => apiFetch(`/pregunta/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePregunta: (id) => apiFetch(`/pregunta/${id}`),
}

export const opcionService = {
  getAll: () => apiFetch('/opcion/'),
  postOpcion: (data) => apiFetch('/opcion/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
}

export const rolService = {
  getAll: () => apiFetch('/rol/'),
}

export const estadoService = {
  getAll: () => apiFetch('/estado/'),
  postEstado: (data) => apiFetch('/estado/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  putEstado: (id, data) => apiFetch(`/estado/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteEstado: (id) => apiFetch(`/estado/${id}`, {
    method: 'DELETE',
  }),
}

export const tipoService = {
  getAll: () => apiFetch('/tipo/'),
  postTipo: (data) => apiFetch('/tipo/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  putTipo: (id, data) => apiFetch(`/tipo/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTipo: (id) => apiFetch(`/tipo/${id}`, {
    method: 'DELETE',
  }),
}

export const offlineService = {
  getAll: () => apiFetch('/offline/'),
  postOffline: (id) => apiFetch(`/offline/${id}`, {
    method: 'POST',
  }),
  // putOffline: (id, data) => apiFetch(`/offline/${id}`, {
  //   method: 'PUT',
  //   body: JSON.stringify(data)
  // }),
  deleteOffline: (id) => apiFetch(`/offline/${id}`, {
    method: 'DELETE',
  }),
}

export const progresoService = {
  getProgresoExistente: (id) => apiFetch(`/progreso/usuario/recurso/${id}`),
  patchProgreso: (id, data) => apiFetch(`/progreso/recurso/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  // postOffline: (id) => apiFetch(`/offline/${id}`, {
  //   method: 'POST',
  // }),
  // putOffline: (id, data) => apiFetch(`/offline/${id}`, {
  //   method: 'PUT',
  //   body: JSON.stringify(data)
  // }),
  // deleteOffline: (id) => apiFetch(`/offline/${id}`, {
  //   method: 'DELETE',
  // }),
}

