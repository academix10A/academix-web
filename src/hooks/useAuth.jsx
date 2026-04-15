import { useState, useEffect, createContext, useContext } from 'react'
import { authStorage } from '../services/authStorage'
import { loginService, setAuthToken, usuariosService } from '../services/api'

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const base64  = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = decodeJWT(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(null)
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await authStorage.getToken()
        const savedUser  = await authStorage.getUser()

        if (savedToken && !isTokenExpired(savedToken) && savedUser) {
          setToken(savedToken)
          setUser(savedUser)
          setAuthToken(savedToken)
        } else {
          await authStorage.clearAll()
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const registro = async (nombre, apellido_paterno, apellido_materno, email, password) => {
    try {
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/`, {
      //   method:  'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     nombre,
      //     apellido_paterno,
      //     apellido_materno,
      //     correo:       email,
      //     contrasena:   password,
      //     id_rol:       2,
      //     id_estado:    1,
      //   }),
      //   signal: AbortSignal.timeout(8000),
      // })

      const res = await usuariosService.postUser({
        nombre,
        apellido_paterno,
        apellido_materno,
        correo:       email,
        contrasena:   password,
        id_rol:       2,
        id_estado:    1,
      })

      if (!res) {
        const err = await res.json().catch(() => ({}))
        const message = Array.isArray(err?.detail)
          ? err.detail.map((e) => e.msg).join(', ')
          : err?.detail || `Error ${res.status}: no se pudo crear el usuario.`
        return { ok: false, message }
      }

      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }

  // const login = async (email, password) => {
  //   const body = new URLSearchParams()
  //   body.append('grant_type',    'password')
  //   body.append('username',      email)
  //   body.append('password',      password)
  //   body.append('scope',         '')
  //   body.append('client_id',     '')
  //   body.append('client_secret', '')

  //   try {
  //     // const res = await fetch(`${import.meta.env.VITE_API_URL}/login/access-token`, {
  //     //   method:  'POST',
  //     //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     //   body,
  //     //   signal: AbortSignal.timeout(8000),
  //     // })

  //     const res = await loginService.login(email, password)

  //     if (!res) {
  //       const err = await res.catch(() => ({}))
  //       return {
  //         ok:      false,
  //         message: err?.detail || `Error ${res.status}: credenciales inválidas`,
  //       }
  //     }

  //     const data        = await res.json()
  //     const accessToken = data.access_token
  //     const payload     = decodeJWT(accessToken)

  //     const userData = {
  //       id_usuario: parseInt(payload?.sub),
  //       email:      payload?.email     || email,
  //       rol:        payload?.rol       || null,
  //       membresia:  payload?.membresia || null,
  //     }

  //     console.log(userData)

  //     // Persistir en storage
  //     await authStorage.setToken(accessToken)
  //     await authStorage.setUser(userData)

  //     // Actualizar estado
  //     setToken(accessToken)
  //     setUser(userData)
  //     setAuthToken(accessToken)

  //     return { ok: true, user: userData }
  //   } catch (err) {
  //     if (err.name === 'TimeoutError' || err.name === 'AbortError') {
  //       return { ok: false, message: 'El servidor tardó demasiado. Intenta de nuevo.' }
  //     }
  //     return { ok: false, message: 'No se pudo conectar con el servidor.' }
  //   }
  // }
  const refreshUser = async () => {
    try {
      const data = await usuariosService.getMe()

      const updatedUser = {
        id_usuario: data.id_usuario,
        email: data.email,
        rol: data.rol,
        membresia: data.membresia,
      }

      await authStorage.setUser(updatedUser)
      setUser(updatedUser)
    } catch (err) {
      console.error("Error refrescando usuario", err)
    }
  }

  const login = async (email, password) => {
    try {
      const data = await loginService.login(email, password)

      const accessToken = data.access_token
      const payload     = decodeJWT(accessToken)

      const userData = {
        id_usuario: parseInt(payload?.sub),
        email:      payload?.email     || email,
        rol:        payload?.rol       || null,
        membresia:  payload?.membresia || null,
      }

      await authStorage.setToken(accessToken)
      await authStorage.setUser(userData)

      setToken(accessToken)
      setUser(userData)
      setAuthToken(accessToken)

      return { ok: true, user: userData }

    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        return { ok: false, message: 'El servidor tardó demasiado. Intenta de nuevo.' }
      }
      return { ok: false, message: err.message || 'No se pudo conectar con el servidor.' }
    }
  }

  const logout = async () => {
    await authStorage.clearAll()
    setToken(null)
    setUser(null)
    setAuthToken(null)
  }

  const isAuthenticated = !!token && !isTokenExpired(token)

  return (
    <AuthContext.Provider value={{ token, user, loading, isAuthenticated, login, logout, registro, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}