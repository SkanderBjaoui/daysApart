import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date | string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      const difference = target.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="relative bg-gradient-to-br from-[var(--pastel-pink)] via-[var(--pastel-lavender)] to-[var(--pastel-blue)] rounded-[2rem] p-8 shadow-lg overflow-hidden">
      {/* Decorative hearts */}
      <div className="absolute top-4 right-4 opacity-20">
        <Heart className="w-12 h-12 fill-white text-white" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-10">
        <Heart className="w-16 h-16 fill-white text-white" />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-white mb-2">Days Until We Meet Again</h2>
          <Heart className="w-8 h-8 fill-white text-white mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-4xl font-bold text-[var(--primary)] mb-1">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-sm text-[var(--foreground)]">Days</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-4xl font-bold text-[var(--secondary)] mb-1">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-sm text-[var(--foreground)]">Hours</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-4xl font-bold text-[var(--pastel-lavender)] mb-1">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-sm text-[var(--foreground)]">Mins</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-4xl font-bold text-[var(--pastel-peach)] mb-1">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-sm text-[var(--foreground)]">Secs</div>
          </div>
        </div>
      </div>
    </div>
  );
};
