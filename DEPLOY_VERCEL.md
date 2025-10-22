# Deploy na Vercel - Bot Analítico de Vendas

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Chave da API do Google Gemini
3. Credenciais do Google Drive Service Account
4. Repositório no GitHub/GitLab

## 🚀 Passos para Deploy

### 1. Conectar Repositório
- Acesse [Vercel Dashboard](https://vercel.com/dashboard)
- Clique em "New Project"
- Conecte seu repositório GitHub/GitLab

### 2. Configurar Environment Variables

Na seção "Environment Variables" do projeto na Vercel, adicione:

#### Google Gemini AI
```
VITE_GEMINI_API_KEY = sua_chave_gemini_aqui
```

#### Google Drive API
```
GOOGLE_SERVICE_ACCOUNT_EMAIL = email@projeto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID = seu-projeto-id
GOOGLE_DRIVE_FOLDER_ID = id_da_pasta_drive (opcional)
```

### 3. Configurações de Build
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🔧 Como Obter as Credenciais

### Google Gemini API
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Copie a chave gerada

### Google Drive Service Account
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione existente
3. Ative a API do Google Drive
4. Vá em "Credenciais" > "Criar Credenciais" > "Conta de Serviço"
5. Baixe o arquivo JSON das credenciais
6. Extraia os valores necessários:
   - `client_email` → GOOGLE_SERVICE_ACCOUNT_EMAIL
   - `private_key` → GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
   - `project_id` → GOOGLE_SERVICE_ACCOUNT_PROJECT_ID

### ID da Pasta do Google Drive (Opcional)
1. Abra a pasta no Google Drive
2. Copie o ID da URL: `https://drive.google.com/drive/folders/SEU_ID_AQUI`
3. Compartilhe a pasta com o email da Service Account

## ⚠️ Importante

- **Private Key**: Certifique-se de que a chave privada mantenha as quebras de linha (`\n`)
- **Permissões**: A Service Account precisa ter acesso às pastas do Drive
- **Segurança**: Nunca commite as credenciais no código

## 🧪 Testando o Deploy

Após o deploy:
1. Acesse a URL fornecida pela Vercel
2. Teste o carregamento das planilhas do Drive
3. Teste a análise com o Gemini AI

## 📝 Estrutura do Projeto

```
/
├── api/                    # Serverless Functions
│   ├── analyze.js         # Análise com Gemini
│   └── drive/
│       ├── files.js       # Listar arquivos
│       └── reload.js      # Recarregar dados
├── src/                   # Frontend React
├── vercel.json           # Configuração Vercel
└── .env.example          # Exemplo de variáveis
```

## 🔄 Atualizações

Para atualizar o projeto:
1. Faça push das alterações para o repositório
2. A Vercel fará o redeploy automaticamente