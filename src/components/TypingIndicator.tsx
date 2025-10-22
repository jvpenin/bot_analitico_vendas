import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-slide-up">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-bot">
        <Bot className="w-5 h-5 text-primary-foreground" />
      </div>
      
      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-white rounded-full animate-typing" style={{ animationDelay: "0s" }}></span>
          <span className="w-2 h-2 bg-white rounded-full animate-typing" style={{ animationDelay: "0.2s" }}></span>
          <span className="w-2 h-2 bg-white rounded-full animate-typing" style={{ animationDelay: "0.4s" }}></span>
        </div>
      </div>
    </div>
  );
};
