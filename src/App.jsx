// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './router/ProtectedRoute'

// Admin / User Apps
import AdminApp from './pages/admin/AdminApp'

// Recursos
import RecursoVerPage from './pages/RecursoVerPage.jsx'
import Recursos from './pages/Recursos.jsx'
import RecursosCategorias from './pages/RecursosCategorias.jsx'
import RecursosDetalle from './pages/RecursosDetalle.jsx'

// Exámenes
import ExamenesPage from './pages/examenes/ExamenesPage.jsx'
import ExamenDetalle from './pages/examenes/ExamenesDetalle.jsx'
import ExamenResolver from './pages/examenes/ExamenResolver.jsx'
import ExamenResultado from './pages/examenes/ExamenResultado.jsx'

// Públicas
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'

// Admin dashboard
// import AdminDashboard from './pages/admin/Dashboard.jsx'

export default function App() {

  const userRole = localStorage.getItem('user_role')
  const hasToken = !!localStorage.getItem('auth_token')

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Usuario autenticado */}
          <Route path="/home" element={
            <ProtectedRoute requireAuth={true}>
              <Home />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAuth={true} requireRole="admin">
              {/* <AdminDashboard /> */}
              <AdminApp />
            </ProtectedRoute>
          } />

          {/* Recursos */}
          <Route path="/recursos" element={
            <ProtectedRoute requireAuth={true}>
              <Recursos />
            </ProtectedRoute>
          } />

          <Route path="/recursos/:idTipo" element={
            <ProtectedRoute requireAuth={true}>
              <RecursosCategorias />
            </ProtectedRoute>
          } />

          <Route path="/recursos/:idTipo/categoria/:idCategoria" element={
            <ProtectedRoute requireAuth={true}>
              <RecursosDetalle />
            </ProtectedRoute>
          } />

          <Route path="/recursos/ver/:idRecurso" element={
            <ProtectedRoute requireAuth={true}>
              <RecursoVerPage />
            </ProtectedRoute>
          } />

          {/* Exámenes */}
          <Route path="/examenes" element={
            <ProtectedRoute requireAuth={true}>
              <ExamenesPage />
            </ProtectedRoute>
          } />

          <Route path="/examenes/:idExamen" element={
            <ProtectedRoute requireAuth={true}>
              <ExamenDetalle />
            </ProtectedRoute>
          } />

          <Route path="/examenes/:idExamen/resolver" element={
            <ProtectedRoute requireAuth={true}>
              <ExamenResolver />
            </ProtectedRoute>
          } />

          <Route path="/examenes/:idExamen/resultado" element={
            <ProtectedRoute requireAuth={true}>
              <ExamenResultado />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}