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
    console.log('Simple command received:', cmd);
    if (cmd.type === 'ADD_TASK_VOICE') {
      dispatch({
        type: 'ADD_TASK',
        payload: { id: uuidv4(), title: cmd.text, description: '' },
      });
    } else if (cmd.type === 'DELETE_TASK_VOICE') {
      const taskNumber = parseInt(cmd.text, 10);
      if (!isNaN(taskNumber) && taskNumber > 0) {
        const idx = taskNumber - 1;
        if (state.tasks[idx]) {
          console.log('Deleting task at index:', idx, 'task:', state.tasks[idx]);
          dispatch({ type: 'DELETE_TASK', payload: { id: state.tasks[idx].id } });
        } else {
          console.log('Task not found at index:', idx);
        }
      } else {
        console.log('Invalid task number:', cmd.text);
      }
    } else if (cmd.type === 'EDIT_TASK_VOICE') {
      alert('Edit by voice not implemented in demo');
    } else if (cmd.type === 'TOGGLE_TASK_VOICE') {
      const taskNumber = parseInt(cmd.text, 10);
      if (!isNaN(taskNumber) && taskNumber > 0) {
        const idx = taskNumber - 1;
        if (state.tasks[idx]) {
          console.log('Toggling task at index:', idx, 'task:', state.tasks[idx]);
          dispatch({ type: 'TOGGLE_STATUS', payload: { id: state.tasks[idx].id } });
        } else {
          console.log('Task not found at index:', idx);
        }
      } else {
        console.log('Invalid task number:', cmd.text);
      }
    }
  };

  // Handle complex voice commands via Gemini LLM backend
  const handleComplexCommand = async (transcript) => {
    try {
      console.log('Sending to LLM:', transcript);
      const res = await axios.post('http://localhost:5000/api/llm', { transcript });
      const data = res.data;
      console.log('LLM response:', data);
      
      // Handle both simple and complex command responses
      if (data.intent === 'add' && Array.isArray(data.tasks)) {
        data.tasks.forEach(task => {
          dispatch({
            type: 'ADD_TASK',
            payload: { id: uuidv4(), title: task.taskName, description: task.Desc || '' },
          });
        });
      } else if (data.intent === 'delete' && typeof data.taskNumber === 'number') {
        console.log('Delete command - taskNumber:', data.taskNumber, 'total tasks:', state.tasks.length);
        const idx = data.taskNumber - 1;
        console.log('Calculated index:', idx);
        if (state.tasks[idx]) {
          console.log('Deleting task:', state.tasks[idx]);
          dispatch({ type: 'DELETE_TASK', payload: { id: state.tasks[idx].id } });
        } else {
          console.log('Task not found at index:', idx);
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
      } else if (data.intent === 'filter' && typeof data.filterText === 'string') {
        dispatch({ type: 'SET_FILTER', payload: data.filterText });
      } else {
        console.log('Unknown command data:', data);
        alert('Sorry, could not understand the command.');
      }
    } catch (err) {
      console.error('Error processing command:', err);
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
