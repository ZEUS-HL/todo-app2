import React from 'react';
import TaskItem from './TaskItem';

function TaskList({ tasks, onToggle, onUpdate, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        No tasks yet. Add one above!
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
