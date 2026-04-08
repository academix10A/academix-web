import { useState, useEffect } from 'react';
import { Search, CreditCard, Users, Calendar, TrendingUp, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  usuarioMembresiaService,
  usuariosService,
  membresiasService
} from '../../../services/api'

const UsuarioMembresiasPage = () => {
  const [usuarioMembresias, setUsuarioMembresias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActiva, setFilterActiva] = useState('todas'); // 'todas', 'activas', 'inactivas'
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    inactivas: 0,
    premium: 0,
    porMembresia: [],
    ingresoTotal: 0,
    ingresoMensual: 0,
    mesMasRentable: { mes: '', ingreso: 0 },
    ingresosPorMes: []
  });

  const COLORS = {
    primary: '#00CED1',
    secondary: '#00B2D6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    purple: '#a855f7'
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [usuarioMembresias, membresias]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const [usuarioMembresiasRes, usuariosRes, membresiasRes] = await Promise.all([
        usuarioMembresiaService.getAll(token),
        usuariosService.getAll(token),
        membresiasService.getAll(token),
      ]);

      const usuarioMembresiasData = usuarioMembresiasRes
      const usuariosData = usuariosRes
      const membresiasData = membresiasRes

      setUsuarioMembresias(Array.isArray(usuarioMembresiasData) ? usuarioMembresiasData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setMembresias(Array.isArray(membresiasData) ? membresiasData : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = usuarioMembresias.length;
    const activas = usuarioMembresias.filter(um => um.activa).length;
    const inactivas = total - activas;

    // Contar por tipo de membresía
    const membresiaCounts = {};
    usuarioMembresias.forEach(um => {
      const membresia = membresias.find(m => m.id_membresia === um.id_membresia);
      if (membresia && um.activa) {
        membresiaCounts[membresia.nombre] = (membresiaCounts[membresia.nombre] || 0) + 1;
      }
    });

    const porMembresia = Object.keys(membresiaCounts).map(nombre => ({
      nombre,
      cantidad: membresiaCounts[nombre]
    }));

    // Calcular ingresos totales
    let ingresoTotal = 0;
    usuarioMembresias.forEach(um => {
      const membresia = membresias.find(m => m.id_membresia === um.id_membresia);
      if (membresia) {
        ingresoTotal += membresia.costo || 0;
      }
    });

    // Calcular ingresos mensuales (solo activas)
    let ingresoMensual = 0;
    usuarioMembresias.filter(um => um.activa).forEach(um => {
      const membresia = membresias.find(m => m.id_membresia === um.id_membresia);
      if (membresia) {
        ingresoMensual += membresia.costo || 0;
      }
    });

    // Calcular ingresos por mes (últimos 6 meses)
    const ingresosPorMesMap = {};
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    usuarioMembresias.forEach(um => {
      if (um.fecha_inicio) {
        const fecha = new Date(um.fecha_inicio);
        const mesAnio = `${mesesNombres[fecha.getMonth()]} ${fecha.getFullYear()}`;
        const membresia = membresias.find(m => m.id_membresia === um.id_membresia);
        
        if (membresia) {
          if (!ingresosPorMesMap[mesAnio]) {
            ingresosPorMesMap[mesAnio] = 0;
          }
          ingresosPorMesMap[mesAnio] += membresia.costo || 0;
        }
      }
    });

    // Convertir a array y ordenar por fecha
    const ingresosPorMes = Object.keys(ingresosPorMesMap)
      .map(mes => ({
        mes,
        ingreso: ingresosPorMesMap[mes]
      }))
      .sort((a, b) => {
        const [mesA, anioA] = a.mes.split(' ');
        const [mesB, anioB] = b.mes.split(' ');
        const fechaA = new Date(parseInt(anioA), mesesNombres.indexOf(mesA));
        const fechaB = new Date(parseInt(anioB), mesesNombres.indexOf(mesB));
        return fechaA - fechaB;
      })
      .slice(-6); // Últimos 6 meses

    // Encontrar mes más rentable
    const mesMasRentable = ingresosPorMes.length > 0 
      ? ingresosPorMes.reduce((max, current) => 
          current.ingreso > max.ingreso ? current : max
        , { mes: 'N/A', ingreso: 0 })
      : { mes: 'N/A', ingreso: 0 };

    setStats({
      total,
      activas,
      inactivas,
      premium: activas,
      porMembresia,
      ingresoTotal,
      ingresoMensual,
      mesMasRentable,
      ingresosPorMes
    });
  };

  const getNombreUsuario = (idUsuario) => {
    const usuario = usuarios.find(u => u.id_usuario === idUsuario);
    return usuario ? `${usuario.nombre} ${usuario.apellido_paterno}` : `Usuario ${idUsuario}`;
  };

  const getNombreMembresia = (idMembresia) => {
    const membresia = membresias.find(m => m.id_membresia === idMembresia);
    return membresia ? membresia.nombre : 'Sin nombre';
  };

  const getCostoMembresia = (idMembresia) => {
    const membresia = membresias.find(m => m.id_membresia === idMembresia);
    return membresia ? membresia.costo : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDiasRestantes = (fechaFin) => {
    if (!fechaFin) return 0;
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diffTime = fin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredMembresias = usuarioMembresias.filter(um => {
    const nombreUsuario = getNombreUsuario(um.id_usuario).toLowerCase();
    const nombreMembresia = getNombreMembresia(um.id_membresia).toLowerCase();
    const matchSearch = nombreUsuario.includes(searchTerm.toLowerCase()) || 
                       nombreMembresia.includes(searchTerm.toLowerCase());

    if (filterActiva === 'activas') return um.activa && matchSearch;
    if (filterActiva === 'inactivas') return !um.activa && matchSearch;
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <p>Cargando membresías de usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Membresías de Usuarios</h1>
          <p className="page-subtitle">Gestiona y visualiza las membresías activas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon users">
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Membresías</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Activas</p>
            <p className="stat-value">{stats.activas}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--admin-success)', marginTop: '0.5rem' }}>
              {stats.total > 0 ? `${((stats.activas / stats.total) * 100).toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ingreso Total</p>
            <p className="stat-value" style={{ fontSize: '1.75rem' }}>${stats.ingresoTotal.toLocaleString()}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--admin-warning)', marginTop: '0.5rem' }}>
              Histórico
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ingreso Mensual</p>
            <p className="stat-value" style={{ fontSize: '1.75rem' }}>${stats.ingresoMensual.toLocaleString()}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--admin-success)', marginTop: '0.5rem' }}>
              Activas
            </p>
          </div>
        </div>
      </div>

      {/* Card destacada: Mes más rentable */}
      <div style={{
        padding: '2rem',
        backgroundColor: 'var(--admin-surface)',
        borderRadius: '12px',
        border: '2px solid var(--admin-primary)',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(0, 206, 209, 0.1), rgba(0, 178, 214, 0.05))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--admin-gray)', marginBottom: '0.5rem' }}>
              💰 Mes Más Rentable
            </p>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-text)', marginBottom: '0.5rem' }}>
              {stats.mesMasRentable.mes}
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--admin-gray)' }}>
              Total generado en ese mes
            </p>
          </div>
          <div style={{
            padding: '1.5rem 2.5rem',
            backgroundColor: 'rgba(0, 206, 209, 0.2)',
            borderRadius: '12px',
            border: '2px solid var(--admin-primary)'
          }}>
            <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
              ${stats.mesMasRentable.ingreso.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Gráfico de Línea - Ingresos por mes */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: '12px',
          border: '1px solid var(--admin-border)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
            📈 Evolución de Ingresos (Últimos 6 Meses)
          </h3>
          {stats.ingresosPorMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.ingresosPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis 
                  dataKey="mes" 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1d2e', 
                    border: '2px solid #00CED1',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Ingreso']}
                />
                <Line 
                  type="monotone" 
                  dataKey="ingreso" 
                  stroke={COLORS.primary} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-gray)' }}>
              No hay datos de ingresos disponibles
            </div>
          )}
        </div>

        {/* Grid de gráficos existentes */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {/* Gráfico de Pastel */}
          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--admin-surface)',
            borderRadius: '12px',
            border: '1px solid var(--admin-border)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
              📊 Estado de Membresías
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Activas', value: stats.activas },
                    { name: 'Inactivas', value: stats.inactivas }
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

          {/* Gráfico de Barras */}
          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--admin-surface)',
            borderRadius: '12px',
            border: '1px solid var(--admin-border)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--admin-text)' }}>
              💎 Membresías por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.porMembresia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="nombre" stroke="#9ca3af" />
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
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div className="search-box" style={{ flex: '1', minWidth: '250px' }}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por usuario o membresía..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'var(--admin-background)',
              border: 'none',
              color: 'var(--admin-text)',
              flex: 1
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn-secondary"
            onClick={() => setFilterActiva('todas')}
            style={{
              backgroundColor: filterActiva === 'todas' ? 'var(--admin-primary)' : 'transparent',
              color: filterActiva === 'todas' ? 'white' : 'var(--admin-gray)',
              border: `1px solid ${filterActiva === 'todas' ? 'var(--admin-primary)' : 'var(--admin-border)'}`
            }}
          >
            Todas
          </button>
          <button
            className="btn-secondary"
            onClick={() => setFilterActiva('activas')}
            style={{
              backgroundColor: filterActiva === 'activas' ? 'var(--admin-success)' : 'transparent',
              color: filterActiva === 'activas' ? 'white' : 'var(--admin-gray)',
              border: `1px solid ${filterActiva === 'activas' ? 'var(--admin-success)' : 'var(--admin-border)'}`
            }}
          >
            Activas
          </button>
          <button
            className="btn-secondary"
            onClick={() => setFilterActiva('inactivas')}
            style={{
              backgroundColor: filterActiva === 'inactivas' ? 'var(--admin-error)' : 'transparent',
              color: filterActiva === 'inactivas' ? 'white' : 'var(--admin-gray)',
              border: `1px solid ${filterActiva === 'inactivas' ? 'var(--admin-error)' : 'var(--admin-border)'}`
            }}
          >
            Inactivas
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Membresía</th>
              <th>Costo</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Días Restantes</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembresias.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-gray)' }}>
                  No se encontraron membresías
                </td>
              </tr>
            ) : (
              filteredMembresias.map((um) => (
                <tr key={um.id_usuario_membresia}>
                  <td>{um.id_usuario_membresia}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="var(--admin-primary)" />
                      {getNombreUsuario(um.id_usuario)}
                    </div>
                  </td>
                  <td>
                    <span className="badge primary">
                      {getNombreMembresia(um.id_membresia)}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: '600', 
                      color: 'var(--admin-success)',
                      fontSize: '1.0625rem'
                    }}>
                      ${getCostoMembresia(um.id_membresia)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color="var(--admin-gray)" />
                      {formatDate(um.fecha_inicio)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color="var(--admin-gray)" />
                      {formatDate(um.fecha_fin)}
                    </div>
                  </td>
                  <td>
                    {um.activa ? (
                      <span style={{
                        padding: '0.375rem 0.875rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--admin-success)',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '0.9375rem'
                      }}>
                        {getDiasRestantes(um.fecha_fin)} días
                      </span>
                    ) : (
                      <span style={{ color: 'var(--admin-gray)' }}>-</span>
                    )}
                  </td>
                  <td>
                    {um.activa ? (
                      <span className="badge success">
                        <CheckCircle size={14} />
                        Activa
                      </span>
                    ) : (
                      <span className="badge error">
                        <XCircle size={14} />
                        Inactiva
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuarioMembresiasPage;