import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Unwrap axios response data automatically
const unwrap = res => res.data;

export const taskApi = {
  getAll:  (userId)       => api.get('/tasks', { params: { userId } }).then(unwrap),
  create:  (data)         => api.post('/tasks', data).then(unwrap),
  update:  (id, data)     => api.put(`/tasks/${id}`, data).then(unwrap),
  remove:  (id)           => api.delete(`/tasks/${id}`),
};

export default api;
