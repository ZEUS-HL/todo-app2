import React, { useState, useEffect, useRef } from 'react';

function AccountModal({ user, colors, onSave, onClose }) {
  const [name, setName] = useState(user.name);
  const [color, setColor] = useState(user.color);
  const overlayRef = useRef();

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function getInitials(n) {
    if (!n.trim()) return '?';
    return n.trim().split(' ').map(w => w[0].toUpperCase()).slice(0, 2).join('');
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Account</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-avatar-preview" style={{ background: color }}>
          {getInitials(name)}
        </div>

        <div className="modal-field">
          <label>Display Name</label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            maxLength={40}
          />
        </div>

        <div className="modal-field">
          <label>Avatar Color</label>
          <div className="color-swatches">
            {colors.map(c => (
              <button
                key={c}
                className={`color-swatch${color === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-modal-save" onClick={() => onSave({ name, color })}>
            Save
          </button>
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountModal;
