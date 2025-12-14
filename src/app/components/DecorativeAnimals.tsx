import React from 'react';
import { Cat, Rabbit } from 'lucide-react';

export const DecorativeAnimals: React.FC = () => {
  return (
    <>
      {/* Cat peeking from top left */}
      <div className="fixed top-8 left-8 z-0 opacity-30 animate-bounce">
        <div className="relative">
          <Cat className="w-16 h-16 text-[var(--pastel-pink)]" />
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Rabbit on top right */}
      <div className="fixed top-8 right-8 z-0 opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <div className="relative">
          <Rabbit className="w-16 h-16 text-[var(--pastel-blue)]" />
          <div className="absolute -top-1 -left-1">
            <div className="w-3 h-3 bg-[var(--secondary)] rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Cat on bottom left */}
      <div className="fixed bottom-8 left-8 z-0 opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
        <Cat className="w-12 h-12 text-[var(--pastel-lavender)]" />
      </div>

      {/* Rabbit on bottom right */}
      <div className="fixed bottom-8 right-8 z-0 opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <Rabbit className="w-12 h-12 text-[var(--pastel-peach)]" />
      </div>

      {/* Floating hearts */}
      <div className="fixed top-1/4 left-1/3 z-0 opacity-10">
        <div className="text-4xl animate-pulse">💗</div>
      </div>
      <div className="fixed top-2/3 right-1/4 z-0 opacity-10" style={{ animationDelay: '0.7s' }}>
        <div className="text-3xl animate-pulse">💕</div>
      </div>
      <div className="fixed top-1/2 left-1/4 z-0 opacity-10" style={{ animationDelay: '1.3s' }}>
        <div className="text-2xl animate-pulse">💖</div>
      </div>
    </>
  );
};
