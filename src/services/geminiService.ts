// URL dinâmica baseada no ambiente
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // No browser, usar a URL atual ou localhost para desenvolvimento
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3001';
    }
    return window.location.origin;
  }
  return 'http://localhost:3001';
};

export const geminiService = {
  async analyze(prompt: string) {
    try {
      const response = await fetch(`${getApiUrl()}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
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