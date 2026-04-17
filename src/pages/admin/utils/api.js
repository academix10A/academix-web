// Configuración de la API

// URL base de la API - cambiar según tu entorno
export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getAuthToken = () => {
  return localStorage.getItem('auth_token') || '';
};

// Función para guardar el token
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Función para eliminar el token (logout)
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Endpoints disponibles
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/token',
  
  // Exámenes
  EXAMENES: '/examen/',
  EXAMEN_BY_ID: (id) => `/examen/${id}/`,
  
  // Preguntas (con barra final)
  PREGUNTAS: '/pregunta/',
  PREGUNTA_BY_ID: (id) => `/pregunta/${id}/`,
  
  // Opciones
  OPCIONES: '/opcion/',
  OPCION_BY_ID: (id) => `/opcion/${id}/`,
  
  // Recursos (con barra final)
  RECURSOS: '/recurso/',
  RECURSO_BY_ID: (id) => `/recurso/${id}/`,
  
  // Usuarios (ejemplo para futuro)
  USUARIOS: '/usuario/',
  USUARIO_BY_ID: (id) => `/usuario/${id}/`,
  
  // Productos (ejemplo para futuro)
  PRODUCTOS: '/producto/',
  PRODUCTO_BY_ID: (id) => `/producto/${id}/`,
};

// Helper para hacer requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`, // ← Obtiene el token de localStorage
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Si la respuesta no es ok, lanzar error
    if (!response) {
      if (response.status === 401) {
        // Token inválido o expirado - redirigir al login
        removeAuthToken();
        window.location.href = '/'; // Esto recargará y mostrará el login
        throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Si es DELETE y no tiene contenido, retornar true
    if (response.status === 204 || options.method === 'DELETE') {
      return { success: true };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Funciones específicas para Exámenes
export const examenesAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.EXAMENES),
  getById: (id) => apiRequest(API_ENDPOINTS.EXAMEN_BY_ID(id)),
  create: (data) => apiRequest(API_ENDPOINTS.EXAMENES, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(API_ENDPOINTS.EXAMEN_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(API_ENDPOINTS.EXAMEN_BY_ID(id), {
    method: 'DELETE',
  }),
};

// Funciones específicas para Preguntas
export const preguntasAPI = {
  // Obtener todas las preguntas
  getAll: () => apiRequest(API_ENDPOINTS.PREGUNTAS),
  
  // Obtener una pregunta por ID
  getById: (id) => apiRequest(API_ENDPOINTS.PREGUNTA_BY_ID(id)),
  
  // Crear una nueva pregunta
  create: (data) => apiRequest(API_ENDPOINTS.PREGUNTAS, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Actualizar una pregunta
  update: (id, data) => apiRequest(API_ENDPOINTS.PREGUNTA_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Eliminar una pregunta
  delete: (id) => apiRequest(API_ENDPOINTS.PREGUNTA_BY_ID(id), {
    method: 'DELETE',
  }),
};

// Funciones específicas para Opciones
export const opcionesAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.OPCIONES),
  getById: (id) => apiRequest(API_ENDPOINTS.OPCION_BY_ID(id)),
  create: (data) => apiRequest(API_ENDPOINTS.OPCIONES, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(API_ENDPOINTS.OPCION_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(API_ENDPOINTS.OPCION_BY_ID(id), {
    method: 'DELETE',
  }),
};

// Funciones específicas para Recursos
export const recursosAPI = {
  // Obtener todos los recursos
  getAll: () => apiRequest(API_ENDPOINTS.RECURSOS),
  
  // Obtener un recurso por ID
  getById: (id) => apiRequest(API_ENDPOINTS.RECURSO_BY_ID(id)),
  
  // Crear un nuevo recurso
  create: (data) => apiRequest(API_ENDPOINTS.RECURSOS, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Actualizar un recurso
  update: (id, data) => apiRequest(API_ENDPOINTS.RECURSO_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Eliminar un recurso
  delete: (id) => apiRequest(API_ENDPOINTS.RECURSO_BY_ID(id), {
    method: 'DELETE',
  }),
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  apiRequest,
  examenesAPI,
  preguntasAPI,
  opcionesAPI,
  recursosAPI,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};