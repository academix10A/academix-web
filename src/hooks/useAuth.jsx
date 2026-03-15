import { useState, useEffect, createContext, useContext } from 'react'
import localforage from 'localforage'

// Claves de almacenamiento 
const TOKEN_KEY = 'academix_token'
const USER_KEY  = 'academix_user'

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    // Base64url → Base64 normal → decodificar
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

// Verifica si el token ya expiró comparando el campo "exp" del payload
function isTokenExpired(token) {
  const payload = decodeJWT(token)
  if (!payload?.exp) return true
  // exp está en segundos, Date.now() en milisegundos
  return Date.now() >= payload.exp * 1000
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(null)
  const [user, setUser]     = useState(null)   
  const [loading, setLoading] = useState(true)  // mientras cargamos desde localForage


  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await localforage.getItem(TOKEN_KEY)
        const savedUser  = await localforage.getItem(USER_KEY)

        if (savedToken && !isTokenExpired(savedToken) && savedUser) {
          setToken(savedToken)
          setUser(savedUser)
        } else {
          // Token expirado o no existe — limpiar
          await localforage.removeItem(TOKEN_KEY)
          await localforage.removeItem(USER_KEY)
        }
      } catch {
        // Si localForage falla, simplemente no restauramos sesión
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const registro = async (nombre, apellido_paterno, apellido_materno, email, password) => {
    
    try {
      const res = await fetch('http://localhost:8000/api/usuarios/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      nombre,
      apellido_paterno,
      apellido_materno,
      correo: email,
      contrasena: password,
      id_rol:       2,
      id_estado:    1,
      id_membresia: 1,
}),
        signal: AbortSignal.timeout(8000),
      })
      
      if (!res.ok) {
  const err = await res.json().catch(() => ({}))
  let message
  if (Array.isArray(err?.detail)) {
    message = err.detail.map(e => e.msg).join(', ')
  } else {
    message = err?.detail || `Error ${res.status}: no se pudo crear el usuario.`
  }
  return { ok: false, message }
}
    return { ok: true }
      
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }
  
  const login = async (email, password) => {
    
    const body = new URLSearchParams()
    body.append('grant_type', 'password') 
    body.append('username', email)        // FastAPI lo llama "username" aunque sea email
    body.append('password', password)
    body.append('scope', '')
    body.append('client_id', '')
    body.append('client_secret', '')

    try {
      const res = await fetch('http://localhost:8000/api/login/access-token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(8000),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return {
          ok: false,
          message: err?.detail || `Error ${res.status}: credenciales inválidas`,
        }
      }

      
      

      const data = await res.json()         // { access_token, token_type }
      const accessToken = data.access_token

      // Decodificamos el payload para extraer los datos del usuario
      const payload = decodeJWT(accessToken)
      const userData = {
        id_usuario: parseInt(payload?.sub),  // "sub" es el id_usuario como string
        email:      payload?.email  || email,
        rol:        payload?.rol    || null,
        membresia:  payload?.membresia || null,
      }

      // Persistir en localForage (sobrevive recargas y cierre del navegador)
      await localforage.setItem(TOKEN_KEY, accessToken)
      await localforage.setItem(USER_KEY, userData)
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('user_role', userData.rol);

      setToken(accessToken)
      setUser(userData)

      return { ok: true, user: userData }
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        return { ok: false, message: 'El servidor tardó demasiado. Intenta de nuevo.' }
      }
      return { ok: false, message: 'No se pudo conectar con el servidor.' }
    }
  }

  /** logout() — limpia token y usuario de estado y localForage */
  const logout = async () => {
    await localforage.removeItem(TOKEN_KEY)
    await localforage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token && !isTokenExpired(token)

  return (
    <AuthContext.Provider value={{ token, user, loading, isAuthenticated, login, logout, registro }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook para consumir el contexto desde cualquier componente */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}