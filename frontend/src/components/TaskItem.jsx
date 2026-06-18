import React, { useState } from 'react';

function fmt(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftDesc, setDraftDesc] = useState(task.description || '');

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

  function handleKeyDown(e) {
    if (e.key === 'Escape') handleCancel();
  }

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

        <div className="task-dates">
          <span>Created: {fmt(task.createdAt)}</span>
          {task.updatedAt && <span>Edited: {fmt(task.updatedAt)}</span>}
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
            <button className="btn-delete" onClick={() => onDelete(task.id)} title="Delete">✕</button>
          </>
        )}
      </div>
    </div>
  );
}

export default TaskItem;
