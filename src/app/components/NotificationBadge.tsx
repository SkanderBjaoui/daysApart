import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  count: number;
  message?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, message }) => {
  if (count === 0) return null;

  return (
    <div className="relative group">
      <div className="relative">
        <Bell className="w-6 h-6 text-[var(--primary)] animate-wiggle" />
        <div className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {count}
        </div>
      </div>

      {/* Tooltip */}
      {message && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-[var(--primary)] text-white text-sm px-4 py-2 rounded-xl whitespace-nowrap shadow-lg">
            {message}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[var(--primary)] rotate-45" />
          </div>
        </div>
      )}

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
