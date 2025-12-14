-- CuteCouples Supabase Database Schema

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Couples table to store relationship information
CREATE TABLE couples (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  partner1_name VARCHAR(100) NOT NULL,
  partner2_name VARCHAR(100) NOT NULL,
  partner1_email VARCHAR(255) UNIQUE,
  partner2_email VARCHAR(255) UNIQUE,
  anniversary_date DATE,
  target_date DATE, -- When they'll be together again
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table for authentication and user management
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  partner_role VARCHAR(20) CHECK (partner_role IN ('partner1', 'partner2')),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  avatar_color VARCHAR(50) DEFAULT 'bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--primary)]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table for uploaded images
CREATE TABLE photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  storage_path TEXT, -- Supabase storage path
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily check-ins table
CREATE TABLE daily_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  partner1_note TEXT,
  partner1_avatar VARCHAR(10) DEFAULT 'A',
  partner2_note TEXT,
  partner2_avatar VARCHAR(10) DEFAULT 'B',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, couple_id) -- One check-in per couple per day
);

-- Thoughts/daily messages table
CREATE TABLE thoughts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories/Journal entries table
CREATE TABLE memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  photo_url TEXT,
  photo_storage_path TEXT,
  stickers TEXT[], -- Array of sticker emojis
  mood VARCHAR(10), -- Emoji mood
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory likes table (for tracking who liked what)
CREATE TABLE memory_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(memory_id, user_id) -- One like per user per memory
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, milestone, memory, etc.
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table for tracking relationship milestones
CREATE TABLE milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true);

-- Row Level Security (RLS) policies
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Couples can only see their own data
CREATE POLICY "Users can view their own couple" ON couples
  FOR SELECT USING (
    id IN (SELECT couple_id FROM users WHERE id = auth.uid())
  );

-- Users can only see their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only see photos from their couple
CREATE POLICY "Users can view their couple photos" ON photos
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid())
  );

-- Users can only see their couple's check-ins
CREATE POLICY "Users can view their couple check-ins" ON daily_checkins
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid())
  );

-- Users can only see thoughts from their couple
CREATE POLICY "Users can view their couple thoughts" ON thoughts
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid())
  );

-- Users can only see memories from their couple
CREATE POLICY "Users can view their couple memories" ON memories
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid())
  );

-- Users can only see their notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their couple's milestones
CREATE POLICY "Users can view their couple milestones" ON milestones
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid())
  );

-- Insert policies - users can insert for their couple
CREATE POLICY "Users can insert photos" ON photos
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert thoughts" ON thoughts
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid()) AND
    author_id = auth.uid()
  );

CREATE POLICY "Users can insert memories" ON memories
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid()) AND
    author_id = auth.uid()
  );

CREATE POLICY "Users can insert likes" ON memory_likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    memory_id IN (
      SELECT id FROM memories WHERE 
        couple_id IN (SELECT couple_id FROM users WHERE id = auth.uid())
    )
  );

-- Update policies
CREATE POLICY "Users can update their memories" ON memories
  FOR UPDATE USING (
    author_id = auth.uid()
  );

CREATE POLICY "Users can update their likes" ON memory_likes
  FOR UPDATE USING (user_id = auth.uid());

-- Delete policies
CREATE POLICY "Users can delete their memories" ON memories
  FOR DELETE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their likes" ON memory_likes
  FOR DELETE USING (user_id = auth.uid());

-- Storage policy for photos
CREATE POLICY "Users can upload photos for their couple" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] IN (
      SELECT couple_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their couple photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] IN (
      SELECT couple_id::text FROM users WHERE id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX idx_memories_couple_date ON memories(couple_id, date DESC);
CREATE INDEX idx_thoughts_couple_created ON thoughts(couple_id, created_at DESC);
CREATE INDEX idx_photos_couple_created ON photos(couple_id, created_at DESC);
CREATE INDEX idx_checkins_couple_date ON daily_checkins(couple_id, date DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_memory_likes_memory ON memory_likes(memory_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON couples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
