// <<<<<<< HEAD
// // src/App.jsx
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import { AuthProvider } from './hooks/useAuth'
// import ProtectedRoute from './router/ProtectedRoute'

// // Páginas públicas
// import Home  from './pages/Home.jsx'
// import Login from './pages/Login.jsx'
// import Registro from './pages/Registro.jsx'

// // Páginas de usuario autenticado
// // (misma página Home, pero ahora con funciones desbloqueadas según membresía)

// // Páginas de admin
// import AdminDashboard from './pages/admin/Dashboard.jsx'

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>

//           {/*Rutas públicas*/}
//           <Route path="/"        element={<Home />} />
//           <Route path="/login"   element={<Login />} />
//           <Route path="/registro" element={<Registro />} />
          

//           {/*Rutas de usuario autenticado (gratis o premium)*/}
//           {/*
//             requireAuth={true} significa: si no estás logueado → /login
//             No ponemos requireRole porque tanto gratis como premium entran aquí.
//             usePermissions() dentro de cada componente controla qué ven.
//           */}
//           <Route path="/home" element={
//             <ProtectedRoute requireAuth={true}>
//               <Home />
//             </ProtectedRoute>
//           } />

//           <Route path="/admin" element={
//             <ProtectedRoute requireAuth={true} requireRole="admin">
//               <AdminDashboard />
//             </ProtectedRoute>
//           } />

//           <Route path="*" element={<Navigate to="/" replace />} />

//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   )
// }
// =======
// import AdminApp from '../admin/AdminApp';
// import UserApp from '../user/UserApp';

// function App() {
//   // Obtener el rol del usuario de localStorage
//   const userRole = localStorage.getItem('user_role');
//   const hasToken = !!localStorage.getItem('auth_token');
  
//   // Si tiene token y es admin (rol = 1)
//   if (hasToken && userRole === '1') {
//     return <AdminApp />;
//   }
  
//   // Si tiene token y es usuario normal o premium (rol = 2 o 3)
//   if (hasToken && (userRole === '2' || userRole === '3')) {
//     return <UserApp />;
//   }
  
//   // Sin sesión o rol inválido, mostrar login (AdminApp lo maneja)
//   return <AdminApp />;
// }

// export default App;
// >>>>>>> abd99b874deb262eba4191018f173cd0eb07b974

// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './router/ProtectedRoute'

// Apps por rol
import AdminApp from '../admin/AdminApp'
import UserApp from '../user/UserApp'

// Páginas públicas
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'

// Páginas admin
import AdminDashboard from './pages/admin/Dashboard.jsx'

export default function App() {

  // lógica de roles del segundo código
  const userRole = localStorage.getItem('user_role')
  const hasToken = !!localStorage.getItem('auth_token')

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Usuario autenticado */}
          <Route
            path="/home"
            element={
              <ProtectedRoute requireAuth={true}>
                <UserApp />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAuth={true} requireRole="admin">
                <AdminApp />
              </ProtectedRoute>
            }
          />

          {/* Dashboard admin directo si el rol es admin */}
          {hasToken && userRole === '1' && (
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAuth={true} requireRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}