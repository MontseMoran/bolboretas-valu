import "./modal.scss";

export default function Modal({ isOpen, onClose, children }) {

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        
        <button
          className="modal-close"
          onClick={onClose}
          type="button"
          aria-label="Cerrar"
        >
          ×
        </button>

        {children}

      </div>

    </div>
  );
}