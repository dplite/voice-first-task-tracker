import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();
app.use(cors());
app.use(bodyParser.json());

function parseSimpleCommand(transcript) {
  const t = transcript.toLowerCase().trim();
  if (t.startsWith('add task')) {
    const text = t.replace('add task', '').trim();
    if (text.length > 0) {
      return {
        intent: 'add',
        tasks: [{ taskName: text, Desc: '' }]
      };
    }
  }
  if (t.startsWith('delete task')) {
    const text = t.replace('delete task', '').trim();
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      return { intent: 'delete', taskNumber: num };
    }
  }
  if (t.startsWith('edit task')) {
    // Not implemented for simple logic
    return null;
  }
  if (t.startsWith('toggle task')) {
    const text = t.replace('toggle task', '').trim();
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      return { intent: 'toggle', taskNumber: num };
    }
  }
  return null;
}

app.post('/api/llm', async (req, res) => {
  console.log('Received request:', req.body);
  const { transcript } = req.body;
  // Try simple command first
  const simple = parseSimpleCommand(transcript);
  if (simple) {
    return res.json(simple);
  }
  console.log('No simple command found, calling Gemini');
  // Otherwise, call Gemini
  try {
    const prompt = `You are a task manager assistant. Interpret the following user command and return a JSON object with:\n- intent: (add, delete, edit, toggle)\n- For add: tasks: [{taskName: string, Desc: string}]\n- For delete/edit/toggle: taskNumber (1-based index)\n- For edit: updates: {taskName, Desc}\nUser command: "${transcript}"\nRespond with only the JSON object.`;

    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    const geminiText = geminiRes.data.candidates[0].content.parts[0].text;
    // Try to extract JSON from Gemini's response
    const jsonMatch = geminiText.match(/```json\s*([\s\S]*?)```|({[\s\S]*})/i);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : geminiText;
    const result = JSON.parse(jsonString);
    res.json(result);
  } catch (err) {
    console.error('Gemini error:', err, err?.response?.data);
    res.status(500).json({ error: 'Failed to process with Gemini', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`LLM backend listening on port ${PORT}`));
