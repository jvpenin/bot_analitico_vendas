import { useState } from 'react';
import { analyzeWithGemini } from '@/services/geminiService';

export default function TestGemini() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    if (!prompt.trim()) {
      setError('Digite algo para testar!');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await analyzeWithGemini(prompt);
      setResponse(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🧪 Teste do Gemini API
        </h1>

        {/* Status do Backend */}
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            ✅ Backend: <strong>{typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin) : 'API'}</strong>
          </p>
          <p className="text-sm text-blue-800">
            ✅ Frontend: <strong>{typeof window !== 'undefined' ? window.location.origin : 'Frontend'}</strong>
          </p>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Digite sua pergunta:
          </label>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Ex: Explique o que é inteligência artificial em 3 frases"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Botão */}
        <button
          onClick={handleTest}
          disabled={loading || !prompt.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '⏳ Processando...' : '🚀 Testar API'}
        </button>

        {/* Erro */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              <strong>❌ Erro:</strong> {error}
            </p>
          </div>
        )}

        {/* Resposta */}
        {response && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">✅ Resposta do Gemini:</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
          </div>
        )}

        {/* Instruções */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-bold mb-2">📝 Como testar:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Digite uma pergunta no campo acima</li>
            <li>Clique em "Testar API"</li>
            <li>Aguarde a resposta do Gemini</li>
          </ol>
        </div>
      </div>
    </div>
  );
}