import { useState, useEffect } from "react";

const taglines = [
  "Fornecendo clareza e previsibilidade",
  "Transformando dados em decisões",
  "Insights instantâneos para seu negócio",
  "Análise inteligente em linguagem natural",
];

export const AnimatedTagline = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % taglines.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className={`text-sm text-muted-foreground transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {taglines[currentIndex]}
    </p>
  );
};
