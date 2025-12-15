import React, { useState } from 'react';
import { Heart, Calendar, X, Filter, Clock, TrendingUp } from 'lucide-react';

interface Memory {
  id: string;
  date: string;
  photo?: string | string[];
  text: string;
  stickers: string[];
  mood: string;
  author_id: string;
  created_at?: string;
  users: {
    name: string;
    partner_role: string;
  };
  likes: number;
  liked: boolean;
  likers?: Array<{
    name: string;
    partner_role: string;
  }>;
}

interface MemoryGalleryProps {
  memories: Memory[];
  onLike: (id: string) => void;
  currentUser?: { id: string, name: string };
  targetDate?: string; // target_date from couples table
}

type FilterType = 'all' | 'partner1' | 'partner2';
type ViewType = 'grid' | 'timeline';

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({
  memories,
  onLike,
  currentUser,
  targetDate,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Helper function to generate liked by text
  const getLikedByText = (memory: Memory, currentUser?: { id: string, name: string }) => {
    if (!memory.likers || memory.likers.length === 0) return '';
    
    const likerNames = memory.likers.map(liker => liker.name);
    
    if (memory.liked && currentUser && likerNames.length === 1) {
      return 'Liked by you';
    } else if (memory.liked && currentUser && likerNames.length === 2) {
      const otherLiker = likerNames.find(name => name !== currentUser.name);
      return `Liked by you and ${otherLiker}`;
    } else if (!memory.liked && likerNames.length === 1) {
      return `Liked by ${likerNames[0]}`;
    } else if (likerNames.length === 2) {
      return `Liked by ${likerNames.join(' and ')}`;
    } else if (likerNames.length > 2) {
      return `Liked by ${likerNames.length} people`;
    }
    
    return '';
  };

  const sortedMemories = [...memories].sort((a, b) => {
    const aTime = new Date((a.created_at || a.date) as string).getTime();
    const bTime = new Date((b.created_at || b.date) as string).getTime();
    return bTime - aTime;
  });

  const filteredMemories = sortedMemories.filter((memory) => {
    if (filter === 'all') return true;
    if (filter === 'partner1') return memory.author_id === '00000000-0000-0000-0000-000000000001';
    if (filter === 'partner2') return memory.author_id === '00000000-0000-0000-0000-000000000002';
    return true;
  });

  const documentedDays = new Set(memories.map(m => m.date)).size;
  
  // Calculate total journey duration from start date to target date from database
  const startDate = memories.length > 0 
    ? new Date(Math.min(...memories.map(m => new Date(m.date).getTime())))
    : new Date();
  const journeyTargetDate = targetDate ? new Date(targetDate) : new Date(startDate);
  const totalJourneyDays = Math.ceil((journeyTargetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const completionPercentage = totalJourneyDays > 0 
    ? Math.round((documentedDays / totalJourneyDays) * 100)
    : 0;

  const getDecorativeFrame = (index: number) => {
    const frames = ['🐱', '🐰', '🐼', '🐻'];
    if (index % 5 === 0) return frames[index % frames.length];
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-[var(--pastel-pink)] via-[var(--pastel-lavender)] to-[var(--pastel-blue)] rounded-2xl p-6 shadow-lg text-white">
        <h2 className="mb-4 text-center flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 fill-white" />
          Our Memories
          <Heart className="w-6 h-6 fill-white" />
        </h2>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl mb-1">{documentedDays}</div>
            <div className="text-sm">Days Documented</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl mb-1">{memories.length}</div>
            <div className="text-sm">Total Memories</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl mb-1">{completionPercentage}%</div>
            <div className="text-sm">Journey Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-white/80 mb-2">
            <span>Progress</span>
            <span>{documentedDays}/{totalJourneyDays} days</span>
          </div>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'bg-gray-100 text-[var(--foreground)] hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              All Posts
            </button>
            <button
              onClick={() => setFilter('partner1')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                filter === 'partner1'
                  ? 'bg-gradient-to-r from-[var(--pastel-pink)] to-[var(--primary)] text-white shadow-lg'
                  : 'bg-gray-100 text-[var(--foreground)] hover:bg-gray-200'
              }`}
            >
              Nour's Posts
            </button>
            <button
              onClick={() => setFilter('partner2')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                filter === 'partner2'
                  ? 'bg-gradient-to-r from-[var(--pastel-blue)] to-[var(--secondary)] text-white shadow-lg'
                  : 'bg-gray-100 text-[var(--foreground)] hover:bg-gray-200'
              }`}
            >
              Skander's Posts
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setViewType('grid')}
              className={`px-4 py-2 rounded-full transition-all ${
                viewType === 'grid'
                  ? 'bg-white shadow-md'
                  : 'text-[var(--muted-foreground)]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('timeline')}
              className={`px-4 py-2 rounded-full transition-all ${
                viewType === 'timeline'
                  ? 'bg-white shadow-md'
                  : 'text-[var(--muted-foreground)]'
              }`}
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((memory, index) => {
            const decorativeAnimal = getDecorativeFrame(index);
            const isPartner1 = memory.author_id === '00000000-0000-0000-0000-000000000001';
            
            return (
              <div
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-105 transition-all group relative"
              >
                {/* Decorative Animal Frame */}
                {decorativeAnimal && (
                  <div className="absolute -top-2 -right-2 z-10 text-4xl bg-white rounded-full p-2 shadow-lg animate-bounce">
                    {decorativeAnimal}
                  </div>
                )}

                {/* Photos */}
                {memory.photo ? (
                  <div className="relative h-48 overflow-hidden">
                    {(Array.isArray(memory.photo) ? memory.photo : [memory.photo]).map((photoUrl, idx) => (
                      <div key={idx} className={idx > 0 ? 'mt-2' : ''}>
                        <img
                          src={photoUrl}
                          alt={`Memory ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 rounded-lg"
                        />
                      </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-2 right-2 text-3xl">
                      {memory.mood}
                    </div>
                  </div>
                ) : (
                  <div className={`h-48 bg-gradient-to-br ${
                    isPartner1
                      ? 'from-[var(--pastel-pink)] to-[var(--primary)]'
                      : 'from-[var(--pastel-blue)] to-[var(--secondary)]'
                  } flex items-center justify-center`}>
                    <div className="text-6xl">{memory.mood}</div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Author and Date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                        isPartner1
                          ? 'from-[var(--pastel-pink)] to-[var(--primary)]'
                          : 'from-[var(--pastel-blue)] to-[var(--secondary)]'
                      } flex items-center justify-center text-white text-sm`}>
                        {memory.users.name[0]}
                      </div>
                      <div>
                        <p className="text-sm text-[var(--foreground)]">{memory.users.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Calendar className="w-3 h-3" />
                      {new Date(memory.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Text Preview */}
                  <p className="text-[var(--foreground)] text-sm mb-3 line-clamp-3">
                    {memory.text}
                  </p>

                  {/* Stickers */}
                  {memory.stickers.length > 0 && (
                    <div className="flex gap-1 mb-3">
                      {memory.stickers.slice(0, 5).map((sticker, i) => (
                        <span key={i} className="text-lg">{sticker}</span>
                      ))}
                    </div>
                  )}

                  {/* Like Button */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(memory.id);
                      }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all ${
                          memory.liked
                            ? 'fill-[var(--primary)] text-[var(--primary)] scale-110'
                            : 'text-gray-400 hover:text-[var(--primary)]'
                        }`}
                      />
                      <span className="text-[var(--muted-foreground)]">
                        {memory.likes > 0 && memory.likes}
                      </span>
                    </button>
                    
                    {memory.likes > 0 && (
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {getLikedByText(memory, currentUser)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {viewType === 'timeline' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="space-y-6">
            {filteredMemories.map((memory, index) => {
              const isPartner1 = memory.author_id === '00000000-0000-0000-0000-000000000001';
              
              return (
                <div
                  key={memory.id}
                  className="flex gap-4 flex-row-reverse"
                >
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      isPartner1
                        ? 'from-[var(--pastel-pink)] to-[var(--primary)]'
                        : 'from-[var(--pastel-blue)] to-[var(--secondary)]'
                    } flex items-center justify-center text-white shadow-lg`}>
                      {memory.users.name[0]}
                    </div>
                    {index < filteredMemories.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-[var(--pastel-pink)] to-[var(--pastel-blue)] my-2" />
                    )}
                  </div>

                  {/* Content Card */}
                  <div
                    onClick={() => setSelectedMemory(memory)}
                    className="flex-1 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer min-h-[200px]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {new Date(memory.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-2xl">{memory.mood}</span>
                    </div>

                    {(Array.isArray(memory.photo) ? memory.photo : memory.photo ? [memory.photo] : []).map((photoUrl, idx) => (
                      <img
                        key={idx}
                        src={photoUrl}
                        alt={`Memory ${idx + 1}`}
                        className="w-full h-64 object-cover rounded-xl mb-3"
                      />
                    ))}

                    <p className="text-[var(--foreground)] mb-2">{memory.text}</p>

                    {memory.stickers.length > 0 && (
                      <div className="flex gap-2">
                        {memory.stickers.map((sticker, i) => (
                          <span key={i} className="text-xl">{sticker}</span>
                        ))}
                      </div>
                    )}

                    {/* Like Button and Liked By */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLike(memory.id);
                        }}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                          memory.liked
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${memory.liked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{memory.likes}</span>
                      </button>
                      
                      {memory.likes > 0 && (
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {getLikedByText(memory, currentUser)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMemories.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-[var(--foreground)] mb-2">No memories yet</h3>
          <p className="text-[var(--muted-foreground)]">
            Start creating beautiful memories together!
          </p>
        </div>
      )}

      {/* Modal for Full Memory */}
      {selectedMemory && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMemory(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                  selectedMemory.author_id === '00000000-0000-0000-0000-000000000001'
                    ? 'from-[var(--pastel-pink)] to-[var(--primary)]'
                    : 'from-[var(--pastel-blue)] to-[var(--secondary)]'
                } flex items-center justify-center text-white`}>
                  {selectedMemory.users.name[0]}
                </div>
                <div>
                  <p className="text-[var(--foreground)]">{selectedMemory.users.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {new Date(selectedMemory.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-4xl">{selectedMemory.mood}</span>
                <span className="text-[var(--muted-foreground)]">Feeling</span>
              </div>

              {(Array.isArray(selectedMemory.photo) ? selectedMemory.photo : selectedMemory.photo ? [selectedMemory.photo] : []).map((photoUrl, idx) => (
                <img
                  key={idx}
                  src={photoUrl}
                  alt={`Memory ${idx + 1}`}
                  className="w-full rounded-2xl mb-6 shadow-lg"
                />
              ))}

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 mb-6">
                <p className="text-[var(--foreground)] whitespace-pre-wrap">
                  {selectedMemory.text}
                </p>
              </div>

              {selectedMemory.stickers.length > 0 && (
                <div className="flex gap-3 mb-6">
                  {selectedMemory.stickers.map((sticker, i) => (
                    <span
                      key={i}
                      className="text-3xl animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {sticker}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(selectedMemory.id);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--pastel-pink)] hover:shadow-lg text-white py-3 rounded-full transition-all"
              >
                <Heart
                  className={`w-5 h-5 ${
                    selectedMemory.liked ? 'fill-white' : ''
                  }`}
                />
                {selectedMemory.liked ? 'Loved!' : 'Send Love'} 
                {selectedMemory.likes > 0 && `(${selectedMemory.likes})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
