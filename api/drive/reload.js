export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Na Vercel, cada função é stateless, então não há cache persistente
    // Os dados são recarregados automaticamente a cada requisição
    res.json({ 
      success: true, 
      message: 'Dados serão recarregados na próxima análise (Vercel Serverless)' 
    });
  } catch (error) {
    console.error('Erro ao recarregar dados:', error);
    res.status(500).json({ error: 'Falha ao recarregar dados' });
  }
}