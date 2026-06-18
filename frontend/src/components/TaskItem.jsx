import React, { useState } from 'react';

function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  function handleSave() {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    onUpdate(task.id, { title: trimmed, description: editDescription.trim() });
    setEditing(false);
  }

  function handleCancel() {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditing(false);
  }

  const createdDate = new Date(task.createdAt).toLocaleDateString();

  return (
    <div className={`task-item${task.completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id, task.completed)}
      />
      {editing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSave}>
              Save
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="task-content">
          <div className="task-title">{task.title}</div>
          {task.description && (
            <div className="task-description">{task.description}</div>
          )}
          <div className="task-meta">Created: {createdDate}</div>
        </div>
      )}
      {!editing && (
        <div className="task-actions">
          <button className="btn-edit" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
