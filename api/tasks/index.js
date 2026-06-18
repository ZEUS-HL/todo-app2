// In-memory store (resets on cold start — fine for demo)
if (!global._tasks) {
  global._tasks = [];
  global._nextId = 1;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(global._tasks);
  }

  if (req.method === 'POST') {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = {
      id: global._nextId++,
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    global._tasks.push(task);
    return res.status(201).json(task);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
