import { X } from 'lucide-react';
import './Modal.css';

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Confirm</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message || 'Are you sure?'}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
