import { useReducer, useState } from 'react';
import { taskReducer, initialState } from './taskReducer';
import TaskModal from './TaskModal';
import VoiceInput from './VoiceInput';
import InputSection from './InputSection';
import TaskList from './TaskList';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const handleAdd = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleModalSubmit = ({ title, description }) => {
    if (editTask) {
      dispatch({
        type: 'EDIT_TASK',
        payload: { id: editTask.id, updates: { title, description } },
      });
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: { id: uuidv4(), title, description },
      });
    }
    setModalOpen(false);
    setEditTask(null);
  };

  // Handle simple voice commands
  const handleSimpleCommand = (cmd) => {
    if (cmd.type === 'ADD_TASK_VOICE') {
      dispatch({
        type: 'ADD_TASK',
        payload: { id: uuidv4(), title: cmd.text, description: '' },
      });
    } else if (cmd.type === 'DELETE_TASK_VOICE') {
      const task = state.tasks.find(t => t.title.toLowerCase().includes(cmd.text));
      if (task) dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
    } else if (cmd.type === 'EDIT_TASK_VOICE') {
      alert('Edit by voice not implemented in demo');
    } else if (cmd.type === 'TOGGLE_TASK_VOICE') {
      const task = state.tasks.find(t => t.title.toLowerCase().includes(cmd.text));
      if (task) dispatch({ type: 'TOGGLE_STATUS', payload: { id: task.id } });
    }
  };

  // Handle complex voice commands via Gemini LLM backend
  const handleComplexCommand = async (transcript) => {
    try {
      const res = await axios.post('https://voice-first-task-tracker-4.onrender.com/api/llm', { transcript });
      const data = res.data;
      if (data.intent === 'add' && Array.isArray(data.tasks)) {
        data.tasks.forEach(task => {
          dispatch({
            type: 'ADD_TASK',
            payload: { id: uuidv4(), title: task.taskName, description: task.Desc || '' },
          });
        });
      } else if (data.intent === 'delete' && typeof data.taskNumber === 'number') {
        const idx = data.taskNumber - 1;
        if (state.tasks[idx]) {
          dispatch({ type: 'DELETE_TASK', payload: { id: state.tasks[idx].id } });
        }
      } else if (data.intent === 'edit' && typeof data.taskNumber === 'number' && data.updates) {
        const idx = data.taskNumber - 1;
        if (state.tasks[idx]) {
          const prev = state.tasks[idx];
          dispatch({
            type: 'EDIT_TASK',
            payload: {
              id: prev.id,
              updates: {
                title: data.updates.taskName ? data.updates.taskName : prev.title,
                description: data.updates.Desc ? data.updates.Desc : prev.description,
              },
            },
          });
        }
      } else if (data.intent === 'toggle' && typeof data.taskNumber === 'number') {
        const idx = data.taskNumber - 1;
        if (state.tasks[idx]) {
          dispatch({ type: 'TOGGLE_STATUS', payload: { id: state.tasks[idx].id } });
        }
      } else {
        alert('Sorry, could not understand the command.');
      }
    } catch (err) {
      alert('Error processing command: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      <h1>Tasks</h1>
      <InputSection
        onAdd={handleAdd}
        filter={state.filter}
        onFilterChange={val => dispatch({ type: 'SET_FILTER', payload: val })}
        onSimpleCommand={handleSimpleCommand}
        onComplexCommand={handleComplexCommand}
      />
      <TaskList
        tasks={state.tasks}
        onToggle={id => dispatch({ type: 'TOGGLE_STATUS', payload: { id } })}
        onEdit={handleEdit}
        onDelete={id => dispatch({ type: 'DELETE_TASK', payload: { id } })}
        filter={state.filter}
      />
      <TaskModal
        isOpen={modalOpen}
        onRequestClose={() => { setModalOpen(false); setEditTask(null); }}
        onSubmit={handleModalSubmit}
        initialTask={editTask}
      />
    </div>
  );
}

export default App;
