// src/router/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'


export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireRole = null,
}) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // Esperar a que localForage restaure la sesión
  // Sin esto, al recargar la página el usuario ve un flash de redirección
  // porque isAuthenticated es false por un instante mientras carga
  if (loading) {
    return <LoadingScreen />
  }

  // Si la ruta requiere autenticación y no está logueado
  // Guardamos en `state` la ruta que intentaba visitar para redirigir
  // de vuelta después del login (UX estándar)
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si la ruta requiere un rol específico
  if (requireRole) {
    // Si no está autenticado, primero a login
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    // Si está autenticado pero no tiene el rol requerido → al home
    if (user?.rol !== requireRole) {
      return <Navigate to="/home" replace />
    }
  }

  //Todo bien, renderiza la página
  return children
}

// Pantalla de carga mientras se restaura la sesión desde localForage
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--blue-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(212,175,55,0.2)',
        borderTop: '3px solid var(--gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
        Cargando sesión…
      </p>
    </div>
  )
}