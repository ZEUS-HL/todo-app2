if (!global._tasks) {
  global._tasks = [];
  global._nextId = 1;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = parseInt(req.query.id);
  const index = global._tasks.findIndex((t) => t.id === id);

  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  if (req.method === 'PUT') {
    const { title, description, completed } = req.body;
    global._tasks[index] = {
      ...global._tasks[index],
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(completed !== undefined && { completed }),
      updatedAt: new Date().toISOString(),
    };
    return res.status(200).json(global._tasks[index]);
  }

  if (req.method === 'DELETE') {
    global._tasks.splice(index, 1);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
