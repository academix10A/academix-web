import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Package, BookOpen, ClipboardList, Calendar, Download, PieChart as PieChartIcon } from 'lucide-react';
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
import { examenesService, membresiasService, recursosService, subtemasService, usuariosService } from '../../../services/api';

const ReportsPage = () => {
  const [stats, setStats] = useState({
    usuarios: { total: 0, activos: 0, inactivos: 0, admins: 0 },
    recursos: { total: 0, activos: 0 },
    examenes: { total: 0 },
    membresias: { total: 0 },
    subtemas: { total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  // Colores para los gráficos
  const COLORS = {
    primary: '#00CED1',
    secondary: '#00B2D6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    purple: '#a855f7',
    pink: '#ec4899'
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch usuarios
      const usuarios = await usuariosService.getAll()


      // Fetch recursos
      const recursos = await recursosService.getAll()

      // Fetch examenes
      const examenes = await examenesService.getAll()

      // Fetch membresias
      const membresias = await membresiasService.getAll()

      // Fetch subtemas
      const subtemas = await subtemasService.getAll()

      // Procesar estadísticas
      setStats({
        usuarios: {
          total: usuarios.length || 0,
          activos: usuarios.filter(u => u.id_estado === 1).length || 0,
          inactivos: usuarios.filter(u => u.id_estado !== 1).length || 0,
          admins: usuarios.filter(u => u.id_rol === 1).length || 0
        },
        recursos: {
          total: recursos.length || 0,
          activos: recursos.filter(r => r.id_estado === 1).length || 0
        },
        examenes: {
          total: examenes.length || 0
        },
        membresias: {
          total: membresias.length || 0
        },
        subtemas: {
          total: subtemas.length || 0
        }
      });

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Métrica', 'Valor'],
      ['Usuarios Totales', stats.usuarios.total],
      ['Usuarios Activos', stats.usuarios.activos],
      ['Usuarios Inactivos', stats.usuarios.inactivos],
      ['Administradores', stats.usuarios.admins],
      ['Recursos Totales', stats.recursos.total],
      ['Recursos Activos', stats.recursos.activos],
      ['Exámenes', stats.examenes.total],
      ['Membresías', stats.membresias.total],
      ['Subtemas', stats.subtemas.total]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-academix-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes y Estadísticas</h1>
          <p className="page-subtitle">Visualiza el rendimiento de la plataforma</p>
        </div>
        <button className="btn-primary" onClick={exportToCSV}>
          <Download size={20} />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filtros de período */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: 'var(--admin-surface)',
        borderRadius: '12px',
        border: '1px solid var(--admin-border)'
      }}>
        <Calendar size={20} style={{ color: 'var(--admin-primary)' }} />
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          {['semana', 'mes', 'trimestre', 'año'].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: selectedPeriod === period ? 'var(--admin-primary)' : 'transparent',
                color: selectedPeriod === period ? 'var(--admin-background)' : 'var(--admin-text)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: selectedPeriod === period ? '600' : '500',
                transition: 'all 0.3s ease'
              }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
          📊 Resumen General
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Usuarios</p>
              <p className="stat-value">{stats.usuarios.total}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-success)', marginTop: '0.5rem' }}>
                ✓ {stats.usuarios.activos} activos
              </p>
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
                ✓ {stats.recursos.activos} activos
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
      </div>

      {/* Desglose de Usuarios */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
          👥 Usuarios por Categoría
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--admin-surface)',
            borderRadius: '12px',
            border: '2px solid var(--admin-success)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '4px', 
              background: 'var(--admin-success)' 
            }} />
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--admin-success)' }}>
              Usuarios Activos
            </h3>
            <p style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--admin-text)' }}>
              {stats.usuarios.activos}
            </p>
            <p style={{ color: 'var(--admin-gray)', fontSize: '0.9375rem' }}>
              {stats.usuarios.total > 0 
                ? `${((stats.usuarios.activos / stats.usuarios.total) * 100).toFixed(1)}% del total`
                : '0% del total'
              }
            </p>
          </div>

          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--admin-surface)',
            borderRadius: '12px',
            border: '2px solid var(--admin-error)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '4px', 
              background: 'var(--admin-error)' 
            }} />
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--admin-error)' }}>
              Usuarios Inactivos
            </h3>
            <p style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--admin-text)' }}>
              {stats.usuarios.inactivos}
            </p>
            <p style={{ color: 'var(--admin-gray)', fontSize: '0.9375rem' }}>
              {stats.usuarios.total > 0 
                ? `${((stats.usuarios.inactivos / stats.usuarios.total) * 100).toFixed(1)}% del total`
                : '0% del total'
              }
            </p>
          </div>

          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--admin-surface)',
            borderRadius: '12px',
            border: '2px solid var(--admin-primary)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '4px', 
              background: 'var(--admin-primary)' 
            }} />
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--admin-primary)' }}>
              Administradores
            </h3>
            <p style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--admin-text)' }}>
              {stats.usuarios.admins}
            </p>
            <p style={{ color: 'var(--admin-gray)', fontSize: '0.9375rem' }}>
              {stats.usuarios.total > 0 
                ? `${((stats.usuarios.admins / stats.usuarios.total) * 100).toFixed(1)}% del total`
                : '0% del total'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Educativo */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
          📚 Contenido Educativo
        </h2>
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: '12px',
          border: '1px solid var(--admin-border)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-gray)', marginBottom: '0.5rem' }}>
                Subtemas
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
                {stats.subtemas.total}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-gray)', marginBottom: '0.5rem' }}>
                Exámenes
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
                {stats.examenes.total}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-gray)', marginBottom: '0.5rem' }}>
                Recursos Activos
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-success)' }}>
                {stats.recursos.activos}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-gray)', marginBottom: '0.5rem' }}>
                Membresías
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
                {stats.membresias.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
          📈 Análisis Visual
        </h2>
        
        {/* Gráficos en grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
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
              👥 Distribución de Usuarios
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Activos', value: stats.usuarios.activos },
                    { name: 'Inactivos', value: stats.usuarios.inactivos },
                    { name: 'Admins', value: stats.usuarios.admins }
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
                  <Cell fill={COLORS.primary} />
                </Pie>
                <Tooltip />
                <Legend />
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
              📊 Contenido por Categoría
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Recursos', cantidad: stats.recursos.total },
                  { name: 'Exámenes', cantidad: stats.examenes.total },
                  { name: 'Subtemas', cantidad: stats.subtemas.total },
                  { name: 'Membresías', cantidad: stats.membresias.total }
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

        {/* Gráfico de línea - Tendencia (simulado) */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: '12px',
          border: '1px solid var(--admin-border)'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
            📈 Tendencia de Usuarios (Últimos 6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { mes: 'Oct', usuarios: Math.max(0, stats.usuarios.total - 15), recursos: Math.max(0, stats.recursos.total - 10) },
                { mes: 'Nov', usuarios: Math.max(0, stats.usuarios.total - 12), recursos: Math.max(0, stats.recursos.total - 8) },
                { mes: 'Dic', usuarios: Math.max(0, stats.usuarios.total - 9), recursos: Math.max(0, stats.recursos.total - 6) },
                { mes: 'Ene', usuarios: Math.max(0, stats.usuarios.total - 6), recursos: Math.max(0, stats.recursos.total - 4) },
                { mes: 'Feb', usuarios: Math.max(0, stats.usuarios.total - 3), recursos: Math.max(0, stats.recursos.total - 2) },
                { mes: 'Mar', usuarios: stats.usuarios.total, recursos: stats.recursos.total }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="mes" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1d2e', 
                  border: '1px solid #00CED1',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="usuarios" 
                stroke={COLORS.primary} 
                strokeWidth={3}
                name="Usuarios"
              />
              <Line 
                type="monotone" 
                dataKey="recursos" 
                stroke={COLORS.success} 
                strokeWidth={3}
                name="Recursos"
              />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--admin-gray)', 
            fontSize: '0.875rem',
            marginTop: '1rem'
          }}>
            * Datos proyectados basados en el total actual
          </p>
        </div>
      </div>

      {/* Tarjeta de última actualización */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'rgba(0, 206, 209, 0.1)',
        borderRadius: '12px',
        border: '1px solid var(--admin-primary)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--admin-text)', fontSize: '0.9375rem' }}>
          📅 Última actualización: {new Date().toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;
