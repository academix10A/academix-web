import AdminApp from '../admin/AdminApp';
import UserApp from '../user/UserApp';

function App() {
  // Obtener el rol del usuario de localStorage
  const userRole = localStorage.getItem('user_role');
  const hasToken = !!localStorage.getItem('auth_token');
  
  // Si tiene token y es admin (rol = 1)
  if (hasToken && userRole === '1') {
    return <AdminApp />;
  }
  
  // Si tiene token y es usuario normal o premium (rol = 2 o 3)
  if (hasToken && (userRole === '2' || userRole === '3')) {
    return <UserApp />;
  }
  
  // Sin sesión o rol inválido, mostrar login (AdminApp lo maneja)
  return <AdminApp />;
}

export default App;