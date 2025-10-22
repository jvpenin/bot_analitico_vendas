const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const csv = require('csv-parser');
const { Readable } = require('stream');

let genAI = null;
let drive = null;
let spreadsheetData = [];

async function initializeGemini() {
  try {
    if (!process.env.VITE_GEMINI_API_KEY) {
      console.log('⚠️ Chave da API do Gemini não configurada');
      return null;
    }
    
    genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    console.log('✅ Gemini AI inicializado com sucesso');
    return genAI;
  } catch (error) {
    console.error('❌ Erro ao inicializar Gemini:', error);
    return null;
  }
}

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
    return drive;
  } catch (error) {
    console.error('❌ Erro ao inicializar Google Drive:', error);
    return null;
  }
}

async function loadSpreadsheetData() {
  try {
    if (!drive) {
      drive = await initializeGoogleDrive();
    }

    if (!drive) {
      console.log('⚠️ Google Drive não disponível, usando dados em cache');
      return spreadsheetData;
    }

    let query = "mimeType='text/csv' or mimeType='application/vnd.ms-excel' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'";
    
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      query += ` and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, size, modifiedTime)'
    });

    const files = response.data.files;
    console.log(`📁 Encontrados ${files.length} arquivos de planilhas`);

    spreadsheetData = [];

    for (const file of files) {
      try {
        if (file.name.toLowerCase().endsWith('.csv')) {
          console.log(`📄 Processando: ${file.name}`);
          
          const fileResponse = await drive.files.get({
            fileId: file.id,
            alt: 'media'
          });

          const csvData = fileResponse.data;
          const rows = [];

          await new Promise((resolve, reject) => {
            const stream = Readable.from([csvData]);
            stream
              .pipe(csv())
              .on('data', (row) => {
                rows.push(row);
              })
              .on('end', () => {
                resolve();
              })
              .on('error', (error) => {
                console.error(`Erro ao processar CSV ${file.name}:`, error);
                
                const lines = csvData.split('\n');
                if (lines.length > 1) {
                  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                  
                  for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                      const row = {};
                      headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                      });
                      rows.push(row);
                    }
                  }
                }
                resolve();
              });
          });

          if (rows.length > 0) {
            spreadsheetData.push({
              fileName: file.name,
              data: rows,
              lastModified: file.modifiedTime,
              rowCount: rows.length
            });
            console.log(`✅ ${file.name}: ${rows.length} linhas carregadas`);
          }
        }
      } catch (fileError) {
        console.error(`❌ Erro ao processar arquivo ${file.name}:`, fileError);
      }
    }

    console.log(`📊 Total de planilhas carregadas: ${spreadsheetData.length}`);
    return spreadsheetData;
  } catch (error) {
    console.error('❌ Erro ao carregar dados das planilhas:', error);
    return spreadsheetData;
  }
}

module.exports = async function handler(req, res) {
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

    // Inicializar Gemini se ainda não foi inicializado
    if (!genAI) {
      await initializeGemini();
    }

    if (!genAI) {
      return res.status(500).json({ error: 'Gemini AI não disponível' });
    }

    // Carregar dados das planilhas
    await loadSpreadsheetData();

    // Preparar contexto com dados das planilhas
    let context = "Dados das planilhas de vendas disponíveis:\n\n";
    
    spreadsheetData.forEach((sheet) => {
      context += `=== ${sheet.fileName} ===\n`;
      context += `Última modificação: ${new Date(sheet.lastModified).toLocaleDateString('pt-BR')}\n`;
      context += `Total de registros: ${sheet.rowCount}\n`;
      
      if (sheet.data && sheet.data.length > 0) {
        const headers = Object.keys(sheet.data[0]);
        context += `Cabeçalhos: ${headers.join(', ')}\n`;
        
        const sampleRows = sheet.data.slice(0, 3);
        if (sampleRows.length > 0) {
          context += "Exemplos de dados:\n";
          sampleRows.forEach(row => {
            const values = headers.map(header => row[header] || '').join(', ');
            context += `${values}\n`;
          });
        }
      }
      context += "\n";
    });

    const fullPrompt = `${context}\n\nPergunta do usuário: ${prompt}\n\nPor favor, analise os dados das planilhas e responda à pergunta do usuário com base nas informações disponíveis. Se precisar de cálculos ou análises específicas, use os dados fornecidos.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
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