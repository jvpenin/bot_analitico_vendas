import { apiCall } from '@/lib/api';

export const analyzeWithGemini = async (prompt: string): Promise<string> => {
  try {
    const result = await apiCall('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    
    return result.response || result.analysis || 'Análise não disponível';
  } catch (error) {
    console.error('Erro ao analisar com Gemini:', error);
    throw new Error('Falha na análise com Gemini');
  }
};