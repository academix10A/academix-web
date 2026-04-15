import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '450px', textAlign: 'center' }}
      >
        <div style={{ padding: '3rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: type === 'danger' 
              ? 'linear-gradient(135deg, var(--admin-error), #dc2626)'
              : 'linear-gradient(135deg, var(--admin-warning), #d97706)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            marginBottom: '1.5rem',
            color: 'white'
          }}>
            <AlertTriangle size={40} />
          </div>
          
          <h2 style={{ 
            fontSize: '1.75rem', 
            marginBottom: '1rem', 
            color: 'var(--admin-text)' 
          }}>
            {title}
          </h2>
          
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'var(--admin-gray)', 
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            {message}
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center' 
          }}>
            <button 
              className="btn-secondary"
              onClick={onClose}
              style={{ minWidth: '120px' }}
            >
              {cancelText}
            </button>
            <button 
              className="btn-delete"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{ minWidth: '120px' }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;