import React, { useState, useCallback } from 'react';
import { Heart, Calendar } from 'lucide-react';

interface Memory {
  id: string;
  date: string;
  photo?: string;
  text: string;
  stickers: string[];
  mood: string;
  author_id: string;
  created_at?: string;
  kind?: string;
  users: {
    name: string;
    partner_role: string;
  };
  likes: number;
  liked: boolean;
}

interface InfiniteMemoriesGridProps {
  memories: Memory[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export const InfiniteMemoriesGrid: React.FC<InfiniteMemoriesGridProps> = ({
  memories,
  onLoadMore,
  hasMore = false,
  loading = false,
}) => {
  const [visibleMemories, setVisibleMemories] = useState(12);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    setVisibleMemories(prev => prev + 12);
    onLoadMore?.();
  }, [loading, hasMore, onLoadMore]);

  const getSortTime = (memory: Memory) => {
    const createdAt = memory.created_at ? new Date(memory.created_at).getTime() : null;
    if (createdAt && !Number.isNaN(createdAt)) return createdAt;
    const dateOnly = new Date(memory.date).getTime();
    return Number.isNaN(dateOnly) ? 0 : dateOnly;
  };

  const sortedMemories = [...memories].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return getSortTime(b) - getSortTime(a);
  });

  const visibleList = hasMore ? sortedMemories.slice(0, visibleMemories) : sortedMemories;

  // Group visible memories by date
  const memoriesByDate = visibleList.reduce((acc, memory) => {
    if (!acc[memory.date]) {
      acc[memory.date] = [];
    }
    acc[memory.date].push(memory);
    return acc;
  }, {} as Record<string, Memory[]>);

  const sortedDates = Object.keys(memoriesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const getAuthorName = (authorId: string) => {
    return authorId === '00000000-0000-0000-0000-000000000001' ? 'Nour' : 'Skander';
  };

  const getAuthorColor = (authorId: string) => {
    return authorId === '00000000-0000-0000-0000-000000000001' 
      ? 'bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--primary)]' 
      : 'bg-gradient-to-br from-[var(--pastel-blue)] to-[var(--secondary)]';
  };

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => {
        const dayMemories = [...memoriesByDate[date]].sort((a, b) => getSortTime(b) - getSortTime(a));
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });

        return (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[var(--pastel-pink)] to-[var(--pastel-lavender)] text-white px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex gap-1">
                {dayMemories.map((memory, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${getAuthorColor(memory.author_id)}`}
                  >
                    {getAuthorName(memory.author_id).charAt(0)}
                  </div>
                ))}
              </div>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
              {dayMemories.map((memory) => (
                <div key={memory.id} className="break-inside-avoid mb-4">
                  <div
                    className={`rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group w-full inline-block ${
                      memory.kind === 'hug'
                        ? 'bg-gradient-to-br from-[var(--pastel-pink)]/30 via-white to-[var(--pastel-lavender)]/30 border border-[var(--primary)]/20'
                        : memory.kind === 'daily_checkin'
                          ? 'bg-gradient-to-br from-[var(--pastel-mint)]/35 via-white to-[var(--pastel-blue)]/25 border border-[var(--secondary)]/20'
                        : 'bg-white'
                    }`}
                  >
                    {/* Photo */}
                    {memory.photo && (
                      <div className="relative">
                        <img
                          src={memory.photo}
                          alt="Memory"
                          className="w-full object-cover"
                          style={{
                            maxHeight: memory.text.length > 100 ? '200px' : '300px'
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${getAuthorColor(memory.author_id)}`}>
                            {getAuthorName(memory.author_id).charAt(0)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      {/* Mood and Stickers */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{memory.mood}</span>
                          {memory.kind === 'hug' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/70 text-[var(--primary)]">
                              Virtual Hug
                            </span>
                          )}
                          {memory.kind === 'daily_checkin' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/70 text-[var(--secondary)]">
                              Check-in
                            </span>
                          )}
                          <div className="flex gap-1">
                            {memory.stickers.map((sticker, idx) => (
                              <span key={idx} className="text-lg">{sticker}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                          <Heart className={`w-4 h-4 ${memory.liked ? 'fill-red-500 text-red-500' : ''}`} />
                          <span className="text-sm">{memory.likes}</span>
                        </div>
                      </div>

                      {/* Text */}
                      <p className="text-[var(--foreground)] mb-3 line-clamp-3">
                        {memory.text}
                      </p>

                      {/* Author and Date */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getAuthorColor(memory.author_id)}`}>
                            {getAuthorName(memory.author_id).charAt(0)}
                          </div>
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {getAuthorName(memory.author_id)}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--pastel-pink)] text-white px-8 py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Memories'}
          </button>
        </div>
      )}
    </div>
  );
};
