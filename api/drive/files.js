const { google } = require('googleapis');

let drive = null;

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

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Inicializar Google Drive se ainda não foi inicializado
    if (!drive) {
      drive = await initializeGoogleDrive();
    }

    if (!drive) {
      return res.status(500).json({ error: 'Google Drive não inicializado' });
    }

    let query = "mimeType='text/csv' or mimeType='application/vnd.ms-excel' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'";
    
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      query += ` and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
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
}