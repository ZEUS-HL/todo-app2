import React, { useState, useEffect, useRef } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import AccountModal from './components/AccountModal';
import './App.css';

const STORAGE_KEY = 'mytasks-v1';
const USER_KEY = 'mytasks-user';

const AVATAR_COLORS = ['#e53e3e','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899'];

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function loadUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || { name: '', color: AVATAR_COLORS[0] }; }
  catch { return { name: '', color: AVATAR_COLORS[0] }; }
}

function getInitials(name) {
  if (!name.trim()) return '?';
  return name.trim().split(' ').map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => loadUser());
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [user]);

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
        <div className="header-inner">
          <div className="header-titles">
            <h1>My Tasks</h1>
            <p>{user.name ? `Hi, ${user.name.split(' ')[0]} · ` : ''}{activeCount} task{activeCount !== 1 ? 's' : ''} remaining</p>
          </div>
          <button
            className="avatar-btn"
            style={{ background: user.color }}
            onClick={() => setShowAccount(true)}
            title="Account settings"
          >
            {getInitials(user.name)}
          </button>
        </div>
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

      {showAccount && (
        <AccountModal
          user={user}
          colors={AVATAR_COLORS}
          onSave={u => { setUser(u); setShowAccount(false); }}
          onClose={() => setShowAccount(false)}
        />
      )}
    </>
  );
}

export default App;
