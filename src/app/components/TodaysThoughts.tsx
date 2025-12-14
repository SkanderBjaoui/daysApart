import React from 'react';
import { MessageCircleHeart, User } from 'lucide-react';

interface Thought {
  id: string;
  author: 'partner1' | 'partner2';
  content: string;
  timestamp: Date;
  authorName: string;
  avatarColor: string;
}

interface TodaysThoughtsProps {
  thoughts: Thought[];
}

export const TodaysThoughts: React.FC<TodaysThoughtsProps> = ({ thoughts }) => {
  const todayThoughts = thoughts.filter(
    (thought) =>
      new Date(thought.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircleHeart className="w-6 h-6 text-[var(--primary)]" />
        <h3 className="text-[var(--foreground)]">Today's Thoughts</h3>
      </div>

      {todayThoughts.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-[var(--pastel-pink)]/20 to-[var(--pastel-lavender)]/20 rounded-2xl p-6">
            <p className="text-[var(--muted-foreground)]">
              No thoughts shared yet today. 
              <br />
              Check in to share what's on your mind! 💭
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {todayThoughts.map((thought) => (
            <div
              key={thought.id}
              className={`p-4 rounded-2xl ${
                thought.author === 'partner1'
                  ? 'bg-gradient-to-br from-[var(--pastel-pink)]/30 to-[var(--pastel-peach)]/30'
                  : 'bg-gradient-to-br from-[var(--pastel-blue)]/30 to-[var(--pastel-lavender)]/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${thought.avatarColor}`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[var(--foreground)]">{thought.authorName}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {new Date(thought.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[var(--foreground)]">{thought.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
