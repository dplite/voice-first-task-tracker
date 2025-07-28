import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onToggle, onEdit, onDelete, filter }) {
  return (
    <ul>
      {tasks
        .filter(task => {
          if (!filter) return true;
          const filterLower = filter.toLowerCase();
          return (
            task.title.toLowerCase().includes(filterLower) ||
            task.description.toLowerCase().includes(filterLower) ||
            task.status.toLowerCase().includes(filterLower)
          );
        })
        .map((task, i) => (
          <TaskItem
            key={task.id}
            task={task}
            index={i}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </ul>
  );
} 