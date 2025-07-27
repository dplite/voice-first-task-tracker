import React from 'react';

export default function TaskItem({ task, index, onToggle, onEdit, onDelete }) {
  return (
    <li className="task-row">
      <span className="task-index">{index + 1}.</span>
      <strong className="task-title">{task.title}</strong>
      <span className="task-description">{task.description || '-'}</span>
      <span className="task-time">{task.time ? task.time : '-'}</span>
      <span className="task-status">({task.status})</span>
      <button onClick={() => onToggle(task.id)}>Toggle</button>
      <button onClick={() => onEdit(task)}>Edit</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </li>
  );
} 