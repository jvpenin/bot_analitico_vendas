# Configuração do Vercel - Bot Analítico de Vendas

## Problema Identificado

O erro `invalid_grant: account not found` indica que as variáveis de ambiente do Google Service Account não estão configuradas corretamente no Vercel.

## Solução: Configurar Variáveis de Ambiente no Vercel

### 1. Acesse o Dashboard do Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto "bot-analitico-venda"

### 2. Configure as Variáveis de Ambiente

1. No dashboard do projeto, clique em **Settings**
2. No menu lateral, clique em **Environment Variables**
3. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```
VITE_GEMINI_API_KEY=AIzaSyBexVTyuo-8akgITnPpnDhC_hK7nz3dqAM

GOOGLE_SERVICE_ACCOUNT_EMAIL=bot-marcelao-vendas@gemini-key-473019.iam.gserviceaccount.com

GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQ0b5ixiw++tX6
KwXcld0Fai9Z/+JVdYa8gjj7AjIWDOPiVzdt7KK5ZaeqrQ4Ik54s8Sp/vfP4rMoy
5k8VYnBmik0TYJv2WdcXuk6clQgeVL1d1rv+BcuN4vjtUgLLMwrezH3sEA/v2vZm
8Zn9srSA57j3pqyG7jSDDjLXbjk0UyetaAhT68uiU9muz3SguMz+EGNATmNwvTY7
HUqOibptciviRIKDiWPKlxoCB2YXqAizGZI5Et8MFQRNmpwDMiQ7j4kbVFcgehRt
hSuS+VbU6H4Mv+MWIDTzrEwwlqJhPxuulrPslWOoHiseGvqvASDjiN6zGBRiUisb
5CsVLoy5AgMBAAECggEADWMc8wUkagc3t5mRfyJGcKXtkjYC4xqtQCGTGJh78Ij0
BRs1TQFKL1uSg7EjgK5CCjyNznG1leAx+FBmiobskM5WAaOEbCc3UGibyJMPWa5y
E3WESNVDRv3hmolS74b+r+jpO7yN4QEnIdNkXWzbAJaad5oCXoYf7LT40nHZDf8X
CXz5+YzXxz4Nan34m9uJwweD2iC7ZLI9b2z0CC038L/fVB8jORHmhP3t8fUEoCkD
BkFAjeB59eQimFOvUzPnCYyced3OvjaPFAVDfa1c1j411V8Af9rjHr9tkgrhNL+E
mQm8OOGruIPOOyXc+So379jS8+G3h1L8Ce+NWJ9dVwKBgQD3nksqeUQaIRA/eJea
1GDozUD5B1AegnxkY9WuXFc7mGNhrf9JjteiwW/eMOGfNPdSZyLOx/Cky9GXh4Df
ETpxTcWnb0QyVSv32QHaytDyvGbo3IiDAtFvWpu2gl6+WPfZvN3L6dCw138JceVY
cnKldoN6sp2XKdchjdn6/dc4QwKBgQDX4z3sedEi+6dOQlHcrCHuFnioLixFRSmg
qOsW7tK8X8cZqHeXUyEZbBPFKVjNHrqh7f33Awe7jcqxFFGCw2cYkGdDhy7JADxF
jRbMI7cHWla+bvRUO65fn06nUl5SpOMJPrAWAZ4AVnwNDO5eNK9RSdFWbqlCRItI
n3XdlJoFUwKBgBv9WKHEc15AvoVuLDTkLNAj42RC31uThFwUrOK4rWOfJhy0flbi
Pp23H94NyHMmmY5G+jhFgX4fS+HE/1w3plOIZv82JI9L8Vxiu0LwCg5mHXvU8dld
SC8+HrvSoMMDa4DBSJD0LRLQSRvYNAR7a1oou1PzPL0JjbfNQQaOCvXhAoGBAJ7P
aXQVwITtfouROcsNTQBpw2RkYuiqEg8/c4CxOpCcHEiBp0fIPScIXBrDabGqkzwf
aJ1Wu0965MoS2ktJFwP45h3EyePOqoe3XDfbZf6gtALueAmmxYVOGXv4ma5N4T2h
wcLOeb5h4GtxQcBHHVi85qOgUB6RcayAsSHI+OxFAoGBAJ3j9CcQFIsracBAB3MU
Ij59IBvMdO4n0m9ZD+uniI4sC/O/Pk2YHRU0gGwbjWDx6XWGr+wtt4UZTjRDen/6
xya8OgjobQ4k0VOAyb6QjsijoN4NlcSC0eSQH0CqNebJA09ZR1VYpEWlYa/AcC+p
3Ssbg9PLlJYtlRG5BULXFGEj
-----END PRIVATE KEY-----"

GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=gemini-key-473019

GOOGLE_DRIVE_FOLDER_ID=1ebUfVeSze-HFENHepg-r_nWE-KVit_-a
```

### 3. Pontos Importantes

#### Para GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
- **IMPORTANTE**: Mantenha as aspas duplas no início e fim
- **IMPORTANTE**: Mantenha os `\n` para quebras de linha
- **IMPORTANTE**: Cole exatamente como mostrado acima

#### Configuração de Ambiente:
- Defina todas as variáveis para **Production**, **Preview** e **Development**
- Ou selecione apenas **Production** se preferir

### 4. Após Configurar

1. Clique em **Save** para cada variável
2. Vá para a aba **Deployments**
3. Clique nos três pontos (...) do último deployment
4. Selecione **Redeploy**
5. Aguarde o novo deployment completar

### 5. Verificação

Após o redeploy, teste a aplicação:
- Acesse a URL da aplicação
- Tente listar arquivos do Google Drive
- O erro "invalid_grant: account not found" deve ser resolvido

## Troubleshooting

Se ainda houver problemas:

1. **Verifique se todas as variáveis foram salvas corretamente**
2. **Confirme que a private key está com as quebras de linha corretas**
3. **Verifique se o Service Account tem permissões no Google Drive**
4. **Confirme que o GOOGLE_DRIVE_FOLDER_ID existe e é acessível**

## Contato

Se precisar de ajuda adicional, verifique os logs do Vercel em **Functions** > **View Function Logs**.