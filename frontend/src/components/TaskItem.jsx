import React, { useState } from 'react';
import { getInitials } from '../utils';

function fmt(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TaskItem({ task, users, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing]       = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftDesc, setDraftDesc]   = useState(task.description || '');

  const creator = users?.find(u => u.id === task.userId);

  function handleSave() {
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    onUpdate(task.id, trimmed, draftDesc.trim());
    setEditing(false);
  }

  function handleCancel() {
    setDraftTitle(task.title);
    setDraftDesc(task.description || '');
    setEditing(false);
  }

  function handleKeyDown(e) { if (e.key === 'Escape') handleCancel(); }

  return (
    <div className={`task-item${task.completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />

      <div className="task-body">
        {editing ? (
          <>
            <input
              className="task-edit-input"
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task title"
              autoFocus
            />
            <textarea
              className="task-edit-textarea"
              value={draftDesc}
              onChange={e => setDraftDesc(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Description (optional)..."
              rows={2}
            />
          </>
        ) : (
          <>
            <span className="task-text">{task.title}</span>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
          </>
        )}

        <div className="task-meta-row">
          {creator && (
            <span className="task-creator">
              <span className="task-creator-dot" style={{ background: creator.color }}>
                {getInitials(creator.name)}
              </span>
              {creator.name}
            </span>
          )}
          <div className="task-dates">
            <span>Created: {fmt(task.createdAt)}</span>
            {task.updatedAt && <span>Edited: {fmt(task.updatedAt)}</span>}
          </div>
        </div>
      </div>

      <div className="task-actions">
        {editing ? (
          <>
            <button className="btn-save" onClick={handleSave}>Save</button>
            <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn-edit" onClick={() => setEditing(true)}>Edit</button>
            <button
              className="btn-delete"
              title="Delete"
              onClick={() => { if (window.confirm(`Delete "${task.title}"?`)) onDelete(task.id); }}
            >✕</button>
          </>
        )}
      </div>
    </div>
  );
}

export default TaskItem;
