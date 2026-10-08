// Supabase client and cloud database helpers for Synapse / Nexus Analytics
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL ||
  'https://pzoxlahbiabzzqzooxns.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_YbYpaiTGJzy0GEAiTVSRSg_Ny6Mq9zM'

export const BUCKET_NAME = 'nexus-data'
export const REGISTRY_FILE = 'users_registry.json'
export const USERS_TABLE = 'nexus_users'

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/**
 * Fetch all registered users from Supabase Cloud
 * 1. Attempts to query the PostgreSQL `nexus_users` table.
 * 2. Falls back to Supabase Cloud Storage `nexus-data/users_registry.json`
 */
export async function fetchUsersFromSupabase() {
  // Strategy 1: Try reading from PostgreSQL table
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((u) => ({
        id: u.id,
        name: u.name || u.username,
        username: (u.username || '').trim(),
        email: (u.email || '').trim(),
        password: u.password || '',
        role: u.role || 'Registered Studio Specialist',
        avatar: u.avatar || '',
        phone: u.phone || '',
        linkedin: u.linkedin || '',
        ...(u.raw_data && typeof u.raw_data === 'object' ? u.raw_data : {}),
      }))
    }
  } catch (err) {
    // Table might not exist yet; proceed to storage fallback
  }

  // Strategy 2: Fetch from Supabase Cloud Storage
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(REGISTRY_FILE)

    if (!error && data) {
      const text = await data.text()
      const users = JSON.parse(text)
      if (Array.isArray(users) && users.length > 0) {
        return users
      }
    }
  } catch (err) {
    // storage fetch error
  }

  // Strategy 3: Direct public URL fetch from Supabase Storage
  try {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${REGISTRY_FILE}?t=${Date.now()}`
    const res = await fetch(publicUrl, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: 'no-store',
    })
    if (res.ok) {
      const users = await res.json()
      if (Array.isArray(users) && users.length > 0) {
        return users
      }
    }
  } catch (err) {
    // fallback failed
  }

  return null
}

/**
 * Find single user by username or email directly from Supabase
 */
export async function findSupabaseUser(identifier) {
  if (!identifier) return null
  const cleanId = identifier.trim().replace(/^@+/, '')

  // 1. Try PostgreSQL table query
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .or(`username.ilike.${cleanId},email.ilike.${cleanId}`)
      .limit(1)

    if (!error && data && data.length > 0) {
      const u = data[0]
      return {
        id: u.id,
        name: u.name || u.username,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        avatar: u.avatar,
        phone: u.phone,
        linkedin: u.linkedin,
        ...(u.raw_data && typeof u.raw_data === 'object' ? u.raw_data : {}),
      }
    }
  } catch {
    // ignore
  }

  // 2. Fallback to all users list from Supabase
  const allUsers = await fetchUsersFromSupabase()
  if (Array.isArray(allUsers)) {
    const isEmail = cleanId.includes('@')
    return (
      allUsers.find((u) => {
        const uName = (u.username || '').trim().replace(/^@+/, '')
        const uEmail = (u.email || '').trim()
        if (uName.toLowerCase() === cleanId.toLowerCase()) return true
        if (isEmail && uEmail.toLowerCase() === cleanId.toLowerCase()) return true
        return false
      }) || null
    )
  }

  return null
}

/**
 * Upsert a user in Supabase (PostgreSQL table if available)
 */
export async function upsertUserInSupabaseTable(user) {
  if (!user || !user.username) return false
  try {
    const row = {
      id: user.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: (user.username || '').trim().replace(/^@+/, ''),
      email: (user.email || '').trim(),
      password: user.password || '',
      name: user.name || user.username || 'User',
      role: user.role || 'Registered Studio Specialist',
      avatar: user.avatar || '',
      phone: user.phone || '',
      linkedin: user.linkedin || '',
      updated_at: new Date().toISOString(),
      raw_data: user,
    }

    const { error } = await supabase.from(USERS_TABLE).upsert(row, {
      onConflict: 'username',
    })
    return !error
  } catch {
    return false
  }
}

export default supabase
