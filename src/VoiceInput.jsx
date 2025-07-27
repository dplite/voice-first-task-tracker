import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function VoiceInput({ onSimpleCommand, onComplexCommand }) {
  const [isListening, setIsListening] = useState(true);
  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;
    // Always listen after permission if enabled
    if (isListening && !listening) {
      SpeechRecognition.startListening({ continuous: true });
    } else if (!isListening && listening) {
      SpeechRecognition.stopListening();
    }
  }, [listening, browserSupportsSpeechRecognition, isListening]);

  useEffect(() => {
    if (!finalTranscript || !isListening) return;
    // Simple command detection (add, edit, delete, toggle, etc.)
    const simpleMatch = parseSimpleCommand(finalTranscript);
    if (simpleMatch) {
      onSimpleCommand(simpleMatch);
      resetTranscript();
    } else if (finalTranscript.trim()) {
      // If not simple, send to Gemini
      onComplexCommand(finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, onSimpleCommand, onComplexCommand, resetTranscript, isListening]);

  const toggleMic = () => {
    setIsListening(!isListening);
    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div>Your browser does not support speech recognition.</div>;
  }

  return (
    <div className="voice-input">
      <button 
        className={`mic-toggle-btn ${isListening ? 'listening' : 'muted'}`}
        onClick={toggleMic}
      >
        {isListening ? '🎤' : '🔇'}
      </button>
      <p>Voice: {isListening ? (listening ? 'Listening...' : 'Not listening') : 'Disabled'}</p>
      <p style={{ fontStyle: 'italic', color: '#888' }}>{transcript}</p>
    </div>
  );
}

// Very basic simple command parser (expand as needed)
function parseSimpleCommand(transcript) {
  const t = transcript.toLowerCase();
  if (t.startsWith('add task')) {
    return { type: 'ADD_TASK_VOICE', text: t.replace('add task', '').trim() };
  }
  if (t.startsWith('delete task')) {
    return { type: 'DELETE_TASK_VOICE', text: t.replace('delete task', '').trim() };
  }
  if (t.startsWith('edit task')) {
    return { type: 'EDIT_TASK_VOICE', text: t.replace('edit task', '').trim() };
  }
  if (t.startsWith('toggle task')) {
    return { type: 'TOGGLE_TASK_VOICE', text: t.replace('toggle task', '').trim() };
  }
  return null;
} 