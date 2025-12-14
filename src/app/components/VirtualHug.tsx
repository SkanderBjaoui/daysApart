import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface VirtualHugProps {
  onSend: () => void;
}

export const VirtualHug: React.FC<VirtualHugProps> = ({ onSend }) => {
  const [isHugging, setIsHugging] = useState(false);
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  const sendHug = () => {
    setIsHugging(true);
    onSend();

    // Create floating hearts
    const newHearts = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setHearts(newHearts);

    setTimeout(() => {
      setIsHugging(false);
      setHearts([]);
    }, 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={sendHug}
        disabled={isHugging}
        className="relative bg-gradient-to-r from-[var(--primary)] via-[var(--pastel-lavender)] to-[var(--secondary)] hover:shadow-2xl text-white px-8 py-4 rounded-full transition-all disabled:opacity-70 group overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span className="text-2xl">🤗</span>
          <span>{isHugging ? 'Virtual Hug Delivered!' : 'Send Virtual Hug'}</span>
          <Heart className={`w-5 h-5 ${isHugging ? 'fill-white animate-pulse' : ''}`} />
        </span>

        {/* Ripple effect */}
        {isHugging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-white/30 rounded-full animate-ping" />
          </div>
        )}
      </button>

      {/* Floating hearts animation */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-0 pointer-events-none"
          style={{
            left: `${heart.x}%`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          <Heart
            className="w-6 h-6 fill-[var(--primary)] text-[var(--primary)] animate-float-up"
          />
        </div>
      ))}

      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) scale(0.5);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
