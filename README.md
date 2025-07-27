# Voice-First Task Tracker

A modern, voice-enabled task management application built with React and Node.js. This application reimagines the traditional task tracker by prioritizing voice input as the primary interaction method, while maintaining a clean, responsive UI.

## 🎯 Project Overview

This task tracker demonstrates how to build a voice-first interface that:
- Uses speech-to-text for natural task management
- Integrates AI (Gemini LLM) for complex command interpretation
- Maintains traditional UI interactions as fallback
- Provides a responsive, accessible design

## 🏗️ Architecture

### Frontend Architecture (React + Vite)

**Component Structure:**
```
src/
├── App.jsx                 # Main application component
├── taskReducer.js          # State management using useReducer
├── InputSection.jsx        # Header with mic toggle, add button, search
├── TaskList.jsx           # Container for task items
├── TaskItem.jsx           # Individual task display and actions
├── TaskModal.jsx          # Add/edit task modal
├── VoiceInput.jsx         # Voice recognition and mic controls
└── App.css               # Responsive styling
```

**State Management:**
- **useReducer Pattern**: Centralized state management for tasks, filters, and UI state
- **Props Drilling**: Minimal, focused on component-specific data
- **Local State**: Component-specific state (modals, voice controls)

**Why This Architecture?**
- **Scalability**: Reducer pattern scales better than useState for complex state
- **Maintainability**: Clear separation of concerns with focused components
- **Performance**: Efficient re-renders with proper component boundaries
- **Accessibility**: Voice-first design with UI fallbacks

### Backend Architecture (Node.js + Express)

**API Structure:**
```
backend/
├── index.js              # Express server with Gemini integration
├── .env                  # Environment variables (not tracked in git)
├── package.json          # Dependencies and scripts
└── node_modules/         # Backend dependencies
```

**Key Features:**
- **Hybrid Command Processing**: Simple commands handled locally, complex ones via Gemini
- **Gemini LLM Integration**: Natural language understanding for ambiguous commands
- **RESTful API**: Clean endpoints for frontend communication
- **Environment Variables**: Secure API key management

**Why This Approach?**
- **Performance**: Fast response for simple commands
- **Intelligence**: AI handles complex, natural language inputs
- **Cost Efficiency**: Only uses AI when necessary
- **Reliability**: Fallback to simple parsing if AI fails
- **Security**: API keys stored in environment variables

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.18.0 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice-first-task-tracker
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env  # If .env.example exists
   # Or create .env manually
   ```
   
   Add your Gemini API key to `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   node index.js
   ```
   The backend will start on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   # In a new terminal, from the project root
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` and grant microphone permissions

## 🎤 Voice Commands

### Simple Commands (Local Processing)
- **Add Task**: "add task buy groceries"
- **Delete Task**: "delete task 2" (by number)
- **Toggle Status**: "toggle task 1" (by number)

### Complex Commands (Gemini LLM)
- **Natural Language**: "I need to call mom tomorrow at 3pm"
- **Complex Edits**: "edit task 1, change the title to 'important meeting' and description to 'team sync'"
- **Multiple Tasks**: "add tasks for shopping: milk, bread, eggs"

### Voice Controls
- **Mic Toggle**: Click the 🎤 button to enable/disable voice recognition
- **Visual Feedback**: Green mic = listening, Red mic = disabled

## 🛠️ Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
cd backend
node index.js        # Start backend server
```

## 🎨 UI Features

### Responsive Design
- **Desktop**: Full-width layout with horizontal task rows
- **Tablet**: Adjusted spacing and button sizes
- **Mobile**: Stacked layout with full-width buttons

### Accessibility
- **Voice-First**: Primary interaction method
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **High Contrast**: Clear visual hierarchy

### Visual Design
- **Clean Interface**: Minimal, focused design
- **Status Indicators**: Color-coded task statuses
- **Consistent Spacing**: Proper alignment and padding
- **Hover Effects**: Interactive feedback

## 🔧 Technical Implementation

### Voice Recognition
- **Library**: `react-speech-recognition`
- **Browser Support**: Chrome, Edge, Safari
- **Fallback**: Manual input for unsupported browsers

### AI Integration
- **Provider**: Google Gemini 2.0 Flash
- **Prompt Engineering**: Structured JSON responses
- **Error Handling**: Graceful fallbacks
- **Security**: Environment variable management

### State Management
- **Pattern**: Reducer with actions
- **Actions**: ADD_TASK, EDIT_TASK, DELETE_TASK, TOGGLE_STATUS, SET_FILTER
- **Immutability**: Proper state updates

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render)
```bash
# Set environment variables
GEMINI_API_KEY=your_api_key
PORT=5000
```

## 🔒 Security

- **API Keys**: Stored in environment variables, never committed to git
- **Environment Files**: `.env` files are gitignored
- **Production**: Use platform-specific environment variable management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini API for natural language understanding
- React Speech Recognition for voice input
- Vite for fast development experience
