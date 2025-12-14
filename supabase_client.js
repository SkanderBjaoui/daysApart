import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication helper functions
export const auth = {
  // Sign up new user
  async signUp(email, password, name, partnerRole) {
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
  async signIn(email, password) {
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
  async getCouple(coupleId) {
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .single()
    return { data, error }
  },

  async updateCouple(coupleId, updates) {
    const { data, error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', coupleId)
      .select()
      .single()
    return { data, error }
  },

  // Users
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*, couples(*)')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Photos
  async getPhotos(coupleId) {
    const { data, error } = await supabase
      .from('photos')
      .select('*, users(name, partner_role)')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async uploadPhoto(file, coupleId, userId, caption) {
    // Upload to storage first
    const fileName = `${coupleId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)

    if (uploadError) return { data: null, error: uploadError }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    // Insert photo record
    const { data, error } = await supabase
      .from('photos')
      .insert({
        url: publicUrl,
        uploaded_by: userId,
        couple_id: coupleId,
        storage_path: fileName,
        caption
      })
      .select()
      .single()

    return { data, error }
  },

  // Daily Check-ins
  async getCheckIns(coupleId) {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('couple_id', coupleId)
      .order('date', { ascending: false })
    return { data, error }
  },

  async createCheckIn(coupleId, checkInData) {
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
  async getThoughts(coupleId) {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*, users(name, partner_role, avatar_color)')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createThought(coupleId, authorId, content) {
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

  // Memories
  async getMemories(coupleId) {
    const { data, error } = await supabase
      .from('memories')
      .select(`
        *,
        users(name, partner_role),
        memory_likes(count)
      `)
      .eq('couple_id', coupleId)
      .order('date', { ascending: false })
    return { data, error }
  },

  async createMemory(coupleId, memoryData) {
    const { data, error } = await supabase
      .from('memories')
      .insert({
        couple_id: coupleId,
        ...memoryData
      })
      .select('*, users(name, partner_role)')
      .single()
    return { data, error }
  },

  async likeMemory(memoryId, userId) {
    const { data, error } = await supabase
      .from('memory_likes')
      .insert({
        memory_id: memoryId,
        user_id: userId
      })
    return { data, error }
  },

  async unlikeMemory(memoryId, userId) {
    const { error } = await supabase
      .from('memory_likes')
      .delete()
      .eq('memory_id', memoryId)
      .eq('user_id', userId)
    return { error }
  },

  async isMemoryLiked(memoryId, userId) {
    const { data, error } = await supabase
      .from('memory_likes')
      .select('*')
      .eq('memory_id', memoryId)
      .eq('user_id', userId)
      .single()
    return { data: !!data, error }
  },

  // Notifications
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async markNotificationRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    return { error }
  },

  async createNotification(userId, coupleId, message, type = 'info') {
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
  async getMilestones(coupleId) {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('couple_id', coupleId)
      .order('target_date', { ascending: true })
    return { data, error }
  }
}

// Real-time subscriptions
export const subscribeToMemories = (coupleId, callback) => {
  return supabase
    .channel(`memories_${coupleId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'memories', filter: `couple_id=eq.${coupleId}` },
      callback
    )
    .subscribe()
}

export const subscribeToThoughts = (coupleId, callback) => {
  return supabase
    .channel(`thoughts_${coupleId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'thoughts', filter: `couple_id=eq.${coupleId}` },
      callback
    )
    .subscribe()
}

export const subscribeToPhotos = (coupleId, callback) => {
  return supabase
    .channel(`photos_${coupleId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'photos', filter: `couple_id=eq.${coupleId}` },
      callback
    )
    .subscribe()
}
