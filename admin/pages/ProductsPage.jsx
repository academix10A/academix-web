import { Plus, Search, Filter } from 'lucide-react';
import Table from '../components/Table';

const ProductsPage = () => {
  // Datos de ejemplo
  const productsData = [
    { 
      id: 1, 
      name: 'Laptop HP', 
      category: 'Electrónica', 
      price: 15999, 
      stock: 25,
      status: 'Disponible'
    },
    { 
      id: 2, 
      name: 'Mouse Logitech', 
      category: 'Accesorios', 
      price: 299, 
      stock: 150,
      status: 'Disponible'
    },
    { 
      id: 3, 
      name: 'Teclado Mecánico', 
      category: 'Accesorios', 
      price: 899, 
      stock: 0,
      status: 'Agotado'
    },
    { 
      id: 4, 
      name: 'Monitor Samsung 24"', 
      category: 'Electrónica', 
      price: 3499, 
      stock: 15,
      status: 'Disponible'
    },
    { 
      id: 5, 
      name: 'Audífonos Sony', 
      category: 'Audio', 
      price: 1299, 
      stock: 8,
      status: 'Poco Stock'
    }
  ];

  // Definir columnas
  const columns = [
    { 
      key: 'id', 
      header: 'ID' 
    },
    { 
      key: 'name', 
      header: 'Producto' 
    },
    { 
      key: 'category', 
      header: 'Categoría',
      render: (value) => (
        <span className="badge badge-category">{value}</span>
      )
    },
    { 
      key: 'price', 
      header: 'Precio',
      render: (value) => `$${value.toLocaleString('es-MX')}`
    },
    { 
      key: 'stock', 
      header: 'Stock',
      render: (value, row) => (
        <span className={`stock-badge ${value === 0 ? 'out' : value < 10 ? 'low' : 'ok'}`}>
          {value} unidades
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (value) => (
        <span className={`status-badge ${
          value === 'Disponible' ? 'active' : 
          value === 'Agotado' ? 'inactive' : 'warning'
        }`}>
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
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">Administra el inventario de productos</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">📦</div>
          <div className="stat-content">
            <p className="stat-label">Total Productos</p>
            <p className="stat-value">{productsData.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stock">📊</div>
          <div className="stat-content">
            <p className="stat-label">En Stock</p>
            <p className="stat-value">
              {productsData.reduce((sum, p) => sum + p.stock, 0)}
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon value">💰</div>
          <div className="stat-content">
            <p className="stat-label">Valor Total</p>
            <p className="stat-value">
              ${productsData.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar productos..."
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <select className="filter-select">
            <option value="">Todas las categorías</option>
            <option value="electronica">Electrónica</option>
            <option value="accesorios">Accesorios</option>
            <option value="audio">Audio</option>
          </select>
          
          <button className="btn-filter">
            <Filter size={18} />
            <span>Más filtros</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={productsData} />

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

export default ProductsPage;