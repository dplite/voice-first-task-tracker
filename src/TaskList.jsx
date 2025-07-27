import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onToggle, onEdit, onDelete, filter }) {
  return (
    <ul>
      {tasks
        .filter(task =>
          task.title.toLowerCase().includes(filter.toLowerCase()) ||
          task.description.toLowerCase().includes(filter.toLowerCase())
        )
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