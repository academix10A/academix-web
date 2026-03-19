import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Vista general del sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-large">
        <div className="stat-card-large">
          <div className="stat-icon-large primary">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Usuarios</p>
            <p className="stat-value-large">1,234</p>
            <p className="stat-change positive">
              <TrendingUp size={16} />
              +12% vs mes anterior
            </p>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon-large secondary">
            <Package size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Productos</p>
            <p className="stat-value-large">567</p>
            <p className="stat-change positive">
              <TrendingUp size={16} />
              +8% vs mes anterior
            </p>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon-large accent">
            <DollarSign size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ventas del Mes</p>
            <p className="stat-value-large">$89,234</p>
            <p className="stat-change positive">
              <TrendingUp size={16} />
              +15% vs mes anterior
            </p>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon-large info">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Tasa de Conversión</p>
            <p className="stat-value-large">3.2%</p>
            <p className="stat-change negative">
              <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />
              -2% vs mes anterior
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2 className="section-title">Actividad Reciente</h2>
        <div className="activity-list">
          {[
            { text: 'Nuevo usuario registrado: Juan Pérez', time: 'Hace 5 minutos', type: 'user' },
            { text: 'Producto actualizado: Laptop HP', time: 'Hace 15 minutos', type: 'product' },
            { text: 'Venta realizada: $1,299', time: 'Hace 30 minutos', type: 'sale' },
            { text: 'Nuevo reporte generado', time: 'Hace 1 hora', type: 'report' },
            { text: 'Usuario eliminado: Carlos Ruiz', time: 'Hace 2 horas', type: 'user' }
          ].map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === 'user' && <Users size={16} />}
                {activity.type === 'product' && <Package size={16} />}
                {activity.type === 'sale' && <DollarSign size={16} />}
                {activity.type === 'report' && <TrendingUp size={16} />}
              </div>
              <div className="activity-content">
                <p className="activity-text">{activity.text}</p>
                <p className="activity-time">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;