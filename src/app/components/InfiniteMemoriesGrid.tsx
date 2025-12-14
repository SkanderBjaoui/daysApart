import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Calendar, User } from 'lucide-react';

interface Memory {
  id: string;
  date: string;
  photo?: string;
  text: string;
  stickers: string[];
  mood: string;
  author_id: string;
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
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    setVisibleMemories(prev => prev + 12);
    onLoadMore?.();
  }, [loading, hasMore, onLoadMore]);

  // Group memories by date
  const memoriesByDate = memories.reduce((acc, memory) => {
    if (!acc[memory.date]) {
      acc[memory.date] = [];
    }
    acc[memory.date].push(memory);
    return acc;
  }, {} as Record<string, Memory[]>);

  const sortedDates = Object.keys(memoriesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Pinterest-style masonry layout
  const createMasonryColumns = (dayMemories: Memory[]) => {
    const columnArrays: Memory[][] = Array.from({ length: columns }, () => []);
    
    dayMemories.forEach((memory, index) => {
      const columnIndex = index % columns;
      columnArrays[columnIndex].push(memory);
    });

    return columnArrays;
  };

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
      {sortedDates.slice(0, Math.ceil(visibleMemories / 3)).map((date) => {
        const dayMemories = memoriesByDate[date];
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
            <div className={`grid grid-cols-${columns} gap-4`}>
              {createMasonryColumns(dayMemories).map((column, colIndex) => (
                <div key={colIndex} className="space-y-4">
                  {column.map((memory) => (
                    <div
                      key={memory.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
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
                  ))}
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
