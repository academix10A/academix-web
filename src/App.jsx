// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './router/ProtectedRoute'

// Admin / User Apps
import AdminApp from './pages/admin/AdminApp'

// Membresia
import PagarMembresia from './pages/Membresia.jsx'

// Recursos
import RecursoVerPage from './pages/RecursoVerPage.jsx'
import Recursos from './pages/Recursos.jsx'
import RecursosCategorias from './pages/RecursosCategorias.jsx'
import RecursosDetalle from './pages/RecursosDetalle.jsx'
import Biblioteca from './pages/Biblioteca'

// Exámenes
import ExamenesPage from './pages/examenes/ExamenesPage.jsx'
import ExamenDetalle from './pages/examenes/ExamenesDetalle.jsx'
import ExamenResolver from './pages/examenes/ExamenResolver.jsx'
import ExamenResultado from './pages/examenes/ExamenResultado.jsx'

// Públicas
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'

// Notas
import NotaDetallePage from './pages/NotaDetallePage'

// Publicacion
import PublicacionesPage    from './pages/PublicacionesPage'
import PublicacionDetallePage from './pages/PublicacionDetallePage'

// Usuario
import PerfilPage from './pages/PerfilPage.jsx'
import AjustesPage from './pages/AjustesPage.jsx'

// Admin dashboard
// import AdminDashboard from './pages/admin/Dashboard.jsx'

export default function App() {
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

          <Route path="/perfil" element={
            <ProtectedRoute requireAuth={true}>
              <PerfilPage />
            </ProtectedRoute>
          } />

          <Route path="/ajustes" element={
            <ProtectedRoute requireAuth={true}>
              <AjustesPage />
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
          <Route path="/membresias" element={
            <ProtectedRoute requireAuth={true}>
              <PagarMembresia />
            </ProtectedRoute>
          } />

          {/* Notas */}
          <Route path="/notas/:idNota" element={
            <ProtectedRoute requireAuth={true}>
              <NotaDetallePage />
            </ProtectedRoute> 
          } />

          {/* Publicaciones */}
          <Route path="/publicaciones" element={
            <ProtectedRoute requireAuth={true}>
              <PublicacionesPage />
            </ProtectedRoute>
          } />
          <Route path="/publicaciones/:idPublicacion" element={
            <ProtectedRoute requireAuth={true}>
              <PublicacionDetallePage />
            </ProtectedRoute>
          } />
          
          {/* Recursos */}
          <Route path="/recursos" element={
            <ProtectedRoute requireAuth={true}>
              <Recursos />
            </ProtectedRoute>
          } />

          <Route path="/biblioteca" element={
            <ProtectedRoute requireAuth={true}>
              <Biblioteca />
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

          <Route path="*" element={<Home />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}