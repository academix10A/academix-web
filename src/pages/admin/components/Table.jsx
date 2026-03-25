import { Edit, Trash2, Eye } from 'lucide-react';

const Table = ({ columns, data, actions = true }) => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
            {actions && <th className="actions-column">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="no-data">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render 
                      ? column.render(row[column.key], row) 
                      : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="action-btn edit"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;