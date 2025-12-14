import React, { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface MilestoneMessageProps {
  daysRemaining: number;
  totalDays: number;
}

export const MilestoneMessage: React.FC<MilestoneMessageProps> = ({
  daysRemaining,
  totalDays,
}) => {
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    let newMessage = '';
    const daysPassed = totalDays - daysRemaining;
    const isHalfway = Math.abs(daysPassed - totalDays / 2) < 1;
    const isOneWeek = daysRemaining === 7;
    const isThreeDays = daysRemaining === 3;
    const isOneDayLeft = daysRemaining === 1;

    if (isHalfway) {
      newMessage = "🎉 Halfway there! You're doing amazing! 🎉";
    } else if (isOneWeek) {
      newMessage = "⏰ One week to go! The countdown is real! ⏰";
    } else if (isThreeDays) {
      newMessage = "🌟 Just 3 days left! Almost there! 🌟";
    } else if (isOneDayLeft) {
      newMessage = "💕 Tomorrow's the day! Get ready! 💕";
    } else if (daysRemaining === 0) {
      newMessage = "🎊 REUNION DAY! Enjoy every moment! 🎊";
    }

    if (newMessage) {
      setMessage(newMessage);
      setShowMessage(true);
    }
  }, [daysRemaining, totalDays]);

  if (!showMessage || !message) return null;

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 animate-slide-down">
      <div className="bg-gradient-to-r from-[var(--primary)] via-[var(--pastel-lavender)] to-[var(--secondary)] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="font-medium">{message}</span>
        <Heart className="w-6 h-6 fill-white animate-pulse" />
      </div>

      <style>{`
        @keyframes slide-down {
          0% {
            transform: translate(-50%, -100px);
            opacity: 0;
          }
          10%, 90% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -100px);
            opacity: 0;
          }
        }
        .animate-slide-down {
          animation: slide-down 5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
