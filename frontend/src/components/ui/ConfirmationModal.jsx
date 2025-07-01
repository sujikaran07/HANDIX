import React from 'react';
import './ConfirmationModal.css';

// Reusable confirmation modal component for user confirmations
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  // Don't render modal if not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h5>{title}</h5>
        <p>{message}</p>
        {/* Action buttons for user choice */}
        <div className="modal-actions">
          <button className="btn btn-primary me-2" onClick={onConfirm}>Confirm</button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;