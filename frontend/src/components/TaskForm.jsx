import React, { useState } from 'react';

function TaskForm({ onAdd }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onAdd(value);
    setValue('');
  }

  return (
    <div className="input-card">
      <form className="input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button type="submit" className="btn-add">Add</button>
      </form>
    </div>
  );
}

export default TaskForm;
