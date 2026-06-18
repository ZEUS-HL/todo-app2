import React, { useState, useEffect, useCallback } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import AccountModal from './components/AccountModal';
import { taskApi } from './services/api';
import { AVATAR_COLORS, getInitials } from './utils';
import './App.css';

const USERS_KEY   = 'mytasks-users';
const CURRENT_KEY = 'mytasks-current';
const TASKS_KEY   = 'mytasks-tasks';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// Migrate tasks stored under any old key into the current key
function migrateTasks() {
  const OLD_KEYS = ['mytasks-v1', 'mytasks-v2-tasks'];
  if (localStorage.getItem(TASKS_KEY)) return; // already migrated
  for (const k of OLD_KEYS) {
    try {
      const data = JSON.parse(localStorage.getItem(k));
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(TASKS_KEY, JSON.stringify(data));
        return;
      }
    } catch { /* ignore */ }
  }
}

// Run migration once at module load time
migrateTasks();


function App() {
  const [users, setUsers]               = useState(() => load(USERS_KEY, []));
  const [currentUserId, setCurrentUser] = useState(() => load(CURRENT_KEY, null));
  const [tasks, setTasks]               = useState(() => load(TASKS_KEY, []));
  const [filter, setFilter]             = useState('all');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [showAccount, setShowAccount]   = useState(false);

  // Persist everything to localStorage
  useEffect(() => localStorage.setItem(USERS_KEY,   JSON.stringify(users)),   [users]);
  useEffect(() => localStorage.setItem(CURRENT_KEY, JSON.stringify(currentUserId)), [currentUserId]);
  useEffect(() => saveTasks(tasks), [tasks]);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  // Open account modal when there is no active user
  useEffect(() => { if (!currentUser) setShowAccount(true); }, [currentUser]);

  // ── Try to sync from API on mount; fall back to localStorage silently ──
  const syncFromApi = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const data = await taskApi.getAll(currentUserId);
      if (data.length > 0) setTasks(data);
    } catch {
      // Backend unavailable — localStorage data already loaded, carry on
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { syncFromApi(); }, [syncFromApi]);

  // ── Helpers ──
  function applyAndSave(updater) {
    setTasks(prev => {
      const next = updater(prev);
      saveTasks(next);
      return next;
    });
  }

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
    const remaining = users.filter(u => u.id !== id);
    setUsers(remaining);
    applyAndSave(prev => prev.filter(t => t.userId !== id));
    if (currentUserId === id) setCurrentUser(remaining[0]?.id || null);
  }

  // ── Task operations (optimistic local-first, API sync best-effort) ──
  async function addTask(title, description = '') {
    if (!currentUser) return setError('Select or create a user first.');
    if (!title.trim()) return setError('Please enter a task.');
    setError(null);

    const optimistic = {
      id: Date.now(),
      userId: currentUserId,
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    applyAndSave(prev => [...prev, optimistic]);

    try {
      const saved = await taskApi.create({ title, description, userId: currentUserId });
      // Replace optimistic entry with server-confirmed one
      applyAndSave(prev => prev.map(t => t.id === optimistic.id ? saved : t));
    } catch {
      // Keep optimistic entry — task stays in localStorage
    }
  }

  async function toggleTask(id, completed) {
    // Apply immediately
    applyAndSave(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !completed, updatedAt: new Date().toISOString() } : t
    ));
    try {
      await taskApi.update(id, { completed: !completed });
    } catch {
      // Local state already updated — no revert needed
    }
  }

  async function updateTask(id, title, description = '') {
    // Apply immediately
    applyAndSave(prev => prev.map(t =>
      t.id === id ? { ...t, title, description, updatedAt: new Date().toISOString() } : t
    ));
    try {
      await taskApi.update(id, { title, description });
    } catch {
      // Local state already updated
    }
  }

  async function deleteTask(id) {
    // Remove immediately
    applyAndSave(prev => prev.filter(t => t.id !== id));
    try {
      await taskApi.remove(id);
    } catch {
      // Already removed locally
    }
  }

  // ── Filter ──
  const userTasks = tasks.filter(t => t.userId === currentUserId);
  const filtered  = userTasks.filter(t =>
    filter === 'active'    ? !t.completed :
    filter === 'completed' ?  t.completed : true
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

        {!loading && userTasks.length > 0 && (
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
          onSwitchUser={id => { setCurrentUser(id); setShowAccount(false); }}
          onClose={() => setShowAccount(false)}
        />
      )}
    </>
  );
}

export default App;
