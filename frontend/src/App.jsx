import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

const STORAGE_KEY = 'todo-app-tasks';

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [error, setError] = useState(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function addTask(title, description) {
    if (!title.trim()) return setError('Title is required');
    const task = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
    setError(null);
  }

  function updateTask(id, updates) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    setError(null);
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleTask(id, completed) {
    updateTask(id, { completed: !completed });
  }

  return (
    <div className="app">
      <div className="container">
        <h1 className="app-title">Todo App</h1>
        {error && <div className="error-msg">{error}</div>}
        <TaskForm onAdd={addTask} />
        <TaskList
          tasks={tasks}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      </div>
    </div>
  );
}

export default App;
