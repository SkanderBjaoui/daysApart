import { useState, useEffect } from 'react';
import { Calendar, Home, Upload, Image, PenLine } from 'lucide-react';
import { auth, db } from '../supabase_client';
import { CountdownTimer } from './components/CountdownTimer';
import { DailyCheckIn } from './components/DailyCheckIn';
import { CalendarView } from './components/CalendarView';
import { TogetherInHeart } from './components/TogetherInHeart';
import { DecorativeAnimals } from './components/DecorativeAnimals';
import { DailyEntryPage } from './components/DailyEntryPage';
import { MemoryGallery } from './components/MemoryGallery';
import { VirtualHug } from './components/VirtualHug';
import { Confetti } from './components/Confetti';
import { BackgroundAnimals } from './components/BackgroundAnimals';
import { NotificationBadge } from './components/NotificationBadge';
import { MilestoneMessage } from './components/MilestoneMessage';
import { InfiniteMemoriesGrid } from './components/InfiniteMemoriesGrid';

type View = 'home' | 'calendar' | 'upload' | 'daily-entry' | 'memories';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMessage, setConfettiMessage] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentPartner, setCurrentPartner] = useState<'partner1' | 'partner2'>('partner1');
  const [romanticMessage, setRomanticMessage] = useState('');

  const romanticMessages = [
    "Distance means so little when you mean so much 💖",
    "Every mile brings us closer together 💕",
    "Love knows no distance, no borders, no walls 🌍",
    "Together forever, never apart 💑",
    "My heart is yours, no matter the distance ❤️",
    "You're my favorite hello and hardest goodbye 💋",
    "Missing you is my favorite hobby 💌",
    "Love bridges any gap 🌉",
    "You're worth every mile 🏃‍♀️",
    "Closer to you in my dreams every night 🌙"
  ];

  useEffect(() => {
    const randomMessage = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];
    setRomanticMessage(randomMessage);
  }, []);

  const handlePartnerSelect = (partner: 'partner1' | 'partner2') => {
    setCurrentPartner(partner);
    const userData = {
      id: partner === 'partner1' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
      email: partner === 'partner1' ? 'harrathnour43@gmail.com' : 'bjaouiskander15@gmail.com',
      name: partner === 'partner1' ? 'Nour' : 'Skander'
    };
    setCurrentUser(userData);
    const coupleData = { 
      id: '00000000-0000-0000-0000-000000000001', 
      partner1_name: 'Nour', 
      partner2_name: 'Skander',
      target_date: (() => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 45);
        return futureDate.toISOString().split('T')[0];
      })() // 45 days from now
    };
    setCouple(coupleData);
    setShowWelcome(false);
    
    // Load real data after partner selection
    Promise.all([
      loadCouple(coupleData.id),
      loadPhotos(coupleData.id),
      loadThoughts(coupleData.id),
      loadMemories(coupleData.id, userData.id),
      loadNotifications(userData.id)
    ]);
  };
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [couple, setCouple] = useState<any>(null);

  // Database data states
  const [memories, setMemories] = useState<any[]>([]);
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);

  // Load user data and set up real-time subscriptions
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { user } = await auth.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const userProfile = await db.getUserProfile(user.id);
          if (userProfile.data) {
            setCouple(userProfile.data.couples);
            
            // Load real data
            await Promise.all([
              loadCouple(userProfile.data.couple_id),
              loadPhotos(userProfile.data.couple_id),
              loadThoughts(userProfile.data.couple_id),
              loadMemories(userProfile.data.couple_id, user.id),
              loadNotifications(user.id)
            ]);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load functions
  const loadPhotos = async (coupleId: string) => {
    const { data } = await db.getPhotos(coupleId);
    if (data) setPhotos(data);
  };

  const loadThoughts = async (coupleId: string) => {
    const { data } = await db.getThoughts(coupleId);
    if (data) setThoughts(data);
  };

  const loadMemories = async (coupleId: string, userId?: string) => {
    const { data } = await db.getMemories(coupleId, userId);
    if (data) setMemories(data);
  };

  const loadCouple = async (coupleId: string) => {
    console.log('Loading couple data for:', coupleId);
    const { data, error } = await db.getCouple(coupleId);
    console.log('Couple data response:', { data, error });
    
    if (data) {
      setCouple(data);
      console.log('Couple set with target_date:', data.target_date);
    } else {
      // Fallback: create a default couple with target_date (45 days from now)
      console.log('No couple data found, using fallback');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);
      const fallbackCouple = {
        id: coupleId,
        partner1_name: 'Nour',
        partner2_name: 'Skander',
        target_date: futureDate.toISOString().split('T')[0]
      };
      setCouple(fallbackCouple);
      console.log('Fallback couple set with target_date:', fallbackCouple.target_date);
    }
  };

  const loadNotifications = async (userId: string) => {
    const { data } = await db.getNotifications(userId);
    if (data) setNotifications(data.length);
  };

  // Calculate total days and days remaining based on target_date from database
  const totalDays = couple?.target_date 
    ? (() => {
        const days = Math.ceil((new Date(couple.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        console.log('Calculated totalDays:', days, 'from target_date:', couple.target_date);
        return days;
      })()
    : 45;
  const daysRemaining = couple?.target_date 
    ? Math.ceil((new Date(couple.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 45;

  console.log('Current state:', { couple: couple?.target_date, totalDays, daysRemaining });

  const handleCheckIn = async (note: string) => {
    if (!couple || !currentUser) return;
    
    setHasCheckedInToday(true);
    const { data } = await db.createThought(couple.id, currentUser.id, note);
    if (data) {
      setThoughts([data, ...thoughts]);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!couple || !currentUser) return;
    
    const { data } = await db.uploadPhoto(file, couple.id, currentUser.id);
    if (data) {
      setPhotos([data, ...photos]);
    }
  };

  const handleDayClick = (date: string) => {
    console.log('Clicked date:', date);
  };

  const handleSaveEntry = async (entry: any) => {
    // Create fake user if not logged in
    if (!currentUser) {
      const fakeUser = {
        id: currentPartner === 'partner1' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
        email: currentPartner === 'partner1' ? 'harrathnour43@gmail.com' : 'bjaouiskander15@gmail.com'
      };
      setCurrentUser(fakeUser);
      
      const fakeCouple = {
        id: '00000000-0000-0000-0000-000000000001',
        partner1_name: 'Nour',
        partner2_name: 'Skander',
        target_date: new Date(Date.now() + (45 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      };
      setCouple(fakeCouple);
    }
    
    const userToUse = currentUser || {
      id: currentPartner === 'partner1' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002'
    };
    
    const coupleToUse = couple || {
      id: '00000000-0000-0000-0000-000000000001'
    };
    
    const { data, error } = await db.createMemory(coupleToUse.id, {
      ...entry,
      author_id: userToUse.id
    });
    
    console.log('Database response:', { data, error });
    
    if (error) {
      console.error('Database error:', error);
    } else {
      setMemories([data, ...memories]);
      
      // Check for milestones
      const daysPassed = totalDays - daysRemaining;
      if (daysPassed === Math.floor(totalDays / 2)) {
        setConfettiMessage("Halfway Milestone! 🎉");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      }
      
      setCurrentView('memories');
    }
  };

  const handleLike = async (memoryId: string) => {
    if (!currentUser) return;
    
    const isLiked = await db.isMemoryLiked(memoryId, currentUser.id);
    if (isLiked.data) {
      await db.unlikeMemory(memoryId, currentUser.id);
      setMemories(memories.map(m => 
        m.id === memoryId 
          ? { ...m, liked: false, likes: Math.max(0, m.likes - 1) }
          : m
      ));
    } else {
      await db.likeMemory(memoryId, currentUser.id);
      setMemories(memories.map(m => 
        m.id === memoryId 
          ? { ...m, liked: true, likes: m.likes + 1 }
          : m
      ));
    }
    
    // Refresh memories to get updated likers information
    if (couple) {
      await loadMemories(couple.id, currentUser.id);
    }
  };

  const handleVirtualHug = () => {
    console.log('Virtual hug sent! 🤗');
  };

  // Find partner's last entry for today
  const today = new Date().toISOString().split('T')[0];
  const partnerEntry = memories.find(memory => 
    memory.date === today && 
    memory.author_id !== (currentUser?.id || (currentPartner === 'partner1' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002'))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--pastel-cream)] to-[var(--pastel-pink)]/20 flex items-center justify-center">
        <div className="text-[var(--foreground)]">Loading...</div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">💕 Welcome 💕</h1>
          <p className="text-purple-600 mb-8">Choose who you are to continue</p>
          
          <div className="space-y-4">
            <button
              onClick={() => handlePartnerSelect('partner1')}
              className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white py-4 px-6 rounded-full hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-pink-600 font-bold text-xl">
                  N
                </div>
                <span className="text-lg font-medium">Nour</span>
              </div>
            </button>
            
            <button
              onClick={() => handlePartnerSelect('partner2')}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-4 px-6 rounded-full hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-xl">
                  S
                </div>
                <span className="text-lg font-medium">Skander</span>
              </div>
            </button>
          </div>
          
          <div className="mt-8 text-purple-500 text-sm">
            <p>{romanticMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--pastel-cream)] to-[var(--pastel-pink)]/20 relative overflow-hidden">
      {/* Background Animals */}
      <BackgroundAnimals />
      
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
              message="Your partner posted new memories!" 
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
            <TogetherInHeart partner1Name="Nour" partner2Name="Skander" />

            {/* Countdown Timer */}
            <CountdownTimer targetDate={couple?.target_date || new Date(Date.now() + (45 * 24 * 60 * 60 * 1000)).toISOString()} />

            

            {/* Daily Check-In */}
            <DailyCheckIn onCheckIn={handleCheckIn} hasCheckedInToday={hasCheckedInToday} />

            {/* Pinterest-style Infinite Scroll Grid */}
            <InfiniteMemoriesGrid 
              memories={memories}
              hasMore={false}
              loading={loading}
            />

            {/* Encouraging Messages */}
            <div className="bg-gradient-to-r from-[var(--pastel-pink)]/30 to-[var(--pastel-lavender)]/30 rounded-2xl p-6 text-center">
              <p className="text-[var(--foreground)] italic">
                "Our love grows even when we're apart" 💕
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                You've got this, my love! Keep making memories! 🐱
              </p>
            </div>
          </div>
        )}

        {/* Daily Entry View */}
        {currentView === 'daily-entry' && (
          <DailyEntryPage 
            currentUser={currentPartner}
            partnerEntry={partnerEntry}
            onSave={handleSaveEntry}
            onPhotoUpload={async (file: File) => {
              if (!couple || !currentUser) return '';
              const { data } = await db.uploadPhoto(file, couple.id, currentUser.id);
              return data?.photo || '';
            }}
          />
        )}

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <div>
            <CalendarView 
              memories={memories} 
              totalDays={totalDays} 
              onDayClick={handleDayClick}
              targetDate={couple?.target_date}
            />
          </div>
        )}

        {/* Memory Gallery View */}
        {currentView === 'memories' && (
          <MemoryGallery 
            memories={memories} 
            onLike={handleLike}
            currentUser={currentUser}
            targetDate={couple?.target_date}
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
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="bg-[var(--primary)] hover:bg-[var(--pastel-pink)] text-white px-8 py-3 rounded-full transition-colors"
            >
              Choose Files
            </button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />
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
