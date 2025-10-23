/**
 * Utilitário para gerenciar URLs da API baseado no ambiente
 */

export const getApiUrl = (): string => {
  // Se estamos no browser
  if (typeof window !== 'undefined') {
    // Em desenvolvimento local
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // Em produção (Vercel ou outro domínio)
    return window.location.origin;
  }
  
  // Fallback para SSR ou outros contextos
  return 'http://localhost:3001';
};

/**
 * Constrói URL completa para endpoints da API
 */
export const getApiEndpoint = (path: string): string => {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Configuração padrão para fetch requests
 */
export const defaultFetchConfig: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Wrapper para chamadas da API com tratamento de erro
 */
export const apiCall = async (endpoint: string, config: RequestInit = {}) => {
  const url = getApiEndpoint(endpoint);
  const finalConfig = { ...defaultFetchConfig, ...config };
  
  try {
    const response = await fetch(url, finalConfig);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro na chamada da API ${endpoint}:`, error);
    throw error;
  }
};