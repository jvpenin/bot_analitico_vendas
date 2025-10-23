import { apiCall } from '@/lib/api';

export const geminiService = {
  async analyze(prompt: string) {
    try {
      const data = await apiCall('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      return data;
    } catch (error) {
      console.error('Erro ao chamar API:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
};