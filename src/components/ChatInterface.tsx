import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedTagline } from "./AnimatedTagline";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

const exampleQuestions = [
  "Qual foi o produto mais vendido no terceiro trimestre?",
  "Qual a variação percentual de receita entre janeiro e dezembro?",
  "Mostre-me o desempenho de vendas por região",
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Olá! Sou o Apollo Analytics. Carregue suas planilhas de vendas e faça perguntas em linguagem natural. Estou aqui para transformar seus dados em insights acionáveis.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: input,
  };

  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsTyping(true);

  try {
    // Chamada para a API usando utilitário que detecta o ambiente
    const { apiCall } = await import("@/lib/api");
    const result = await apiCall("/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        prompt: input, // ENVIE APENAS O TEXTO ATUAL!
      }),
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "bot",
        content: result.response, // Pegue direto do campo response
      },
    ]);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "bot",
        content: "Erro ao processar resposta, tente novamente.",
      },
    ]);
    toast.error(
      error instanceof Error
        ? error.message
        : "Erro ao processar sua mensagem. Tente novamente."
    );
  }
  setIsTyping(false);
};


  const handleExampleClick = (question: string) => {
    setInput(question);
    toast.info("Pergunta preenchida! Clique em enviar ou edite como preferir.");
  };

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Header */}
      <div className="border-b border-border bg-gradient-subtle p-6 text-center relative">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Apollo Analytics</h1>
        </div>
        <AnimatedTagline />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} role={message.role} content={message.content} />
        ))}
        
        {isTyping && <TypingIndicator />}

        {messages.length === 1 && !isTyping && (
          <div className="mt-8 space-y-3 animate-fade-in">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Experimente perguntar:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {exampleQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(question)}
                  className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-all hover:scale-105 border border-border"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-gradient-subtle p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pergunte ao Apollo sobre suas vendas..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="bg-gradient-to-br from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
