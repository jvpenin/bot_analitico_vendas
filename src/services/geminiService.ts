export const analyzeWithGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.analysis || 'Análise não disponível';
  } catch (error) {
    console.error('Erro ao analisar com Gemini:', error);
    throw new Error('Falha na análise com Gemini');
  }
};