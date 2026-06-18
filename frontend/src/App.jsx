import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import AccountModal from './components/AccountModal';
import './App.css';

const TASKS_KEY   = 'mytasks-v2-tasks';
const USERS_KEY   = 'mytasks-v2-users';
const CURRENT_KEY = 'mytasks-v2-current';

export const AVATAR_COLORS = ['#e53e3e','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899'];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function getInitials(name) {
  if (!name?.trim()) return '?';
  return name.trim().split(' ').map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function App() {
  const [users, setUsers]               = useState(() => load(USERS_KEY, []));
  const [currentUserId, setCurrentUser] = useState(() => load(CURRENT_KEY, null));
  const [tasks, setTasks]               = useState(() => load(TASKS_KEY, []));
  const [filter, setFilter]             = useState('all');
  const [error, setError]               = useState(null);
  const [showAccount, setShowAccount]   = useState(false);

  // Persist
  useEffect(() => localStorage.setItem(TASKS_KEY,   JSON.stringify(tasks)),   [tasks]);
  useEffect(() => localStorage.setItem(USERS_KEY,   JSON.stringify(users)),   [users]);
  useEffect(() => localStorage.setItem(CURRENT_KEY, JSON.stringify(currentUserId)), [currentUserId]);

  // Auto-open account modal on first visit
  useEffect(() => { if (users.length === 0) setShowAccount(true); }, []);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  // ── User operations ──
  function addUser(name, color) {
    const user = { id: Date.now(), name: name.trim(), color };
    setUsers(prev => [...prev, user]);
    if (!currentUserId) setCurrentUser(user.id);
    return user;
  }

  function updateUser(id, name, color) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, name, color } : u));
  }

  function deleteUser(id) {
    setUsers(prev => prev.filter(u => u.id !== id));
    setTasks(prev => prev.filter(t => t.userId !== id));
    if (currentUserId === id) {
      const remaining = users.filter(u => u.id !== id);
      setCurrentUser(remaining[0]?.id || null);
    }
  }

  function switchUser(id) { setCurrentUser(id); }

  // ── Task operations ──
  function addTask(title, description = '') {
    if (!currentUser) return setError('Select or create a user first.');
    if (!title.trim()) return setError('Please enter a task.');
    setTasks(prev => [...prev, {
      id: Date.now(),
      userId: currentUserId,
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
      t.id === id ? { ...t, title, description, updatedAt: new Date().toISOString() } : t
    ));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  // ── Filtering ──
  const userTasks = tasks.filter(t => t.userId === currentUserId);
  const filtered = userTasks.filter(t =>
    filter === 'active' ? !t.completed :
    filter === 'completed' ? t.completed : true
  );
  const activeCount = userTasks.filter(t => !t.completed).length;

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="header-titles">
            <h1>My Tasks</h1>
            <p>
              {currentUser ? `${currentUser.name} · ` : ''}
              {activeCount} task{activeCount !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <button
            className="avatar-btn"
            style={{ background: currentUser?.color || '#a0aec0' }}
            onClick={() => setShowAccount(true)}
            title="Manage users"
          >
            {getInitials(currentUser?.name)}
          </button>
        </div>
      </header>

      <main className="app-body">
        {!currentUser && (
          <div className="no-user-banner">
            👤 <span>No user selected. <button onClick={() => setShowAccount(true)}>Create or select a user</button> to get started.</span>
          </div>
        )}
        {error && <div className="error-msg">{error}</div>}
        <TaskForm onAdd={addTask} disabled={!currentUser} />
        <FilterBar filter={filter} onChange={setFilter} />
        <TaskList
          tasks={filtered}
          users={users}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
        {userTasks.length > 0 && (
          <p className="task-footer">{userTasks.length} total task{userTasks.length !== 1 ? 's' : ''}</p>
        )}
      </main>

      {showAccount && (
        <AccountModal
          users={users}
          currentUserId={currentUserId}
          colors={AVATAR_COLORS}
          onAddUser={addUser}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
          onSwitchUser={id => { switchUser(id); setShowAccount(false); }}
          onClose={() => setShowAccount(false)}
        />
      )}
    </>
  );
}

export default App;
