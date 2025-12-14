import { useState, useEffect, useMemo } from 'react';
import { Calendar, Home, Upload, Image, PenLine, Heart, Sparkles } from 'lucide-react';
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
  const [virtualHugs, setVirtualHugs] = useState<any[]>([]);
  const [homeFilterDate, setHomeFilterDate] = useState('');
  const [homeFilterType, setHomeFilterType] = useState<'all' | 'daily_checkin' | 'entry' | 'hug'>('all');
  const [homeFilterPerson, setHomeFilterPerson] = useState<'all' | 'nour' | 'skander'>('all');
  const [welcomeHover, setWelcomeHover] = useState<'partner1' | 'partner2' | null>(null);
  const [dayDetailModalDate, setDayDetailModalDate] = useState<string | null>(null);

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
      loadMemories(coupleData.id, userData.id),
      loadCheckIns(coupleData.id),
      loadNotifications(userData.id)
    ]);
  };
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [couple, setCouple] = useState<any>(null);

  useEffect(() => {
    if (!couple?.id) return;
    loadHugs(couple.id);
  }, [couple?.id]);

  // Database data states
  const [memories, setMemories] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);

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
              loadMemories(userProfile.data.couple_id, user.id),
              loadCheckIns(userProfile.data.couple_id),
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

  const loadMemories = async (coupleId: string, userId?: string) => {
    const { data } = await db.getMemories(coupleId, userId);
    if (data) setMemories(data);
  };

  const loadCheckIns = async (coupleId: string) => {
    const { data } = await db.getCheckIns(coupleId);
    if (data) setCheckIns(data);
  };

  const loadHugs = async (coupleId: string) => {
    const { data, error } = await db.getHugs(coupleId);
    if (!error && data) {
      const mapped = data.map((hug: any) => {
        const createdAt = hug.created_at || new Date().toISOString();
        return {
          id: hug.id,
          date: new Date(createdAt).toISOString().split('T')[0],
          photo: undefined,
          text: hug.message,
          stickers: [],
          mood: hug.mood || '🤗',
          author_id: hug.sender_id,
          users: hug.users || {
            name: hug.sender_id === '00000000-0000-0000-0000-000000000001' ? 'Nour' : 'Skander',
            partner_role: hug.sender_id === '00000000-0000-0000-0000-000000000001' ? 'partner1' : 'partner2',
          },
          likes: 0,
          liked: false,
          created_at: createdAt,
          kind: 'hug',
        };
      });

      setVirtualHugs(mapped);
      const hugsKey = `virtualHugs:${coupleId || 'default'}`;
      try {
        window.localStorage.setItem(hugsKey, JSON.stringify(mapped));
      } catch {
        // ignore
      }
      return;
    }

    const hugsKey = `virtualHugs:${coupleId || 'default'}`;
    try {
      const raw = window.localStorage.getItem(hugsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setVirtualHugs(parsed);
        } else {
          setVirtualHugs([]);
        }
      } else {
        setVirtualHugs([]);
      }
    } catch {
      setVirtualHugs([]);
    }
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

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRow = checkIns.find((c: any) => c.date === todayStr);
    const checked = currentPartner === 'partner1'
      ? !!todayRow?.partner1_note
      : !!todayRow?.partner2_note;
    setHasCheckedInToday(checked);
  }, [checkIns, currentPartner]);

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

    const todayStr = new Date().toISOString().split('T')[0];
    const existing = checkIns.find((c: any) => c.date === todayStr);
    const nextCheckIn = {
      date: todayStr,
      partner1_note: existing?.partner1_note ?? null,
      partner1_avatar: existing?.partner1_avatar ?? 'N',
      partner2_note: existing?.partner2_note ?? null,
      partner2_avatar: existing?.partner2_avatar ?? 'S',
    } as any;

    if (currentPartner === 'partner1') {
      nextCheckIn.partner1_note = note;
      nextCheckIn.partner1_avatar = 'N';
    } else {
      nextCheckIn.partner2_note = note;
      nextCheckIn.partner2_avatar = 'S';
    }

    const { data, error } = await db.createCheckIn(couple.id, nextCheckIn);
    if (error) {
      console.error('Error saving check-in:', error);
      return;
    }

    if (data) {
      const next = [data, ...checkIns.filter((c: any) => c.id !== data.id && c.date !== todayStr)];
      setCheckIns(next);
      setHasCheckedInToday(true);
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
    setDayDetailModalDate(date);
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

  const handleVirtualHug = async () => {
    console.log('Virtual hug sent! 🤗');

    if (!couple?.id) return;

    const partner1Name = couple?.partner1_name || 'Partner 1';
    const partner2Name = couple?.partner2_name || 'Partner 2';

    const senderId = currentUser?.id || (currentPartner === 'partner1'
      ? '00000000-0000-0000-0000-000000000001'
      : '00000000-0000-0000-0000-000000000002');

    const senderName = currentUser?.name
      || currentUser?.user_metadata?.name
      || (senderId === '00000000-0000-0000-0000-000000000001' ? partner1Name : partner2Name);

    const receiverName = senderId === '00000000-0000-0000-0000-000000000001'
      ? partner2Name
      : partner1Name;

    const templates = [
      `🤗 ${senderName} just sent a virtual hug to ${receiverName}. Love travels faster than distance 💕`,
      `💌 Hug delivery: from ${senderName} to ${receiverName}. Please accept this squeeze with extra love 🥰`,
      `🫶 Hug alert! ${senderName} wrapped ${receiverName} in a cozy cuddle (even from miles away) ❤️`,
      `🌙 Night hug incoming! ${senderName} is hugging ${receiverName} under the same moon ✨`,
      `🌸 Soft hug vibes: ${senderName} → ${receiverName}. Missing you, loving you, always 💗`,
      `🐱 Cat-approved hug! ${senderName} sends ${receiverName} a purrfect cuddle 🥹`,
      `🐰 Bunny-tight hug! ${senderName} is holding ${receiverName} close in spirit �`,
      `💖 Heart squeeze from ${senderName} to ${receiverName}. Just a reminder: you're my home 💞`,
      `🔥 Warm hug: ${senderName} + ${receiverName}. Distance can't compete with this love 🥰`,
      `🎀 Ribbon-wrapped hug from ${senderName} to ${receiverName}. Unwrap slowly and smile 😘`,
      `🫂 Big squeeze! ${senderName} is hugging ${receiverName} so tight the miles are jealous 💫`,
      `🍯 Sweet hug drop: ${senderName} sent ${receiverName} a honey-soft cuddle 🌼`,
      `🌈 Comfort hug from ${senderName} to ${receiverName}. Better days, together, soon 💗`,
      `📦 Express delivery: a hug from ${senderName} to ${receiverName}. Signed with kisses 💋`,
      `🧸 Teddy hug time! ${senderName} wants ${receiverName} to feel safe, loved, and held 🤍`,
      `💞 ${senderName} is hugging ${receiverName} right now. Close your eyes and feel it ✨`,
    ];
    const message = templates[Math.floor(Math.random() * templates.length)];

    const { data, error } = await db.createHug(couple.id, senderId, message, '🤗');
    if (error || !data) {
      console.error('Error saving hug:', error);
      return;
    }

    const createdAt = data.created_at || new Date().toISOString();
    const hugEntry = {
      id: data.id,
      date: new Date(createdAt).toISOString().split('T')[0],
      photo: undefined,
      text: data.message,
      stickers: [],
      mood: data.mood || '🤗',
      author_id: data.sender_id,
      users: data.users || {
        name: data.sender_id === '00000000-0000-0000-0000-000000000001' ? 'Nour' : 'Skander',
        partner_role: data.sender_id === '00000000-0000-0000-0000-000000000001' ? 'partner1' : 'partner2',
      },
      likes: 0,
      liked: false,
      created_at: createdAt,
      kind: 'hug',
    };

    const nextHugs = [hugEntry, ...virtualHugs];
    setVirtualHugs(nextHugs);
  };

  // Find partner's last entry for today
  const today = new Date().toISOString().split('T')[0];
  const partnerEntry = memories.find(memory => 
    memory.date === today && 
    memory.author_id !== (currentUser?.id || (currentPartner === 'partner1' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002'))
  );

  const dailyCheckInItems = (checkIns || []).flatMap((row: any) => {
    const createdAt = row.created_at || new Date().toISOString();
    const dateStr = row.date;
    const items: any[] = [];

    if (row.partner1_note) {
      items.push({
        id: `${row.id}:partner1`,
        date: dateStr,
        photo: undefined,
        text: row.partner1_note,
        stickers: [],
        mood: '💖',
        author_id: '00000000-0000-0000-0000-000000000001',
        users: { name: 'Nour', partner_role: 'partner1' },
        likes: 0,
        liked: false,
        created_at: createdAt,
        kind: 'daily_checkin',
      });
    }

    if (row.partner2_note) {
      items.push({
        id: `${row.id}:partner2`,
        date: dateStr,
        photo: undefined,
        text: row.partner2_note,
        stickers: [],
        mood: '💙',
        author_id: '00000000-0000-0000-0000-000000000002',
        users: { name: 'Skander', partner_role: 'partner2' },
        likes: 0,
        liked: false,
        created_at: createdAt,
        kind: 'daily_checkin',
      });
    }

    return items;
  });

  const homeFeedItems = [...virtualHugs, ...dailyCheckInItems, ...memories];

  const filteredHomeFeedItems = useMemo(() => {
    const normalizeType = (item: any) => {
      if (item?.kind === 'hug') return 'hug';
      if (item?.kind === 'daily_checkin') return 'daily_checkin';
      return 'entry';
    };

    const matchesPerson = (item: any) => {
      if (homeFilterPerson === 'all') return true;
      const name = String(item?.users?.name || '').toLowerCase();
      if (name) return name.includes(homeFilterPerson);
      if (homeFilterPerson === 'nour') return item?.author_id === '00000000-0000-0000-0000-000000000001';
      return item?.author_id === '00000000-0000-0000-0000-000000000002';
    };

    return (homeFeedItems || []).filter((item: any) => {
      if (homeFilterDate && item?.date !== homeFilterDate) return false;
      if (homeFilterType !== 'all' && normalizeType(item) !== homeFilterType) return false;
      if (!matchesPerson(item)) return false;
      return true;
    });
  }, [homeFeedItems, homeFilterDate, homeFilterType, homeFilterPerson]);

  // For Calendar: flatten all contributions with date + author_id
  const calendarContributions = useMemo(() => {
    const items: { date: string; author_id: string }[] = [];
    // Memories (entries)
    (memories || []).forEach((m: any) => {
      if (m.date && m.author_id) items.push({ date: m.date, author_id: m.author_id });
    });
    // Hugs
    (virtualHugs || []).forEach((h: any) => {
      if (h.date && h.author_id) items.push({ date: h.date, author_id: h.author_id });
    });
    // Daily check-ins (both partners can have a note on the same date)
    (dailyCheckInItems || []).forEach((c: any) => {
      if (c.date && c.author_id) items.push({ date: c.date, author_id: c.author_id });
    });
    return items;
  }, [memories, virtualHugs, dailyCheckInItems]);

  // Filter homeFeedItems for the selected date (for modal)
  const dayDetailItems = useMemo(() => {
    if (!dayDetailModalDate) return [];
    return (homeFeedItems || []).filter((item: any) => item?.date === dayDetailModalDate);
  }, [homeFeedItems, dayDetailModalDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--pastel-cream)] to-[var(--pastel-pink)]/20 flex items-center justify-center">
        <div className="text-[var(--foreground)]">Loading...</div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--pastel-pink)]/30 via-[var(--pastel-cream)] to-[var(--pastel-lavender)]/40 flex items-center justify-center p-4 relative overflow-hidden">
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            welcomeHover === 'partner1' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.35), transparent 55%), radial-gradient(circle at 80% 30%, rgba(236, 72, 153, 0.18), transparent 50%), radial-gradient(circle at 50% 90%, rgba(244, 114, 182, 0.18), transparent 60%)',
          }}
        />
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            welcomeHover === 'partner2' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.30), transparent 55%), radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.16), transparent 50%), radial-gradient(circle at 50% 90%, rgba(147, 197, 253, 0.18), transparent 60%)',
          }}
        />
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[var(--pastel-pink)]/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[var(--pastel-blue)]/40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full bg-[var(--pastel-lavender)]/35 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative w-full max-w-4xl">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden">
            <div className="px-6 py-10 md:px-10 md:py-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--pastel-pink)] text-white px-4 py-2 rounded-full shadow-md">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Together in Heart</span>
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight">
                  Welcome back,
                  <span className="text-[var(--primary)]"> my love</span>
                </h1>
                <p className="mt-3 text-[var(--muted-foreground)]">
                  Choose who you are to continue and see today’s hugs, check-ins, and memories.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl border border-[var(--border)] p-4 text-left">
                    <div className="flex items-center gap-2 text-[var(--primary)]">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">Hugs</span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">Send a hug and let it live in your timeline.</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[var(--border)] p-4 text-left">
                    <div className="flex items-center gap-2 text-[var(--primary)]">
                      <PenLine className="w-5 h-5" />
                      <span className="text-sm font-medium">Entries</span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">Write one sweet memory each day.</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[var(--border)] p-4 text-left">
                    <div className="flex items-center gap-2 text-[var(--primary)]">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-medium">Countdown</span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">Watch the days melt into your reunion.</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handlePartnerSelect('partner1')}
                  onMouseEnter={() => setWelcomeHover('partner1')}
                  onMouseLeave={() => setWelcomeHover(null)}
                  className="text-left w-full rounded-3xl p-6 bg-gradient-to-br from-[var(--pastel-pink)]/40 via-white to-white border border-[var(--primary)]/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      N
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-[var(--foreground)]">Nour</div>
                        <div className="text-xs bg-[var(--pastel-pink)]/30 text-[var(--primary)] px-3 py-1 rounded-full">Partner 1</div>
                      </div>
                      <div className="mt-1 text-sm text-[var(--muted-foreground)]">Tap to enter your shared space ✨</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePartnerSelect('partner2')}
                  onMouseEnter={() => setWelcomeHover('partner2')}
                  onMouseLeave={() => setWelcomeHover(null)}
                  className="text-left w-full rounded-3xl p-6 bg-gradient-to-br from-[var(--pastel-blue)]/40 via-white to-white border border-[var(--secondary)]/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--pastel-blue)] to-[var(--secondary)] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      S
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-[var(--foreground)]">Skander</div>
                        <div className="text-xs bg-[var(--pastel-blue)]/30 text-[var(--secondary)] px-3 py-1 rounded-full">Partner 2</div>
                      </div>
                      <div className="mt-1 text-sm text-[var(--muted-foreground)]">Tap to continue the story 💙</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-10 text-center">
                <div className="inline-flex items-center gap-2 bg-white rounded-2xl border border-[var(--border)] px-5 py-4 shadow-sm max-w-2xl">
                  <Heart className="w-5 h-5 text-[var(--primary)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">{romanticMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline DayDetailModal component
  const DayDetailModal = () => {
    if (!dayDetailModalDate) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {new Date(dayDetailModalDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <button
              onClick={() => setDayDetailModalDate(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {dayDetailItems.length === 0 ? (
              <div className="text-center text-[var(--muted-foreground)] py-12">
                No entries, hugs, or check-ins for this day.
              </div>
            ) : (
              <InfiniteMemoriesGrid memories={dayDetailItems} hasMore={false} loading={false} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--pastel-cream)] to-[var(--pastel-pink)]/20 relative overflow-x-hidden">
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

            {/* Virtual Hug Button */}
            <div className="flex justify-center">
              <VirtualHug onSend={handleVirtualHug} />
            </div>

            {/* Daily Check-In */}
            <DailyCheckIn onCheckIn={handleCheckIn} hasCheckedInToday={hasCheckedInToday} />

            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg border border-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <div className="text-sm text-[var(--muted-foreground)]">Date</div>
                  <input
                    type="date"
                    value={homeFilterDate}
                    onChange={(e) => setHomeFilterDate(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-[var(--muted-foreground)]">Type</div>
                  <select
                    value={homeFilterType}
                    onChange={(e) => setHomeFilterType(e.target.value as any)}
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)]"
                  >
                    <option value="all">All</option>
                    <option value="daily_checkin">Check-ins</option>
                    <option value="entry">Entries</option>
                    <option value="hug">Hugs</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-[var(--muted-foreground)]">Person</div>
                  <select
                    value={homeFilterPerson}
                    onChange={(e) => setHomeFilterPerson(e.target.value as any)}
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--foreground)]"
                  >
                    <option value="all">All</option>
                    <option value="nour">Nour</option>
                    <option value="skander">Skander</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setHomeFilterDate('');
                      setHomeFilterType('all');
                      setHomeFilterPerson('all');
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-[var(--pastel-lavender)]/40 to-[var(--pastel-blue)]/40 hover:shadow-md transition-all px-3 py-2 text-[var(--foreground)]"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Pinterest-style Infinite Scroll Grid */}
            <InfiniteMemoriesGrid 
              memories={filteredHomeFeedItems}
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
          <CalendarView 
            contributions={calendarContributions}
            totalDays={totalDays}
            onDayClick={handleDayClick}
            targetDate={couple?.target_date}
          />
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

      {/* Day Detail Modal */}
      <DayDetailModal />

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
