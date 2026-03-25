import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  BookOpen, 
  ClipboardList,
  Star,
  CreditCard,
  Activity,
  UserCheck,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    usuarios: { total: 0, activos: 0, inactivos: 0, admins: 0 },
    productos: { total: 0 },
    recursos: { total: 0, activos: 0 },
    examenes: { total: 0 },
    membresias: { total: 0 },
    subtemas: { total: 0 },
    beneficios: { total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const COLORS = {
    primary: '#00CED1',
    secondary: '#00B2D6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    purple: '#a855f7'
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchAllStats();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;

      const response = await fetch(`http://127.0.0.1:8000/api/usuarios/${userId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const [usuariosRes, productosRes, recursosRes, examenesRes, membresiasRes, subtemasRes, beneficiosRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/usuarios/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/producto/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/recurso/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/examen/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/membresias/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/subtemas/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/beneficios/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const usuarios = await usuariosRes.json();
      const productos = await productosRes.json();
      const recursos = await recursosRes.json();
      const examenes = await examenesRes.json();
      const membresias = await membresiasRes.json();
      const subtemas = await subtemasRes.json();
      const beneficios = await beneficiosRes.json();

      setStats({
        usuarios: {
          total: usuarios.length || 0,
          activos: usuarios.filter(u => u.id_estado === 1).length || 0,
          inactivos: usuarios.filter(u => u.id_estado !== 1).length || 0,
          admins: usuarios.filter(u => u.id_rol === 1).length || 0
        },
        productos: { total: productos.length || 0 },
        recursos: { 
          total: recursos.length || 0,
          activos: recursos.filter(r => r.id_estado === 1).length || 0
        },
        examenes: { total: examenes.length || 0 },
        membresias: { total: membresias.length || 0 },
        subtemas: { total: subtemas.length || 0 },
        beneficios: { total: beneficios.length || 0 }
      });

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header con saludo personalizado */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {getGreeting()}, {currentUser?.nombre || 'Admin'}! 👋
          </h1>
          <p className="page-subtitle" style={{ fontSize: '1.125rem' }}>
            Aquí está el resumen de tu plataforma educativa
          </p>
        </div>
      </div>

      {/* Stats Cards Principales */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Usuarios</p>
            <p className="stat-value">{stats.usuarios.total}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--admin-success)', marginTop: '0.5rem' }}>
              <UserCheck size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
              {stats.usuarios.activos} activos
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Productos</p>
            <p className="stat-value">{stats.productos.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Recursos</p>
            <p className="stat-value">{stats.recursos.total}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--admin-success)', marginTop: '0.5rem' }}>
              {stats.recursos.activos} activos
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <ClipboardList size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Exámenes</p>
            <p className="stat-value">{stats.examenes.total}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        
        {/* Gráfico de Pastel - Usuarios */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: '12px',
          border: '1px solid var(--admin-border)'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
            👥 Estado de Usuarios
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Activos', value: stats.usuarios.activos },
                  { name: 'Inactivos', value: stats.usuarios.inactivos }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill={COLORS.success} />
                <Cell fill={COLORS.error} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Contenido */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: '12px',
          border: '1px solid var(--admin-border)'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
            📚 Contenido Disponible
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: 'Subtemas', cantidad: stats.subtemas.total },
                { name: 'Recursos', cantidad: stats.recursos.total },
                { name: 'Exámenes', cantidad: stats.examenes.total },
                { name: 'Productos', cantidad: stats.productos.total }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1d2e', 
                  border: '1px solid #00CED1',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="cantidad" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen rápido */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: '12px',
          border: '1px solid var(--admin-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CreditCard size={24} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--admin-gray)' }}>Membresías</p>
            <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--admin-text)' }}>
              {stats.membresias.total}
            </p>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: '12px',
          border: '1px solid var(--admin-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Star size={24} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--admin-gray)' }}>Beneficios</p>
            <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--admin-text)' }}>
              {stats.beneficios.total}
            </p>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: '12px',
          border: '1px solid var(--admin-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={24} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--admin-gray)' }}>Tasa Activos</p>
            <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--admin-text)' }}>
              {stats.usuarios.total > 0 
                ? `${((stats.usuarios.activos / stats.usuarios.total) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div style={{
        padding: '2rem',
        backgroundColor: 'var(--admin-surface)',
        borderRadius: '12px',
        border: '1px solid var(--admin-border)'
      }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
          🚀 Accesos Rápidos
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { label: 'Ver Usuarios', icon: <Users size={20} />, count: stats.usuarios.total },
            { label: 'Ver Productos', icon: <Package size={20} />, count: stats.productos.total },
            { label: 'Ver Recursos', icon: <BookOpen size={20} />, count: stats.recursos.total },
            { label: 'Ver Exámenes', icon: <ClipboardList size={20} />, count: stats.examenes.total }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--admin-background)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--admin-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--admin-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--admin-primary)' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.9375rem', color: 'var(--admin-text)' }}>
                  {item.label}
                </span>
              </div>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                color: 'var(--admin-primary)' 
              }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;