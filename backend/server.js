import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ 
      success: true,
      response: response.text() 
    });
  } catch (error) {
  console.error('Erro detalhado Gemini:', error);
  res.status(500).json({ 
    error: error.message,
    stack: error.stack
  });
}
  }
);

app.get('/', (req, res) => {
  res.send('Backend rodando!');
});

app.get('/health', (req, res) => {
  res.json({status: "ok"});
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
