import React, { useState, useEffect, useCallback } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import AccountModal from './components/AccountModal';
import { taskApi } from './services/api';
import './App.css';

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
  const [tasks, setTasks]               = useState([]);
  const [filter, setFilter]             = useState('all');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [showAccount, setShowAccount]   = useState(false);

  // Persist user state to localStorage
  useEffect(() => localStorage.setItem(USERS_KEY,   JSON.stringify(users)),   [users]);
  useEffect(() => localStorage.setItem(CURRENT_KEY, JSON.stringify(currentUserId)), [currentUserId]);

  // Auto-open modal on first visit
  useEffect(() => { if (users.length === 0) setShowAccount(true); }, []);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  // ── Fetch tasks from API ──
  const fetchTasks = useCallback(async () => {
    if (!currentUserId) return setTasks([]);
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAll(currentUserId);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── User operations (localStorage only) ──
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
    const remaining = users.filter(u => u.id !== id);
    setUsers(remaining);
    setTasks(prev => prev.filter(t => t.userId !== id));
    if (currentUserId === id) setCurrentUser(remaining[0]?.id || null);
  }

  // ── Task operations (API) ──
  async function addTask(title, description = '') {
    if (!currentUser) return setError('Select or create a user first.');
    if (!title.trim()) return setError('Please enter a task.');
    setError(null);
    try {
      const task = await taskApi.create({ title, description, userId: currentUserId });
      setTasks(prev => [...prev, task]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add task.');
    }
  }

  async function toggleTask(id, completed) {
    try {
      const updated = await taskApi.update(id, { completed: !completed });
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task.');
    }
  }

  async function updateTask(id, title, description = '') {
    try {
      const updated = await taskApi.update(id, { title, description });
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task.');
    }
  }

  async function deleteTask(id) {
    try {
      await taskApi.remove(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task.');
    }
  }

  // ── Filter ──
  const filtered = tasks.filter(t =>
    filter === 'active'    ? !t.completed :
    filter === 'completed' ?  t.completed : true
  );
  const activeCount = tasks.filter(t => !t.completed).length;

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

        {error && (
          <div className="error-msg">
            {error}
            <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <TaskForm onAdd={addTask} disabled={!currentUser} />
        <FilterBar filter={filter} onChange={setFilter} />

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            Loading tasks…
          </div>
        ) : (
          <TaskList
            tasks={filtered}
            users={users}
            onToggle={toggleTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}

        {!loading && tasks.length > 0 && (
          <p className="task-footer">{tasks.length} total task{tasks.length !== 1 ? 's' : ''}</p>
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
          onSwitchUser={id => { setCurrentUser(id); setShowAccount(false); }}
          onClose={() => setShowAccount(false)}
        />
      )}
    </>
  );
}

export default App;
