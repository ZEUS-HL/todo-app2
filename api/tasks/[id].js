import { supabase } from '../_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

  // PUT /api/tasks/:id
  if (req.method === 'PUT') {
    const { title, description, completed } = req.body ?? {};

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
    return res.status(200).json(toApi(data));
  }

  // DELETE /api/tasks/:id
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

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
