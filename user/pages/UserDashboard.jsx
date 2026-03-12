import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

const UserDashboard = () => {
  return (
    <div className="user-page-container">
      {/* Header */}
      <div className="user-page-header">
        <div>
          <h1 className="user-page-title">Bienvenido de nuevo</h1>
          <p className="user-page-subtitle">Aquí está tu progreso de hoy</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div className="user-stat-icon primary">
            <BookOpen size={32} />
          </div>
          <div className="user-stat-content">
            <p className="user-stat-label">Cursos Activos</p>
            <p className="user-stat-value">3</p>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon secondary">
            <Clock size={32} />
          </div>
          <div className="user-stat-content">
            <p className="user-stat-label">Horas de Estudio</p>
            <p className="user-stat-value">24.5</p>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon accent">
            <Award size={32} />
          </div>
          <div className="user-stat-content">
            <p className="user-stat-label">Certificados</p>
            <p className="user-stat-value">2</p>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon success">
            <TrendingUp size={32} />
          </div>
          <div className="user-stat-content">
            <p className="user-stat-label">Progreso General</p>
            <p className="user-stat-value">68%</p>
          </div>
        </div>
      </div>

      {/* Cursos en Progreso */}
      <div className="user-section">
        <h2 className="user-section-title">Continúa Aprendiendo</h2>
        <div className="user-courses-grid">
          {[1, 2, 3].map((course) => (
            <div key={course} className="user-course-card">
              <div className="user-course-header">
                <div className="user-course-badge">En Progreso</div>
              </div>
              <h3 className="user-course-title">Curso de Ejemplo {course}</h3>
              <p className="user-course-description">
                Descripción breve del curso y lo que aprenderás en este módulo.
              </p>
              <div className="user-course-progress">
                <div className="user-progress-bar">
                  <div className="user-progress-fill" style={{ width: `${course * 25}%` }}></div>
                </div>
                <span className="user-progress-text">{course * 25}% completado</span>
              </div>
              <button className="user-btn-continue">Continuar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;