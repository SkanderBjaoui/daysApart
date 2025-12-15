import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication helper functions
export const auth = {
  // Sign up new user
  async signUp(email: string, password: string, name: string, partnerRole: 'partner1' | 'partner2') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          partner_role: partnerRole
        }
      }
    })
    return { data, error }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }
}

// Database helper functions
export const db = {
  // Couples
  async getCouple(coupleId: string) {
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .single()
    return { data, error }
  },

  async updateCouple(coupleId: string, updates: any) {
    const { data, error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', coupleId)
      .select()
      .single()
    return { data, error }
  },

  // Users
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, couples(*)')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Photos
  async getPhotos(coupleId: string) {
    const { data, error } = await supabase
      .from('photos')
      .select('*, users(name, partner_role)')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async uploadPhoto(file: File, coupleId: string, userId: string, caption?: string) {
    // Upload to storage first
    const fileName = `${coupleId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      return { data: null, error: uploadError }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    // Insert photo record
    const { data, error } = await supabase
      .from('photos')
      .insert({
        photo: publicUrl,
        uploaded_by: userId,
        couple_id: coupleId,
        storage_path: fileName,
        caption
      })
      .select()
      .single();
    return { data, error };
  },

  // Daily Check-ins
  async getCheckIns(coupleId: string) {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('couple_id', coupleId)
      .order('date', { ascending: false })
    return { data, error }
  },

  async createCheckIn(coupleId: string, checkInData: any) {
    const { data, error } = await supabase
      .from('daily_checkins')
      .upsert({
        couple_id: coupleId,
        ...checkInData
      })
      .select()
      .single()
    return { data, error }
  },

  // Thoughts
  async getThoughts(coupleId: string) {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*, users(name, partner_role, avatar_color)')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createThought(coupleId: string, authorId: string, content: string) {
    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        content,
        author_id: authorId,
        couple_id: coupleId
      })
      .select('*, users(name, partner_role, avatar_color)')
      .single()
    return { data, error }
  },

  async getHugs(coupleId: string) {
    const { data, error } = await supabase
      .from('hugs')
      .select('*, users(name, partner_role)')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createHug(coupleId: string, senderId: string, message: string, mood = '🤗') {
    const { data, error } = await supabase
      .from('hugs')
      .insert({
        couple_id: coupleId,
        sender_id: senderId,
        message,
        mood,
      })
      .select('*, users(name, partner_role)')
      .single()
    return { data, error }
  },

  // Memories
  async getMemories(coupleId: string, userId?: string) {
    // Get memories with like counts
    const { data: memories, error } = await supabase
      .from('memories')
      .select(`
        *,
        users(name, partner_role),
        memory_likes(count)
      `)
      .eq('couple_id', coupleId)
      .order('date', { ascending: false })
    
    if (error || !memories) return { data: [], error }
    
    // If userId provided, get detailed like information
    let processedData = memories.map((memory: any) => ({
      ...memory,
      photo: memory.photo ? (typeof memory.photo === 'string' ? JSON.parse(memory.photo) : memory.photo) : undefined,
      likes: memory.memory_likes?.[0]?.count || 0,
      liked: false,
      likers: [],
      memory_likes: undefined
    }))
    
    if (userId) {
      // Get all likes for these memories by current user
      const memoryIds = memories.map(m => m.id)
      if (memoryIds.length > 0) {
        const { data: userLikes } = await supabase
          .from('memory_likes')
          .select('memory_id, users(name, partner_role)')
          .eq('user_id', userId)
          .in('memory_id', memoryIds)
        
        // Get all likes for these memories to show who liked them
        const { data: allLikes } = await supabase
          .from('memory_likes')
          .select('memory_id, users(name, partner_role)')
          .in('memory_id', memoryIds)
        
        // Process the data
        processedData = processedData.map((memory: any) => {
          const userLike = userLikes?.find(like => like.memory_id === memory.id)
          const memoryAllLikes = allLikes?.filter(like => like.memory_id === memory.id) || []
          
          return {
            ...memory,
            liked: !!userLike,
            likers: memoryAllLikes.map((like: any) => like.users)
          }
        })
      }
    }
    
    return { data: processedData, error: null }
  },

  async createMemory(coupleId: string, memoryData: any) {
    const { data, error } = await supabase
      .from('memories')
      .insert({
        couple_id: coupleId,
        ...memoryData,
        photo: memoryData.photo ? (Array.isArray(memoryData.photo) ? JSON.stringify(memoryData.photo) : memoryData.photo) : undefined,
      })
      .select('*, users(name, partner_role)')
      .single()
    if (!data || error) return { data, error }

    let normalizedPhoto = data.photo
    if (typeof normalizedPhoto === 'string') {
      try {
        const parsed = JSON.parse(normalizedPhoto)
        if (Array.isArray(parsed)) normalizedPhoto = parsed
      } catch {
        // ignore
      }
    }

    return {
      data: {
        ...data,
        photo: normalizedPhoto,
      },
      error,
    }
  },

  async likeMemory(memoryId: string, userId: string) {
    const { data, error } = await supabase
      .from('memory_likes')
      .insert({
        memory_id: memoryId,
        user_id: userId
      })
    return { data, error }
  },

  async unlikeMemory(memoryId: string, userId: string) {
    const { error } = await supabase
      .from('memory_likes')
      .delete()
      .eq('memory_id', memoryId)
      .eq('user_id', userId)
    return { error }
  },

  async isMemoryLiked(memoryId: string, userId: string) {
    const { data, error } = await supabase
      .from('memory_likes')
      .select('*')
      .eq('memory_id', memoryId)
      .eq('user_id', userId)
      .maybeSingle()
    return { data: !!data, error }
  },

  // Notifications

  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async markNotificationRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    return { error }
  },

  async createNotification(userId: string, coupleId: string, message: string, type = 'info') {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        couple_id: coupleId,
        message,
        type
      })
      .select()
      .single()
    return { data, error }
  },

  // Milestones
  async getMilestones(coupleId: string) {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('couple_id', coupleId)
      .order('target_date', { ascending: true })
    return { data, error }
  }
}

// Real-time subscriptions
export const subscribeToMemories = (coupleId: string, callback: any) => {
  return supabase
    .channel(`memories_${coupleId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'memories', filter: `couple_id=eq.${coupleId}` },
      callback
    )
    .subscribe()
}

export const subscribeToThoughts = (coupleId: string, callback: any) => {
  return supabase
    .channel(`thoughts_${coupleId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'thoughts', filter: `couple_id=eq.${coupleId}` },
      callback
    )
    .subscribe()
}

export const subscribeToPhotos = (coupleId: string, callback: any) => {
  return supabase
    .channel(`photos_${coupleId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'photos', filter: `couple_id=eq.${coupleId}` },
      callback
    )
    .subscribe()
}
