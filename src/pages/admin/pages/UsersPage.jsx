import { Plus, Search } from 'lucide-react';
import Table from '../components/Table';

const UsersPage = () => {
  // Datos de ejemplo
  const usersData = [
    { 
      id: 1, 
      name: 'Juan Pérez', 
      email: 'juan@example.com', 
      role: 'Admin', 
      status: 'Activo' 
    },
    { 
      id: 2, 
      name: 'María González', 
      email: 'maria@example.com', 
      role: 'Moderador', 
      status: 'Activo' 
    },
    { 
      id: 3, 
      name: 'Carlos Ruiz', 
      email: 'carlos@example.com', 
      role: 'Usuario', 
      status: 'Inactivo' 
    },
    { 
      id: 4, 
      name: 'Ana Martínez', 
      email: 'ana@example.com', 
      role: 'Usuario', 
      status: 'Activo' 
    },
    { 
      id: 5, 
      name: 'Luis Fernández', 
      email: 'luis@example.com', 
      role: 'Moderador', 
      status: 'Activo' 
    }
  ];

  // Definir columnas de la tabla
  const columns = [
    { 
      key: 'id', 
      header: 'ID' 
    },
    { 
      key: 'name', 
      header: 'Nombre' 
    },
    { 
      key: 'email', 
      header: 'Email' 
    },
    { 
      key: 'role', 
      header: 'Rol',
      render: (value) => (
        <span className={`badge badge-${value.toLowerCase()}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (value) => (
        <span className={`status-badge ${value === 'Activo' ? 'active' : 'inactive'}`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestiona los usuarios del sistema</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar usuarios..."
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <select className="filter-select">
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="moderador">Moderador</option>
            <option value="usuario">Usuario</option>
          </select>
          
          <select className="filter-select">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={usersData} />

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn">Anterior</button>
        <div className="pagination-pages">
          <button className="pagination-page active">1</button>
          <button className="pagination-page">2</button>
          <button className="pagination-page">3</button>
        </div>
        <button className="pagination-btn">Siguiente</button>
      </div>
    </div>
  );
};

export default UsersPage;