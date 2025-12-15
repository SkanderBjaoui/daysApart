import React, { useState, useEffect } from 'react';
import { Calendar, Home, Upload, Image, PenLine } from 'lucide-react';
import { supabase, auth, db } from '../supabase_client';
import { CountdownTimer } from './components/CountdownTimer';
import { DailyCheckIn } from './components/DailyCheckIn';
import { PhotoGallery } from './components/PhotoGallery';
import { TodaysThoughts } from './components/TodaysThoughts';
import { CalendarView } from './components/CalendarView';
import { TogetherInHeart } from './components/TogetherInHeart';
import { DecorativeAnimals } from './components/DecorativeAnimals';
import { DailyEntryPage } from './components/DailyEntryPage';
import { MemoryGallery } from './components/MemoryGallery';
import { VirtualHug } from './components/VirtualHug';
import { Confetti } from './components/Confetti';
import { NotificationBadge } from './components/NotificationBadge';
import { MilestoneMessage } from './components/MilestoneMessage';

type View = 'home' | 'calendar' | 'upload' | 'daily-entry' | 'memories';

interface Photo {
  id: string;
  url: string;
  uploadedBy: 'partner1' | 'partner2';
  timestamp: Date;
}

interface Thought {
  id: string;
  author: 'partner1' | 'partner2';
  content: string;
  timestamp: Date;
  authorName: string;
  avatarColor: string;
}

interface Entry {
  date: string;
  photo?: string;
  text: string;
  stickers: string[];
  mood: string;
  author: 'partner1' | 'partner2';
}

interface Memory {
  id: string;
  date: string;
  photo?: string;
  text: string;
  stickers: string[];
  mood: string;
  author: 'partner1' | 'partner2';
  authorName: string;
  likes: number;
  liked: boolean;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMessage, setConfettiMessage] = useState('');
  const [notifications, setNotifications] = useState(2);

  // Mock data
  const [photos] = useState<Photo[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
      uploadedBy: 'partner1',
      timestamp: new Date(),
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
      uploadedBy: 'partner2',
      timestamp: new Date(),
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
      uploadedBy: 'partner1',
      timestamp: new Date(),
    },
  ]);

  const [thoughts, setThoughts] = useState<Thought[]>([
    {
      id: '1',
      author: 'partner1',
      content: "Missing you so much today! Can't wait to see you again 💕",
      timestamp: new Date(),
      authorName: 'Alex',
      avatarColor: 'bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--primary)]',
    },
  ]);

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600',
      text: "Missing you so much today! Can't wait to see you again. Thinking about all our favorite memories together.",
      stickers: ['🐱', '💕', '🌟'],
      mood: '🥰',
      author: 'partner1',
      authorName: 'Alex',
      likes: 1,
      liked: false,
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      photo: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600',
      text: "Had an amazing day but wish you were here to share it with me. Only a few more weeks!",
      stickers: ['🐰', '💖'],
      mood: '😊',
      author: 'partner2',
      authorName: 'Blake',
      likes: 2,
      liked: true,
    },
  ]);

  // Calculate target date (45 days from now for 1.5 months)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 45);
  const totalDays = 45;
  const daysRemaining = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleCheckIn = (note: string) => {
    setHasCheckedInToday(true);
    const newThought: Thought = {
      id: Date.now().toString(),
      author: 'partner1',
      content: note,
      timestamp: new Date(),
      authorName: 'Alex',
      avatarColor: 'bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--primary)]',
    };
    setThoughts([...thoughts, newThought]);
  };

  const handlePhotoUpload = () => {
    alert('Photo upload feature - In a real app, this would open a file picker!');
  };

  const handleDayClick = (_date: string) => {
    // In a real app, this would show the entries for that day
  };

  const handleSaveEntry = (entry: Entry) => {
    const newMemory: Memory = {
      id: Date.now().toString(),
      ...entry,
      authorName: 'Alex',
      likes: 0,
      liked: false,
    };
    setMemories([newMemory, ...memories]);
    
    // Check for milestones
    const daysPassed = totalDays - daysRemaining;
    if (daysPassed === Math.floor(totalDays / 2)) {
      setConfettiMessage("Halfway Milestone! 🎉");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
    
    setCurrentView('memories');
  };

  const handleLike = (id: string) => {
    setMemories(memories.map(m => 
      m.id === id 
        ? { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 }
        : m
    ));
  };

  const handleVirtualHug = () => {
  };

  // Sample partner entry for daily entry page
  const partnerEntry: Entry | undefined = undefined; // Set to undefined to show "not posted yet" state

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--pastel-cream)] to-[var(--pastel-pink)]/20 relative overflow-hidden">
      {/* Decorative animals */}
      <DecorativeAnimals />

      {/* Milestone Messages */}
      <MilestoneMessage daysRemaining={daysRemaining} totalDays={totalDays} />

      {/* Confetti */}
      <Confetti trigger={showConfetti} message={confettiMessage} />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl text-[var(--primary)]">
              Together in Heart 💕
            </h1>
            <NotificationBadge 
              count={notifications} 
              message="Your partner posted 2 new memories!" 
            />
          </div>
          <p className="text-[var(--muted-foreground)]">
            Distance means so little when you mean so much
          </p>
          <p className="text-sm text-[var(--primary)] mt-2">
            Only {daysRemaining} days until I'm in your arms again! 💖
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              currentView === 'home'
                ? 'bg-[var(--primary)] text-white shadow-lg'
                : 'bg-white text-[var(--foreground)] hover:bg-[var(--pastel-pink)]/20'
            }`}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            onClick={() => setCurrentView('daily-entry')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              currentView === 'daily-entry'
                ? 'bg-[var(--primary)] text-white shadow-lg'
                : 'bg-white text-[var(--foreground)] hover:bg-[var(--pastel-pink)]/20'
            }`}
          >
            <PenLine className="w-5 h-5" />
            Daily Entry
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              currentView === 'calendar'
                ? 'bg-[var(--primary)] text-white shadow-lg'
                : 'bg-white text-[var(--foreground)] hover:bg-[var(--pastel-pink)]/20'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Calendar
          </button>
          <button
            onClick={() => {
              setCurrentView('memories');
              setNotifications(0);
            }}
            className={`relative flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              currentView === 'memories'
                ? 'bg-[var(--primary)] text-white shadow-lg'
                : 'bg-white text-[var(--foreground)] hover:bg-[var(--pastel-pink)]/20'
            }`}
          >
            <Image className="w-5 h-5" />
            Memories
            {notifications > 0 && currentView !== 'memories' && (
              <div className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notifications}
              </div>
            )}
          </button>
        </nav>

        {/* Home View */}
        {currentView === 'home' && (
          <div className="space-y-8">
            {/* Together in Heart */}
            <TogetherInHeart partner1Name="Alex" partner2Name="Blake" />

            {/* Countdown Timer */}
            <CountdownTimer targetDate={targetDate} />

            {/* Virtual Hug Button */}
            <div className="flex justify-center">
              <VirtualHug onSend={handleVirtualHug} />
            </div>

            {/* Daily Check-In */}
            <DailyCheckIn onCheckIn={handleCheckIn} hasCheckedInToday={hasCheckedInToday} />

            {/* Two column layout for tablet/desktop */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Photo Gallery */}
              <PhotoGallery photos={photos} onUpload={handlePhotoUpload} />

              {/* Today's Thoughts */}
              <TodaysThoughts thoughts={thoughts} />
            </div>

            {/* Encouraging Messages */}
            <div className="bg-gradient-to-r from-[var(--pastel-pink)]/30 to-[var(--pastel-lavender)]/30 rounded-2xl p-6 text-center">
              <p className="text-[var(--foreground)] italic">
                "Our love grows even when we're apart" 💕
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                You've got this, kitten! Keep making memories! 🐱
              </p>
            </div>
          </div>
        )}

        {/* Daily Entry View */}
        {currentView === 'daily-entry' && (
          <DailyEntryPage 
            currentUser="partner1" 
            partnerEntry={partnerEntry}
            onSave={handleSaveEntry}
          />
        )}

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <div>
            <CalendarView contributions={[]} totalDays={totalDays} onDayClick={handleDayClick} />
          </div>
        )}

        {/* Memory Gallery View */}
        {currentView === 'memories' && (
          <MemoryGallery 
            memories={memories} 
            totalDays={totalDays}
            onLike={handleLike}
          />
        )}

        {/* Upload View */}
        {currentView === 'upload' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <Upload className="w-16 h-16 text-[var(--primary)] mx-auto mb-4" />
            <h2 className="text-[var(--foreground)] mb-4">Upload Photos & Memories</h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              Share your favorite moments with your loved one
            </p>
            <button
              onClick={handlePhotoUpload}
              className="bg-[var(--primary)] hover:bg-[var(--pastel-pink)] text-white px-8 py-3 rounded-full transition-colors"
            >
              Choose Files
            </button>
          </div>
        )}
      </div>

      {/* Floating hearts background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl opacity-5 animate-pulse">💗</div>
        <div className="absolute top-40 right-20 text-5xl opacity-5 animate-pulse" style={{ animationDelay: '1s' }}>
          💕
        </div>
        <div className="absolute bottom-20 left-1/4 text-7xl opacity-5 animate-pulse" style={{ animationDelay: '2s' }}>
          💖
        </div>
        <div className="absolute bottom-40 right-1/3 text-4xl opacity-5 animate-pulse" style={{ animationDelay: '1.5s' }}>
          💝
        </div>
        <div className="absolute top-1/3 right-10 text-5xl opacity-5 animate-pulse" style={{ animationDelay: '0.5s' }}>
          💗
        </div>
      </div>
    </div>
  );
}