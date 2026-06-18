import React, { useState } from 'react';

function TaskForm({ onAdd, disabled }) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [expanded, setExpanded]     = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (disabled) return;
    onAdd(title, description);
    setTitle('');
    setDescription('');
    setExpanded(false);
  }

  return (
    <div className={`input-card${disabled ? ' input-card-disabled' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <input
            type="text"
            placeholder={disabled ? 'Select a user first...' : 'Add a new task...'}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => !disabled && setExpanded(true)}
            disabled={disabled}
          />
          <button type="submit" className="btn-add" disabled={disabled}>Add</button>
        </div>
        {expanded && !disabled && (
          <textarea
            className="input-description"
            placeholder="Add a description (optional)..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        )}
      </form>
    </div>
  );
}

export default TaskForm;
