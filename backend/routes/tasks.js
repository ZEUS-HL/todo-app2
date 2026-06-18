const express = require('express');
const router = express.Router();

let tasks = [];
let nextId = 1;

// GET /api/tasks?userId=123
router.get('/', (req, res) => {
  const { userId } = req.query;
  const result = userId
    ? tasks.filter(t => String(t.userId) === String(userId))
    : tasks;
  res.json(result);
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { title, description, userId } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = {
    id: nextId++,
    userId: userId || null,
    title: title.trim(),
    description: (description || '').trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  const { title, description, completed } = req.body;
  tasks[index] = {
    ...tasks[index],
    ...(title       !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(completed   !== undefined && { completed }),
    updatedAt: new Date().toISOString(),
  };
  res.json(tasks[index]);
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
