import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface DailyCheckInProps {
  onCheckIn: (note: string) => void;
  hasCheckedInToday: boolean;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ onCheckIn, hasCheckedInToday }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (note.trim()) {
      onCheckIn(note);
      setNote('');
      setIsExpanded(false);
    }
  };

  if (hasCheckedInToday) {
    return (
      <div className="bg-gradient-to-r from-[var(--pastel-mint)] to-[var(--pastel-blue)] rounded-2xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-white mx-auto mb-2 animate-pulse" />
        <p className="text-white">You've checked in today! 💖</p>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--pastel-peach)] hover:shadow-xl transition-all duration-300 rounded-2xl p-6 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
        <div className="relative flex items-center justify-center gap-3">
          <Heart className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform duration-300" />
          <span className="text-white">Daily Check-In</span>
          <Heart className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform duration-300" />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--primary)]">
      <h3 className="text-[var(--primary)] mb-4 text-center">How are you feeling today?</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Share your thoughts, feelings, or what made you smile today..."
        className="w-full h-32 p-4 border-2 border-[var(--border)] rounded-xl bg-[var(--input-background)] resize-none focus:border-[var(--primary)] focus:outline-none transition-colors"
      />
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-[var(--primary)] hover:bg-[var(--pastel-pink)] text-white rounded-xl py-3 transition-colors"
        >
          Send with Love 💖
        </button>
        <button
          onClick={() => setIsExpanded(false)}
          className="px-6 bg-gray-200 hover:bg-gray-300 text-[var(--foreground)] rounded-xl py-3 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
