import React from 'react';
import { Cat, Rabbit } from 'lucide-react';

interface LoadingAnimalsProps {
  message?: string;
}

export const LoadingAnimals: React.FC<LoadingAnimalsProps> = ({ 
  message = "Loading your memories..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        {/* Bouncing cat */}
        <div className="absolute -left-12 top-0 animate-bounce" style={{ animationDelay: '0s' }}>
          <Cat className="w-12 h-12 text-[var(--pastel-pink)]" />
        </div>

        {/* Center loading circle */}
        <div className="w-16 h-16 rounded-full border-4 border-[var(--pastel-lavender)] border-t-[var(--primary)] animate-spin" />

        {/* Bouncing rabbit */}
        <div className="absolute -right-12 top-0 animate-bounce" style={{ animationDelay: '0.3s' }}>
          <Rabbit className="w-12 h-12 text-[var(--pastel-blue)]" />
        </div>
      </div>

      <p className="text-[var(--muted-foreground)] mt-8 animate-pulse">
        {message}
      </p>

      {/* Loading dots */}
      <div className="flex gap-2 mt-4">
        <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 bg-[var(--secondary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-[var(--pastel-lavender)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
};
