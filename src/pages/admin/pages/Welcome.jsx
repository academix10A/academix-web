import { Shield, Users, Package, TrendingUp } from 'lucide-react';

const Welcome = () => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        {/* Icono principal */}
        <div className="welcome-icon">
          <Shield size={64} color="#181935" strokeWidth={2.5} />
        </div>

        {/* Título y subtítulo */}
        <h1 className="welcome-title">Bienvenido Admin</h1>
        <p className="welcome-subtitle">
          Panel de Administración - Academix
        </p>

        {/* Estadísticas rápidas */}
        <div className="welcome-stats">
          <div className="stat-card">
            <div className="stat-value">1,234</div>
            <div className="stat-label">Usuarios</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">567</div>
            <div className="stat-label">Productos</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">89</div>
            <div className="stat-label">Reportes</div>
          </div>
        </div>

        {/* Botón de acción */}
        <button className="admin-btn">
          <TrendingUp size={20} />
          <span>Ver Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default Welcome;