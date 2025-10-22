import "https://deno.land/x/xhr@0.1.0/mod.ts";
declare const Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const messages = body.messages || [];
    const filePaths: string[] = body.filePaths || [];

  // Leia a chave da variável de ambiente correta — nunca hardcode a chave aqui
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const MODEL = 'gemini-2.5-flash';

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    console.log('Iniciando chat com Gemini, mensagens:', messages.length, 'files:', filePaths.length);

    // Se houver filePaths (paths dentro do bucket 'spreadsheets'), tentar baixar o conteúdo público
    const fileContexts: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    if (filePaths.length > 0 && SUPABASE_URL) {
      for (const path of filePaths) {
        try {
          // URL pública para objetos: /storage/v1/object/public/<bucket>/<path>
          const url = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/spreadsheets/${encodeURIComponent(path)}`;
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            fileContexts.push({
              role: 'system',
              parts: [{ text: `Conteúdo do arquivo ${path}:\n${text}` }]
            });
          } else {
            console.warn('Falha ao baixar arquivo', path, res.status);
          }
        } catch (e) {
          console.error('Erro ao baixar arquivo', path, e);
        }
      }
    }

    // Formatar mensagens para o formato do Gemini
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const requestBody: any = {
      contents: [
        // arquivos (se houver) vêm antes como contexto do sistema
        ...fileContexts,
        ...contents,
      ],
      systemInstruction: {
        parts: [{ 
          text: `Você é o Apollo Analytics, um assistente especializado em análise de dados de vendas.\nVocê ajuda usuários a entender seus dados através de análises claras e insights acionáveis.\nSempre forneça respostas em português, de forma clara e objetiva.\nQuando não houver dados disponíveis, explique que o usuário precisa carregar planilhas primeiro.`
        }]
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    console.log('Chamando Gemini API...');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API Gemini:', response.status, errorText);

      // Retornar o erro da API para o frontend com detalhes para diagnóstico
      const payload = {
        error: 'Erro na API Gemini',
        status: response.status,
        details: errorText,
      };

      // Trata especificamente rate limit
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(payload), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Retornar stream diretamente
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Erro no chat-gemini:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
