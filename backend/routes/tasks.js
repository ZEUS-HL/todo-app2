const express = require('express');
const router = express.Router();

let tasks = [];
let nextId = 1;

// GET /api/tasks?userId=123
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;
    const result = userId
      ? tasks.filter(t => String(t.userId) === String(userId))
      : tasks;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST /api/tasks
router.post('/', (req, res) => {
  try {
    const { title, description, userId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.trim().length > 500) {
      return res.status(400).json({ error: 'Title must be 500 characters or fewer' });
    }

    const task = {
      id: nextId++,
      userId: userId ?? null,
      title: title.trim(),
      description: description ? String(description).trim() : '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    tasks.push(task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    const { title, description, completed } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ error: 'Title cannot be empty' });
      if (title.trim().length > 500) return res.status(400).json({ error: 'Title must be 500 characters or fewer' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }

    tasks[index] = {
      ...tasks[index],
      ...(title       !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(completed   !== undefined && { completed }),
      updatedAt: new Date().toISOString(),
    };
    res.json(tasks[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    tasks.splice(index, 1);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
