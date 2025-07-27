import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function TaskModal({ isOpen, onRequestClose, onSubmit, initialTask }) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');

  useEffect(() => {
    setTitle(initialTask?.title || '');
    setDescription(initialTask?.description || '');
  }, [initialTask, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({ title, description });
      setTitle('');
      setDescription('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={initialTask ? 'Edit Task' : 'Add New Task'}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <h2>{initialTask ? 'Edit Task' : 'Add New Task'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title*
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="A title for the task"
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="A brief about the task"
          />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onRequestClose}>Cancel</button>
          <button type="submit">{initialTask ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  );
} 