export const AVATAR_COLORS = ['#e53e3e','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899'];

export function getInitials(name) {
  if (!name?.trim()) return '?';
  return name.trim().split(' ').map(w => w[0].toUpperCase()).slice(0, 2).join('');
}
