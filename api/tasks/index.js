import { supabase } from '../_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/tasks
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('tasks')
      .select()
      .order('created_at');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data.map(toApi));
  }

  // POST /api/tasks
  if (req.method === 'POST') {
    const { title, description, userId } = req.body ?? {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (String(title).trim().length > 500) {
      return res.status(400).json({ error: 'Title must be 500 characters or fewer' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        text: String(title).trim(),
        description: description ? String(description).trim() : '',
        user_id: userId ?? null,
        completed: false,
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(toApi(data));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Map DB row → API shape expected by the frontend
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
