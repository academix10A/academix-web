// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './router/ProtectedRoute'

// Páginas públicas
import Home  from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'

// Páginas de usuario autenticado
// (misma página Home, pero ahora con funciones desbloqueadas según membresía)

// Páginas de admin
import AdminDashboard from './pages/admin/Dashboard.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/*Rutas públicas*/}
          <Route path="/"        element={<Home />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          

          {/*Rutas de usuario autenticado (gratis o premium)*/}
          {/*
            requireAuth={true} significa: si no estás logueado → /login
            No ponemos requireRole porque tanto gratis como premium entran aquí.
            usePermissions() dentro de cada componente controla qué ven.
          */}
          <Route path="/home" element={
            <ProtectedRoute requireAuth={true}>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAuth={true} requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}