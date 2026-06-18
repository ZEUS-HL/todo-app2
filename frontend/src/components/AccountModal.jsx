import React, { useState, useRef } from 'react';
import { getInitials } from '../utils';

function UserForm({ colors, onSave, onCancel, initial }) {
  const [name, setName]   = useState(initial?.name || '');
  const [color, setColor] = useState(initial?.color || colors[0]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name, color);
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="modal-avatar-preview" style={{ background: color }}>
        {getInitials(name)}
      </div>
      <input
        type="text"
        placeholder="Enter name..."
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={40}
        autoFocus
        className="modal-input"
      />
      <div className="color-swatches">
        {colors.map(c => (
          <button
            type="button"
            key={c}
            className={`color-swatch${color === c ? ' selected' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-modal-save">
          {initial ? 'Save Changes' : 'Create User'}
        </button>
        {onCancel && (
          <button type="button" className="btn-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function AccountModal({
  users, currentUserId, colors,
  onAddUser, onUpdateUser, onDeleteUser, onSwitchUser, onClose,
}) {
  const [view, setView]       = useState('list'); // 'list' | 'add' | 'edit'
  const [editingUser, setEdit] = useState(null);
  const overlayRef            = useRef();

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleAdd(name, color) {
    onAddUser(name, color);
    setView('list');
  }

  function handleEdit(name, color) {
    onUpdateUser(editingUser.id, name, color);
    setView('list');
    setEdit(null);
  }

  function handleDelete(user) {
    if (!window.confirm(`Delete user "${user.name}" and all their tasks?`)) return;
    onDeleteUser(user.id);
    setView('list');
  }

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal">

        {/* Header */}
        <div className="modal-header">
          <h2>
            {view === 'add'  ? 'New User' :
             view === 'edit' ? 'Edit User' : 'Users'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* List view */}
        {view === 'list' && (
          <>
            <div className="user-list">
              {users.length === 0 && (
                <p className="user-list-empty">No users yet. Create one below.</p>
              )}
              {users.map(u => (
                <div
                  key={u.id}
                  className={`user-row${u.id === currentUserId ? ' active' : ''}`}
                  onClick={() => onSwitchUser(u.id)}
                >
                  <div className="user-avatar" style={{ background: u.color }}>
                    {getInitials(u.name)}
                  </div>
                  <span className="user-name">{u.name}</span>
                  {u.id === currentUserId && <span className="user-badge">Active</span>}
                  <div className="user-row-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="btn-user-edit"
                      onClick={() => { setEdit(u); setView('edit'); }}
                      title="Edit"
                    >✎</button>
                    <button
                      className="btn-user-delete"
                      onClick={() => handleDelete(u)}
                      title="Delete user"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-add-user" onClick={() => setView('add')}>
              + Add New User
            </button>
          </>
        )}

        {/* Add view */}
        {view === 'add' && (
          <UserForm
            colors={colors}
            onSave={handleAdd}
            onCancel={() => setView('list')}
          />
        )}

        {/* Edit view */}
        {view === 'edit' && editingUser && (
          <UserForm
            colors={colors}
            initial={editingUser}
            onSave={handleEdit}
            onCancel={() => { setView('list'); setEdit(null); }}
          />
        )}

      </div>
    </div>
  );
}
