import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import stream from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuração do Google Drive
let drive;
let spreadsheetData = [];

async function initializeGoogleDrive() {
  try {
    const keyPath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    drive = google.drive({ version: 'v3', auth });
    console.log('✅ Google Drive API inicializada com sucesso');
    
    // Carregar dados das planilhas na inicialização
    await loadSpreadsheetData();
  } catch (error) {
    console.error('❌ Erro ao inicializar Google Drive API:', error);
  }
}

async function loadSpreadsheetData() {
  try {
    if (!drive) {
      console.log('Google Drive não inicializado');
      return;
    }

    console.log('Carregando dados das planilhas...');
    
    // Buscar arquivos CSV no Google Drive (incluindo diferentes tipos de planilhas)
    let query = "mimeType='text/csv' or mimeType='application/vnd.ms-excel' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'";
    
    // Se tiver GOOGLE_DRIVE_FOLDER_ID, buscar apenas nessa pasta
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      query += ` and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, modifiedTime, mimeType, size)'
    });

    const files = response.data.files;
    console.log(`Encontrados ${files.length} arquivos de planilhas`);

    // Limpar dados anteriores
    spreadsheetData = [];

    // Processar cada arquivo
    for (const file of files) {
      try {
        console.log(`Processando: ${file.name} (${file.mimeType})`);
        
        const fileData = await drive.files.get({
          fileId: file.id,
          alt: 'media'
        });

        // Processar apenas arquivos CSV por enquanto
         if (file.mimeType === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
           const csvData = [];
           const readable = new stream.Readable();
          
          // Converter buffer para string se necessário
          const content = typeof fileData.data === 'string' ? fileData.data : fileData.data.toString();
          readable.push(content);
          readable.push(null);

          await new Promise((resolve, reject) => {
            readable
              .pipe(csv())
              .on('data', (row) => {
                // Converter objeto para array de valores
                const values = Object.values(row);
                csvData.push(values);
              })
              .on('end', resolve)
              .on('error', reject);
          });

          // Se não conseguiu processar como CSV, tentar parsing manual
          if (csvData.length === 0) {
            const lines = content.split('\n').filter(line => line.trim());
            for (const line of lines) {
              const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
              csvData.push(values);
            }
          }

          spreadsheetData.push({
            fileName: file.name,
            lastModified: new Date(file.modifiedTime).toLocaleDateString('pt-BR'),
            data: csvData,
            fileId: file.id,
            size: file.size
          });

          console.log(`✅ Processado: ${file.name} - ${csvData.length} linhas`);
        } else {
          console.log(`⚠️ Tipo de arquivo não suportado: ${file.name} (${file.mimeType})`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${file.name}:`, error.message);
      }
    }

    console.log(`🎉 Total de planilhas carregadas: ${spreadsheetData.length}`);
    
    // Log dos dados carregados para debug
    spreadsheetData.forEach(sheet => {
      console.log(`📊 ${sheet.fileName}: ${sheet.data.length} linhas`);
      if (sheet.data.length > 0) {
        console.log(`   Cabeçalhos: ${sheet.data[0].join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('Erro ao carregar dados das planilhas:', error);
  }
}

// Rota para listar arquivos do Google Drive
app.get('/api/drive/files', async (req, res) => {
  try {
    if (!drive) {
      return res.status(500).json({ error: 'Google Drive não inicializado' });
    }

    const response = await drive.files.list({
      q: "mimeType='text/csv' or mimeType='application/vnd.ms-excel' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'",
      fields: 'files(id, name, size, modifiedTime)'
    });

    const files = response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      size: file.size ? `${Math.round(file.size / 1024)} KB` : 'N/A',
      lastModified: new Date(file.modifiedTime).toLocaleDateString('pt-BR')
    }));

    res.json(files);
  } catch (error) {
    console.error('Erro ao listar arquivos do Drive:', error);
    res.status(500).json({ error: 'Falha ao carregar arquivos do Google Drive' });
  }
});

// Rota para recarregar dados das planilhas
app.post('/api/drive/reload', async (req, res) => {
  try {
    await loadSpreadsheetData();
    res.json({ success: true, message: 'Dados recarregados com sucesso' });
  } catch (error) {
    console.error('Erro ao recarregar dados:', error);
    res.status(500).json({ error: 'Falha ao recarregar dados' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Preparar contexto com dados das planilhas
    let context = "Dados das planilhas de vendas disponíveis:\n\n";
    
    spreadsheetData.forEach((sheet, index) => {
      context += `=== ${sheet.fileName} ===\n`;
      context += `Última modificação: ${sheet.lastModified}\n`;
      
      // Adicionar cabeçalhos e algumas linhas de exemplo
      if (sheet.data && sheet.data.length > 0) {
        context += `Cabeçalhos: ${sheet.data[0].join(', ')}\n`;
        context += `Total de registros: ${sheet.data.length - 1}\n`;
        
        // Adicionar algumas linhas de exemplo (máximo 5)
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

    // Combinar contexto com prompt do usuário
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
});

app.get('/', (req, res) => {
  res.send('Backend rodando com integração Google Drive!');
});

app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    driveConnected: !!drive,
    spreadsheetsLoaded: spreadsheetData.length
  });
});

// Inicializar Google Drive na inicialização do servidor
initializeGoogleDrive();

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
