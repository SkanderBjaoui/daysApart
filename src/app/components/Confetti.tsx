import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
  message?: string;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, message }) => {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; color: string; delay: number; duration: number }>>([]);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (trigger) {
      const colors = ['#FFB6D9', '#B6D9FF', '#D4B5FF', '#FFD1BC', '#B6FFD9'];
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
      }));
      setPieces(newPieces);
      setShowMessage(true);

      setTimeout(() => {
        setPieces([]);
        setShowMessage(false);
      }, 4000);
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confetti pieces */}
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 rounded-full animate-fall"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}

      {/* Celebration message */}
      {showMessage && message && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
          <div className="bg-white rounded-3xl shadow-2xl px-12 py-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl text-[var(--primary)] mb-2">{message}</h2>
            <p className="text-[var(--muted-foreground)]">Keep going, you're amazing! 💕</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};
