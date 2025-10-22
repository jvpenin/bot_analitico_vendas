const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

// Variável global para cache dos dados das planilhas
let spreadsheetData = [];
let drive = null;

// Função para inicializar Google Drive
async function initializeGoogleDrive() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 
        !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || 
        !process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID) {
      console.log('⚠️ Credenciais do Google Drive não configuradas');
      return null;
    }

    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    drive = google.drive({ version: 'v3', auth });
    console.log('✅ Google Drive API inicializada com sucesso');
    
    // Carregar dados das planilhas
    await loadSpreadsheetData();
    
    return drive;
  } catch (error) {
    console.error('❌ Erro ao inicializar Google Drive:', error);
    return null;
  }
}

// Função para carregar dados das planilhas
async function loadSpreadsheetData() {
  try {
    if (!drive) {
      console.log('Google Drive não inicializado');
      return;
    }

    console.log('Carregando dados das planilhas...');
    
    let query = "mimeType='text/csv' or mimeType='application/vnd.ms-excel' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'";
    
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      query += ` and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, modifiedTime, mimeType, size)'
    });

    const files = response.data.files;
    console.log(`Encontrados ${files.length} arquivos de planilhas`);

    spreadsheetData = [];

    for (const file of files) {
      try {
        console.log(`Processando: ${file.name} (${file.mimeType})`);
        
        const fileData = await drive.files.get({
          fileId: file.id,
          alt: 'media'
        });

        if (file.mimeType === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
          const content = typeof fileData.data === 'string' ? fileData.data : fileData.data.toString();
          const csvData = [];
          
          const lines = content.split('\n').filter(line => line.trim());
          for (const line of lines) {
            const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
            csvData.push(values);
          }

          spreadsheetData.push({
            fileName: file.name,
            lastModified: new Date(file.modifiedTime).toLocaleDateString('pt-BR'),
            data: csvData,
            fileId: file.id,
            size: file.size
          });

          console.log(`✅ Processado: ${file.name} - ${csvData.length} linhas`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${file.name}:`, error.message);
      }
    }

    console.log(`🎉 Total de planilhas carregadas: ${spreadsheetData.length}`);
  } catch (error) {
    console.error('Erro ao carregar dados das planilhas:', error);
  }
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    // Inicializar Google Drive se ainda não foi inicializado
    if (!drive) {
      await initializeGoogleDrive();
    }

    // Preparar contexto com dados das planilhas
    let context = "Dados das planilhas de vendas disponíveis:\n\n";
    
    spreadsheetData.forEach((sheet) => {
      context += `=== ${sheet.fileName} ===\n`;
      context += `Última modificação: ${sheet.lastModified}\n`;
      
      if (sheet.data && sheet.data.length > 0) {
        context += `Cabeçalhos: ${sheet.data[0].join(', ')}\n`;
        context += `Total de registros: ${sheet.data.length - 1}\n`;
        
        const sampleRows = sheet.data.slice(1, 6);
        if (sampleRows.length > 0) {
          context += "Exemplos de dados:\n";
          sampleRows.forEach(row => {
            context += `${row.join(', ')}\n`;
          });
        }
      }
      context += "\n";
    });

    const fullPrompt = `${context}\n\nPergunta do usuário: ${prompt}\n\nPor favor, analise os dados das planilhas e responda à pergunta do usuário com base nas informações disponíveis. Se precisar de cálculos ou análises específicas, use os dados fornecidos.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    res.json({ 
      success: true,
      response: response.text(),
      dataSource: `${spreadsheetData.length} planilhas analisadas`
    });
  } catch (error) {
    console.error('Erro detalhado Gemini:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}