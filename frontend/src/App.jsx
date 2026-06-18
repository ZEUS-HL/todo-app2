import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import './App.css';

const STORAGE_KEY = 'mytasks-v1';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(title, description = '') {
    if (!title.trim()) return setError('Please enter a task.');
    setTasks(prev => [...prev, {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }]);
    setError(null);
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function updateTask(id, title, description = '') {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, title, description, updatedAt: new Date().toISOString() }
        : t
    ));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const filtered = tasks.filter(t =>
    filter === 'active' ? !t.completed :
    filter === 'completed' ? t.completed : true
  );

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <>
      <header className="app-header">
        <h1>My Tasks</h1>
        <p>{activeCount} task{activeCount !== 1 ? 's' : ''} remaining</p>
      </header>

      <main className="app-body">
        {error && <div className="error-msg">{error}</div>}
        <TaskForm onAdd={addTask} />
        <FilterBar filter={filter} onChange={setFilter} />
        <TaskList
          tasks={filtered}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
        {tasks.length > 0 && (
          <p className="task-footer">{tasks.length} total task{tasks.length !== 1 ? 's' : ''}</p>
        )}
      </main>
    </>
  );
}

export default App;
