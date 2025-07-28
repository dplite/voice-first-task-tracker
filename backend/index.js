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
    console.log('Delete command - extracted text:', text);
    const num = parseInt(text, 10);
    console.log('Delete command - parsed number:', num);
    if (!isNaN(num) && num > 0) {
      console.log('Delete command - returning:', { intent: 'delete', taskNumber: num });
      return { intent: 'delete', taskNumber: num };
    } else {
      console.log('Delete command - invalid number or zero');
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
  // For filter commands, always use LLM to better understand intent
  if (t.includes('filter') || t.includes('show') || t.includes('find') || t.includes('pending') || t.includes('progress') || t.includes('completed')) {
    return null; // Let LLM handle all filter commands
  }
  return null;
}

app.post('/api/llm', async (req, res) => {
  console.log('Received request:', req.body);
  const { transcript } = req.body;
  console.log('Transcript:', transcript);
  
  // Try simple command first
  const simple = parseSimpleCommand(transcript);
  if (simple) {
    console.log('Simple command found:', simple);
    console.log('Sending simple command response to frontend:', simple);
    return res.json(simple);
  }
  console.log('No simple command found, calling Gemini');
  // Otherwise, call Gemini
  try {
    const prompt = `You are a task manager assistant. Interpret the following user command and return a JSON object with:
- intent: (add, delete, edit, toggle, filter)
- For add: tasks: [{taskName: string, Desc: string}]
- For delete/edit/toggle: taskNumber (1-based index)
- For edit: updates: {taskName, Desc}
- For filter: filterText (string to filter by - extract the key filter term)

Filter Examples:
- "filter the task to show only pending ones" → {"intent": "filter", "filterText": "pending"}
- "filter the list to show only the in progress status" → {"intent": "filter", "filterText": "in progress"}
- "show me tasks that are in progress" → {"intent": "filter", "filterText": "in progress"}
- "find completed tasks" → {"intent": "filter", "filterText": "completed"}
- "filter tasks that start with ab" → {"intent": "filter", "filterText": "ab"}
- "show all tasks with description containing meeting" → {"intent": "filter", "filterText": "meeting"}
- "clear filter" or "show all" → {"intent": "filter", "filterText": ""}

Status-based filtering keywords:
- "pending" → filterText: "pending"
- "in progress" → filterText: "in progress" 
- "completed" → filterText: "completed"

Important: For filter commands, extract the key term that should be used for filtering. If user says "filter to show only pending ones", extract "pending" as the filterText. For status filtering, use the exact status text: "pending", "in progress", or "completed". ALWAYS use "filterText" as the field name.

User command: "${transcript}"
Respond with only the JSON object.`;

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
    console.log('Gemini response:', geminiText);
    // Try to extract JSON from Gemini's response
    const jsonMatch = geminiText.match(/```json\s*([\s\S]*?)```|({[\s\S]*})/i);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : geminiText;
    console.log('Extracted JSON string:', jsonString);
    
    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback for filter commands
      if (transcript.toLowerCase().includes('filter') || transcript.toLowerCase().includes('show') || transcript.toLowerCase().includes('find')) {
        const lowerTranscript = transcript.toLowerCase();
        if (lowerTranscript.includes('in progress')) {
          result = { intent: 'filter', filterText: 'in progress' };
        } else if (lowerTranscript.includes('pending')) {
          result = { intent: 'filter', filterText: 'pending' };
        } else if (lowerTranscript.includes('completed')) {
          result = { intent: 'filter', filterText: 'completed' };
        } else {
          result = { intent: 'filter', filterText: '' };
        }
      } else {
        throw parseError;
      }
    }
    console.log('Final result:', result);
    console.log('Sending response to frontend:', result);
    res.json(result);
  } catch (err) {
    console.error('Gemini error:', err, err?.response?.data);
    res.status(500).json({ error: 'Failed to process with Gemini', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`LLM backend listening on port ${PORT}`));
