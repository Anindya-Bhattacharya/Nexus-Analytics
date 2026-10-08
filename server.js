import express from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables from .env if available
if (existsSync(join(__dirname, '.env'))) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(join(__dirname, '.env'))
    }
  } catch {
    /* fallback to process.env */
  }
}

const app = express()
const PORT = process.env.PORT || 3000
const DATA_FILE = join(__dirname, 'users_data.json')

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

const BUCKET_NAME = 'nexus-data'
const REGISTRY_FILE = 'users_registry.json'
const USERS_TABLE = 'nexus_users'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

let DEFAULT_USERS = []
try {
  if (existsSync(DATA_FILE)) {
    const raw = readFileSync(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      DEFAULT_USERS = parsed
    }
  }
} catch {
  DEFAULT_USERS = [
    {
      id: 'usr-default-admin',
      name: 'Admin User',
      username: 'admin',
      email: 'admin@synapse.com',
      role: 'Lead Data Architect',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      password: 'admin123',
    },
    {
      id: 'usr-desktop-synapse-user',
      name: 'Desktop User',
      username: 'synapse_user',
      email: 'synapse.user@gmail.com',
      role: 'Registered Studio Specialist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DesktopUser',
      password: 'user123456',
    },
  ]
}

// In-memory cache synced with disk and Supabase
let memoryUsers = null

// Helper to push full user registry to Supabase
async function pushToSupabase(users) {
  if (!Array.isArray(users) || users.length === 0) return

  // 1. Persist entire registry snapshot to Supabase Cloud Storage
  try {
    const jsonStr = JSON.stringify(users, null, 2)
    const { error: storageErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(REGISTRY_FILE, jsonStr, {
        contentType: 'application/json',
        upsert: true,
      })
    if (storageErr) {
      console.warn('Supabase storage sync notice:', storageErr.message)
    } else {
      console.log(`[Supabase Cloud] Successfully synced ${users.length} users to ${BUCKET_NAME}/${REGISTRY_FILE}`)
    }
  } catch (err) {
    console.error('Supabase storage push error:', err.message)
  }

  // 2. Upsert rows into Supabase PostgreSQL nexus_users table if it exists
  try {
    const rows = users.map((u) => ({
      id: u.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      username: (u.username || '').trim().replace(/^@+/, ''),
      email: (u.email || '').trim(),
      password: u.password || '',
      name: u.name || u.username || 'User',
      role: u.role || 'Registered Studio Specialist',
      avatar: u.avatar || '',
      phone: u.phone || '',
      linkedin: u.linkedin || '',
      updated_at: new Date().toISOString(),
      raw_data: u,
    }))

    const { error: tableErr } = await supabase.from(USERS_TABLE).upsert(rows, {
      onConflict: 'username',
    })
    if (!tableErr) {
      console.log(`[Supabase PostgreSQL] Synced rows to ${USERS_TABLE} table`)
    }
  } catch {
    /* table might not be initialized yet */
  }
}

// Helper to pull user registry from Supabase
async function pullFromSupabase() {
  // Strategy 1: Check PostgreSQL table
  try {
    const { data, error } = await supabase.from(USERS_TABLE).select('*')
    if (!error && Array.isArray(data) && data.length > 0) {
      console.log(`[Supabase] Pulled ${data.length} users from table ${USERS_TABLE}`)
      return data.map((u) => ({
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
      }))
    }
  } catch {
    /* fallback to storage */
  }

  // Strategy 2: Download from Supabase Cloud Storage
  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(REGISTRY_FILE)
    if (!error && data) {
      const text = await data.text()
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[Supabase] Pulled ${parsed.length} users from storage bucket ${BUCKET_NAME}`)
        return parsed
      }
    }
  } catch (err) {
    console.warn('[Supabase] Initial storage pull notice:', err.message)
  }

  return null
}

function getStoredUsers() {
  if (memoryUsers && Array.isArray(memoryUsers) && memoryUsers.length > 0) {
    return memoryUsers
  }
  try {
    if (existsSync(DATA_FILE)) {
      const content = readFileSync(DATA_FILE, 'utf8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryUsers = parsed
        return parsed
      }
    }
  } catch (err) {
    console.error('Error reading users_data.json:', err.message)
  }
  memoryUsers = [...DEFAULT_USERS]
  return memoryUsers
}

function saveStoredUsers(users, syncSupabase = true) {
  if (!Array.isArray(users) || users.length === 0) return false
  memoryUsers = users
  try {
    writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8')
  } catch (err) {
    console.error('Error writing users_data.json:', err.message)
  }
  if (syncSupabase) {
    pushToSupabase(users).catch((e) => console.error('Background Supabase push failed:', e.message))
  }
  return true
}

// Initial sync on server startup
async function initServerSync() {
  const localList = getStoredUsers()
  try {
    const cloudUsers = await pullFromSupabase()
    if (cloudUsers && cloudUsers.length > 0) {
      // Merge local with cloud
      const map = new Map()
      ;[...localList, ...cloudUsers].forEach((u) => {
        if (!u || !u.username) return
        const key = u.username.trim().toLowerCase()
        const existing = map.get(key)
        map.set(key, existing ? { ...existing, ...u } : u)
      })
      const merged = Array.from(map.values())
      saveStoredUsers(merged, false)
      console.log(`[Server Ready] Initialized with ${merged.length} users synced with Supabase`)
    } else {
      // Seed Supabase with local users
      await pushToSupabase(localList)
    }
  } catch (err) {
    console.error('Supabase init error:', err.message)
  }
}
initServerSync()

app.use(express.json({ limit: '10mb' }))

// CORS headers for all incoming requests (Desktop, Mobile, etc.)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Serve built Vite app static files
app.use(express.static(join(__dirname, 'dist')))

// ── Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'supabase',
    uptime: process.uptime(),
    userCount: getStoredUsers().length,
  })
})

// ── GET /api/users ── return the full shared user registry
app.get('/api/users', async (req, res) => {
  try {
    const users = getStoredUsers()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message, users: DEFAULT_USERS })
  }
})

// ── PUT /api/users ── overwrite user registry with new list & sync to Supabase
app.put('/api/users', async (req, res) => {
  try {
    const users = req.body
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Expected a non-empty array of users' })
    }
    saveStoredUsers(users, true)
    res.json({ ok: true, count: users.length, syncedWith: 'supabase' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/users/register ── append or update a single user directly & sync to Supabase
app.post('/api/users/register', async (req, res) => {
  try {
    const newUser = req.body
    if (!newUser || !newUser.username) {
      return res.status(400).json({ error: 'Username is required' })
    }
    const currentList = getStoredUsers()
    const cleanUsername = newUser.username.trim().toLowerCase()
    const cleanEmail = (newUser.email || '').trim().toLowerCase()

    const existingIndex = currentList.findIndex(
      (u) =>
        (u.username && u.username.trim().toLowerCase() === cleanUsername) ||
        (u.email && u.email.trim().toLowerCase() === cleanEmail)
    )

    let updatedList
    if (existingIndex >= 0) {
      updatedList = [...currentList]
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...newUser }
    } else {
      updatedList = [...currentList, newUser]
    }

    saveStoredUsers(updatedList, true)
    res.json({ ok: true, user: newUser, totalUsers: updatedList.length, syncedWith: 'supabase' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Catch-all: send index.html for client-side routing (SPA)
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Nexus Analytics server running on port ${PORT} with Supabase Cloud connection`)
})
