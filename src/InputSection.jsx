import React from 'react';
import VoiceInput from './VoiceInput';

export default function InputSection({ onAdd, filter, onFilterChange, onSimpleCommand, onComplexCommand }) {
  return (
    <div className="header-row">
      <VoiceInput
        onSimpleCommand={onSimpleCommand}
        onComplexCommand={onComplexCommand}
      />
      <button className="add-task-btn" onClick={onAdd}>Add Task</button>
      <input
        className="search-input"
        type="text"
        placeholder="Search..."
        value={filter}
        onChange={e => onFilterChange(e.target.value)}
      />
      {filter && (
        <button 
          className="clear-filter-btn" 
          onClick={() => onFilterChange('')}
          title="Clear filter"
        >
          ✕
        </button>
      )}
    </div>
  );
} 