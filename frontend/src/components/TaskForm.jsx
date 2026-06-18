import React, { useState } from 'react';

function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expanded, setExpanded] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    onAdd(title, description);
    setTitle('');
    setDescription('');
    setExpanded(false);
  }

  return (
    <div className="input-card">
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setExpanded(true)}
          />
          <button type="submit" className="btn-add">Add</button>
        </div>
        {expanded && (
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
