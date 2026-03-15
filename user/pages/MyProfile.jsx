const MyProfile = () => {
  return (
    <div className="user-page-container">
      <div className="user-page-header">
        <div>
          <h1 className="user-page-title">Mi Perfil</h1>
          <p className="user-page-subtitle">Gestiona tu información personal</p>
        </div>
      </div>

      <div className="user-placeholder">
        <p>👤 Sección de perfil en construcción...</p>
        <p className="user-placeholder-subtitle">
          Esta sección será desarrollada por otro miembro del equipo
        </p>
      </div>
    </div>
  );
};

export default MyProfile;