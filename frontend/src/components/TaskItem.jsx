import React, { useState } from 'react';

function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onUpdate(task.id, trimmed);
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setDraft(task.title); setEditing(false); }
  }

  return (
    <div className={`task-item${task.completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />

      {editing ? (
        <input
          className="task-edit-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span className="task-text">{task.title}</span>
      )}

      <div className="task-actions">
        {editing ? (
          <>
            <button className="btn-save" onClick={handleSave}>Save</button>
            <button className="btn-cancel" onClick={() => { setDraft(task.title); setEditing(false); }}>Cancel</button>
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
