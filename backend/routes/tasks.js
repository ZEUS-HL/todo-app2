const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function toApi(row) {
  return {
    id:          row.id,
    userId:      row.user_id,
    title:       row.text,
    description: row.description ?? '',
    completed:   row.completed,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at ?? null,
  };
}

// GET /api/tasks?userId=123
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('tasks').select().order('created_at');
    if (req.query.userId) {
      query = query.eq('user_id', req.query.userId);
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(toApi));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (String(title).trim().length > 500) {
      return res.status(400).json({ error: 'Title must be 500 characters or fewer' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        text:        String(title).trim(),
        description: description ? String(description).trim() : '',
        user_id:     userId ?? null,
        completed:   false,
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(toApi(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

    const { title, description, completed } = req.body;

    if (title !== undefined) {
      if (!String(title).trim()) return res.status(400).json({ error: 'Title cannot be empty' });
      if (String(title).trim().length > 500) return res.status(400).json({ error: 'Title must be 500 characters or fewer' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (title       !== undefined) updates.text        = String(title).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (completed   !== undefined) updates.completed   = completed;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Task not found' });
      return res.status(500).json({ error: error.message });
    }
    res.json(toApi(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
