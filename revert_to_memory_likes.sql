-- Revert back to memory-specific likes table
-- Drop the generic likes table if it exists
DROP TABLE IF EXISTS likes CASCADE;

-- Create memory-specific likes table
CREATE TABLE IF NOT EXISTS memory_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only like a specific memory once
  UNIQUE(memory_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_memory_likes_memory ON memory_likes(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_likes_user ON memory_likes(user_id);

-- Enable RLS
ALTER TABLE memory_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for memory_likes
-- Users can view all memory likes
CREATE POLICY "Users can view memory likes" ON memory_likes
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Users can insert their own memory likes
CREATE POLICY "Users can insert memory likes" ON memory_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own memory likes
CREATE POLICY "Users can delete memory likes" ON memory_likes
  FOR DELETE USING (auth.uid() = user_id);
