import React from 'react';
import { Heart } from 'lucide-react';

interface TogetherInHeartProps {
  partner1Name: string;
  partner2Name: string;
}

export const TogetherInHeart: React.FC<TogetherInHeartProps> = ({
  partner1Name,
  partner2Name,
}) => {
  return (
    <div className="relative flex items-center justify-center py-8">
      {/* Partner 1 avatar */}
      <div className="relative z-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--primary)] border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl">
          {partner1Name[0]}
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md whitespace-nowrap">
          <span className="text-sm text-[var(--foreground)]">{partner1Name}</span>
        </div>
      </div>

      {/* Heart in the middle */}
      <div className="relative z-20 mx-4">
        <div className="relative">
          <Heart className="w-16 h-16 fill-[var(--primary)] text-[var(--primary)] animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs">❤️</span>
          </div>
        </div>
      </div>

      {/* Partner 2 avatar */}
      <div className="relative z-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--pastel-blue)] to-[var(--secondary)] border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl">
          {partner2Name[0]}
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md whitespace-nowrap">
          <span className="text-sm text-[var(--foreground)]">{partner2Name}</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 opacity-20">
        <Heart className="w-8 h-8 fill-[var(--pastel-pink)] text-[var(--pastel-pink)]" />
      </div>
      <div className="absolute bottom-0 right-1/4 opacity-20">
        <Heart className="w-6 h-6 fill-[var(--pastel-lavender)] text-[var(--pastel-lavender)]" />
      </div>
    </div>
  );
};
