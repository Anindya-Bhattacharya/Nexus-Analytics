import { createContext, useContext, useState, useEffect } from 'react'
import {
  supabase,
  fetchUsersFromSupabase,
  findSupabaseUser,
  upsertUserInSupabaseTable,
} from '../supabase'
import {
  sendWelcomeEmail,
} from '../utils/emailService'

const AuthContext = createContext(null)

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '241226224383-vd71adjk258abgofsktjotnbmo0o2odq.apps.googleusercontent.com'

// ─── Pure localStorage helpers for the registered-users registry ───────────
const LS_KEY = 'nexus_registered_users'

// ─── Default Registered Users (Baked-in so every device has immediate access) ──
const DEFAULT_USERS = [
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
    id: 'usr-rupankar-podder',
    name: 'Rupankar Podder',
    username: 'rupankar',
    email: 'rpodder2019@gmail.com',
    role: 'Frontend Development, Database & Authentication',
    avatar: '/rupankar.jpg',
    password: 'password123',
    phone: '8240656131',
    linkedin: 'https://www.linkedin.com/in/rupankar-podder/',
  },
  {
    id: 'usr-manish-maiti',
    name: 'Manish Maiti',
    username: 'manish',
    email: 'maitimanish1924@gmail.com',
    role: 'Data Preprocessing, Collection & Modeling',
    avatar: '/manish.jpg',
    password: 'password123',
    phone: '7477494304',
    linkedin: 'https://www.linkedin.com/in/manish-maiti/',
  },
  {
    id: 'usr-anindya-bhattacharya',
    name: 'Anindya Bhattacharya',
    username: 'anindya',
    email: 'anindyabhattacharya477@gmail.com',
    role: 'Data Visualization & Power BI Dashboards',
    avatar: '/anindya.jpg',
    password: 'password123',
    phone: '9547405451',
    linkedin: 'https://in.linkedin.com/in/anindya-bhattacharya-01912a42a',
  },
  {
    id: 'usr-suman-das',
    name: 'Suman Kumar Das',
    username: 'suman',
    email: 'das786390@gmail.com',
    role: 'Power BI Data Modeling & Data Visualization',
    avatar: '/suman.jpg',
    password: 'password123',
    phone: '6295868348',
    linkedin: 'https://www.linkedin.com/in/suman-kumar-das-72796828b',
  },
  {
    id: 'usr-dipankar-mondal',
    name: 'Dipankar Mondal',
    username: 'dipankar',
    email: 'dm3543679@gmail.com',
    role: 'Power BI Dashboard Design & Report Documentation',
    avatar: '/dipankar.jpg',
    password: 'password123',
    phone: '7407756486',
    linkedin: 'https://www.linkedin.com/in/dipankar-mondal-58905b43b/',
  },
  {
    id: 'usr-1787904703959',
    name: 'Anindya',
    username: 'anindya001',
    email: 'acier4135@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anindya',
    password: 'anindya002',
  },
  {
    id: 'usr-1787822625112',
    name: 'newacc',
    username: 'hellorup1234',
    email: 'newacc@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newacc',
    password: 'hellorup1234',
  },
  {
    id: 'usr-1787821419498',
    name: 'hello',
    username: 'hellorup',
    email: 'hellorup@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hello',
    password: 'hellorup123',
  },
  {
    id: 'usr-1787819949458',
    name: 'new',
    username: 'new369',
    email: 'mannaankan@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new',
    password: 'new369',
  },
  {
    id: 'usr-1787480249402',
    name: 'Rupankar999',
    username: 'rup999',
    email: 'rupankarpodder436@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rupankar999',
    password: 'hello999',
  },
  {
    id: 'usr-1787815122984',
    name: 'Rupankar',
    username: 'manish003',
    email: 'maitimanish1924@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rupankar',
    password: 'Rupankar999',
  },
  {
    id: 'usr-1787814774456',
    name: 'rupankar',
    username: 'manish002',
    email: 'manishmaiti1924@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rupankar',
    password: 'Rupankar999',
  },
  {
    id: 'usr-1787502617296',
    name: 'user1',
    username: 'user01',
    email: 'rupankarwork459@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    password: 'user01',
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
  {
    id: 'usr-desktop-new',
    name: 'Desktop User New',
    username: 'desktop_user_new',
    email: 'desktop_user_new@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=desktop_user_new',
    password: 'pass123456',
  },
  {
    id: 'usr-1787822580474-ckhlo7yq6xh',
    name: 'testuser',
    username: 'testuser',
    email: 'testuser@synapse.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
    password: 'password123',
  },
  {
    id: 'usr-1787822580474-kxu4hhifxdk',
    name: 'desktop_test',
    username: 'desktop_test',
    email: 'desktop_test@synapse.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=desktop_test',
    password: 'password123',
  },
  {
    id: 'usr-desktop-1787814134543',
    name: 'Desktop User Test',
    username: 'desktopuser88',
    email: 'desktop.user@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=desktopuser88',
    password: 'deskpass123',
  },
  {
    id: 'usr-mobile-1787814133282',
    name: 'Mobile User Test',
    username: 'mobileuser99',
    email: 'mobile.user@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mobileuser99',
    password: 'mobilepass123',
  },
  {
    id: 'usr-1787474549720',
    name: 'rup001',
    username: 'rpodder2019@gmail.com',
    email: 'rpodder2019@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rup001',
    password: 'Rup001',
  },
  {
    id: 'usr-1787474696702',
    name: 'hello',
    username: 'rpodder2026@gmail.com',
    email: 'rpodder2026@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hello',
    password: 'Rup001',
  },
  {
    id: 'usr-1787475011156',
    name: 'hello001',
    username: 'ruppop153@gmail.com',
    email: 'ruppop153@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hello001',
    password: 'Rup001',
  },
  {
    id: 'usr-1787475292678',
    name: 'hello789',
    username: 'rpodder2011@gmail.com',
    email: 'rpodder2011@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hello789',
    password: 'Rup001',
  },
  {
    id: 'usr-1787476087631',
    name: 'hello001',
    username: 'rup001',
    email: 'rup001@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hello001',
    password: 'Rup001',
  },
  {
    id: 'usr-1787476310103',
    name: 'Rupankar',
    username: 'rpodder222',
    email: 'rpodder222@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rupankar',
    password: 'Rup001',
  },
  {
    id: 'usr-1787476392929',
    name: 'Rupankar',
    username: 'bwubca24276',
    email: 'bwubca24276@brainwareuniversity.ac.in',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rupankar',
    password: 'Rup001',
  },
  {
    id: 'usr-1787476740407',
    name: 'Rupankar',
    username: 'Rupankar',
    email: 'Rupankar@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rupankar',
    password: 'Rup001',
  },
  {
    id: 'usr-1787477274139',
    name: 'Rupankar',
    username: 'Rupankar009',
    email: 'fdnslkfdg@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rupankar',
    password: 'Rup001',
  },
  {
    id: 'usr-1787477530003',
    name: 'Rupankar',
    username: 'Rupankar002',
    email: 'sfsdfsd@gmail.com',
    role: 'Registered Studio Specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rupankar',
    password: 'Rup001',
  },
]

// Merge multiple user lists preserving password, credentials and latest details
function mergeUserLists(...lists) {
  const merged = []
  for (const list of lists) {
    if (!Array.isArray(list)) continue
    for (const u of list) {
      if (!u || (!u.username && !u.email)) continue
      const uUser = (u.username || '').trim().toLowerCase().replace(/^@+/, '')
      const uEmail = (u.email || '').trim().toLowerCase()
      const idx = merged.findIndex((m) => {
        const mUser = (m.username || '').trim().toLowerCase().replace(/^@+/, '')
        const mEmail = (m.email || '').trim().toLowerCase()
        return (
          (mUser && uUser && mUser === uUser) ||
          (mEmail && uEmail && mEmail === uEmail) ||
          (m.id && u.id && m.id === u.id)
        )
      })
      if (idx === -1) {
        merged.push(u)
      } else {
        merged[idx] = {
          ...merged[idx],
          ...u,
          password: u.password || merged[idx].password || '',
          name: u.name || merged[idx].name || u.username || 'User',
        }
      }
    }
  }
  return merged
}

function readUsers() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    let parsed = []
    if (raw) {
      try {
        const json = JSON.parse(raw)
        if (Array.isArray(json)) parsed = json
      } catch {
        parsed = []
      }
    }
    // Always merge DEFAULT_USERS with existing localStorage so mobile & desktop always have all accounts
    const merged = mergeUserLists(DEFAULT_USERS, parsed)
    localStorage.setItem(LS_KEY, JSON.stringify(merged))
    return merged
  } catch {
    return DEFAULT_USERS
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(users))
  } catch {
    // ignore storage errors
  }
}

// ─── Multi-Tier Cloud Account Synchronization (PC ↔ Mobile Cross-Device) ───
const NTFY_TOPIC = 'nexus_synapse_accounts_registry_v1'
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`
const PRIMARY_CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a04219742b30d9'
const MIRROR_CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a0420156a7304b'

// Fetch users from ntfy real-time topic (zero rate limits, cross-device instant sync)
async function fetchFromNtfyTopic(timeoutMs = 4000) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(`${NTFY_URL}/json?poll=1`, {
      headers: { Accept: 'application/x-ndjson, application/json' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const text = await res.text()
    const lines = text.trim().split('\n').filter(Boolean)
    const users = []

    for (const line of lines) {
      try {
        const item = JSON.parse(line)
        if (item.event === 'message') {
          if (item.message && item.message.startsWith('{')) {
            const payload = JSON.parse(item.message)
            if (payload.type === 'SYNC_USERS' && Array.isArray(payload.users)) {
              users.push(...payload.users)
            } else if (payload.username && payload.password) {
              users.push(payload)
            }
          }
          if (item.attachment && item.attachment.url) {
            try {
              const attachRes = await fetch(item.attachment.url)
              if (attachRes.ok) {
                const attachJson = await attachRes.json()
                if (Array.isArray(attachJson)) {
                  users.push(...attachJson)
                } else if (attachJson && Array.isArray(attachJson.users)) {
                  users.push(...attachJson.users)
                }
              }
            } catch { }
          }
        }
      } catch { }
    }
    return users.length > 0 ? users : null
  } catch {
    return null
  }
}

// Fetch users from a REST cloud endpoint with timeout
async function fetchFromRestEndpoint(url, timeoutMs = 3000) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const json = await res.json()
    if (json && json.data && Array.isArray(json.data.users) && json.data.users.length > 0) {
      return json.data.users
    }
  } catch {
    /* ignore timeout or network issue */
  }
  return null
}

// Fetch users from optional Express server API (/api/users)
async function fetchFromServerApi(timeoutMs = 2500) {
  if (typeof window === 'undefined') return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch('/api/users', {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const users = await res.json()
    if (Array.isArray(users) && users.length > 0) {
      return users
    }
  } catch {
    /* ignore */
  }
  return null
}

// Fetch registered users directly from Supabase cloud database
async function fetchFromSupabaseCloud() {
  try {
    const users = await fetchUsersFromSupabase()
    if (Array.isArray(users) && users.length > 0) {
      return users
    }
  } catch {
    /* ignore network error */
  }
  return null
}

// Read all registered users from cloud databases across all tiers
async function fetchCloudUsers() {
  const results = await Promise.allSettled([
    fetchFromSupabaseCloud(),
    fetchFromServerApi(),
    fetchFromNtfyTopic(),
    fetchFromRestEndpoint(PRIMARY_CLOUD_SYNC_URL),
    fetchFromRestEndpoint(MIRROR_CLOUD_SYNC_URL),
  ])

  const validLists = results
    .filter((r) => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0)
    .map((r) => r.value)

  if (validLists.length > 0) {
    return mergeUserLists(...validLists)
  }
  return null
}

// Push updated user list to all cloud databases guaranteeing instant mobile visibility
async function pushCloudUsers(usersList, singleNewUser = null) {
  if (!Array.isArray(usersList) || usersList.length === 0) return false

  const sanitizedList = (usersList || []).slice(-150).map((u) => ({
    id: u.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: u.name || u.username || 'User',
    username: (u.username || '').trim(),
    email: (u.email || '').trim(),
    password: u.password || '',
    role: u.role || 'Registered Studio Specialist',
    avatar:
      u.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.username || 'user')}`,
  }))

  const pushToNtfy = async () => {
    try {
      const payload = singleNewUser || { type: 'SYNC_USERS', users: sanitizedList }
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      const res = await fetch(`${NTFY_URL}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      clearTimeout(timer)
      return res.ok
    } catch {
      return false
    }
  }

  const pushToRestEndpoint = async (url, name) => {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          data: { users: sanitizedList },
        }),
        signal: controller.signal,
      })
      clearTimeout(timer)
      return res.ok
    } catch {
      return false
    }
  }

  const pushToServerApi = async () => {
    if (typeof window === 'undefined') return false
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 3000)
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedList),
        signal: controller.signal,
      })
      clearTimeout(timer)
      return res.ok
    } catch {
      return false
    }
  }

  const pushToSupabaseCloud = async () => {
    try {
      if (singleNewUser) {
        await upsertUserInSupabaseTable(singleNewUser)
      } else {
        for (const u of sanitizedList) {
          upsertUserInSupabaseTable(u).catch(() => {})
        }
      }
      return true
    } catch {
      return false
    }
  }

  const [pSupabase, pServer, pNtfy, p1, p2] = await Promise.all([
    pushToSupabaseCloud().catch(() => false),
    pushToServerApi().catch(() => false),
    pushToNtfy().catch(() => false),
    pushToRestEndpoint(PRIMARY_CLOUD_SYNC_URL, 'nexus_users_v2').catch(() => false),
    pushToRestEndpoint(MIRROR_CLOUD_SYNC_URL, 'nexus_users').catch(() => false),
  ])

  return pSupabase || pServer || pNtfy || p1 || p2
}

const pushServerUsers = pushCloudUsers
const fetchServerUsers = fetchCloudUsers

// Main sync: merge default + local + cloud, write back to localStorage
async function syncUsersFromCloud() {
  const localUsers = readUsers()
  const cloudUsers = await fetchCloudUsers()

  if (cloudUsers && cloudUsers.length > 0) {
    const merged = mergeUserLists(DEFAULT_USERS, localUsers, cloudUsers)
    writeUsers(merged)
    if (merged.length > cloudUsers.length) {
      pushCloudUsers(merged).catch(() => { })
    }
    return merged
  }
  return localUsers
}







// ─── Gibberish & Fake Random Email Detector ─────────────────────────────────
function isGibberishOrFakeUsername(str) {
  const clean = str.toLowerCase().replace(/[^a-z]/g, '')
  if (clean.length < 5) return false

  // 1. Common keyboard walks / random key mashing sequences
  const keyboardSequences = [
    'qwerty', 'asdfgh', 'zxcvbn', '123456', 'dfghjk', 'fghjkl',
    'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'xcvb', 'cvbn',
    'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop',
    'zxcv', 'xcvb', 'cvbn', 'vbnm', 'asdf', 'sdfg', 'dfgh'
  ]
  for (const seq of keyboardSequences) {
    if (clean.includes(seq)) return true
  }

  // 2. High entropy / excessive consecutive consonants (>= 6 in a row)
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y'])
  let consonantCount = 0
  for (let i = 0; i < clean.length; i++) {
    if (!vowels.has(clean[i])) {
      consonantCount++
      if (consonantCount >= 6) return true
    } else {
      consonantCount = 0
    }
  }

  // 3. Ultra low vowel ratio check (if length >= 8 and vowels < 12%)
  let vowelCount = 0
  for (let i = 0; i < clean.length; i++) {
    if (vowels.has(clean[i])) vowelCount++
  }
  if (clean.length >= 8 && (vowelCount / clean.length) < 0.12) {
    return true
  }

  // 4. Repeated character sequence (e.g., "aaaaa", "zzzzz")
  if (/(.)\1{3,}/.test(clean)) return true

  return false
}

// ─── Email authorization and validation helper ──────────────────────────────
function validateAuthorizedEmail(email) {
  const cleanEmail = email.trim().toLowerCase()

  // Standard RFC 5322 Email Syntax Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Invalid email address format. Please enter a valid email address (e.g. name@company.com).')
  }

  const [localPart, domain] = cleanEmail.split('@')

  if (isGibberishOrFakeUsername(localPart)) {
    throw new Error(`The email "${cleanEmail}" appears invalid. Please enter a real email address.`)
  }

  const unauthorizedDomains = [
    'tempmail.com',
    'mailinator.com',
    'dispostable.com',
    'guerrillamail.com',
    '10minutemail.com',
    'trashmail.com',
    'yopmail.com',
  ]

  if (unauthorizedDomains.includes(domain)) {
    throw new Error(`The email domain "@${domain}" is disposable. Please enter a valid email address.`)
  }

  return cleanEmail
}
// ────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nexus_auth_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [googleAccounts, setGoogleAccounts] = useState(() => {
    try {
      const savedAccounts = localStorage.getItem('nexus_google_accounts')
      return savedAccounts ? JSON.parse(savedAccounts) : []
    } catch {
      return []
    }
  })

  const [githubAccounts, setGithubAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_github_accounts')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Initial Cloud Sync on Mount for Cross-Device Support + background tab refresh
  useEffect(() => {
    syncUsersFromCloud().catch(() => { })

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncUsersFromCloud().catch(() => { })
      }
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility)
    }

    const interval = setInterval(() => {
      syncUsersFromCloud().catch(() => { })
    }, 30000)

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
      clearInterval(interval)
    }
  }, [])

  // Persist session user
  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('nexus_auth_user')
    }
  }, [user])

  // Persist google accounts
  useEffect(() => {
    try {
      localStorage.setItem('nexus_google_accounts', JSON.stringify(googleAccounts))
    } catch { /* ignore */ }
  }, [googleAccounts])

  // Persist github accounts
  useEffect(() => {
    try {
      localStorage.setItem('nexus_github_accounts', JSON.stringify(githubAccounts))
    } catch { /* ignore */ }
  }, [githubAccounts])

  const addGoogleAccount = (newAccount) => {
    setGoogleAccounts((prev) => {
      const exists = prev.some((acc) => acc.email.toLowerCase() === newAccount.email.toLowerCase())
      if (exists) return prev
      return [...prev, newAccount]
    })
  }

  const removeGoogleAccount = (email) => {
    setGoogleAccounts((prev) =>
      prev.filter((acc) => acc.email.toLowerCase() !== email.toLowerCase())
    )
  }

  const addGithubAccount = (newAccount) => {
    setGithubAccounts((prev) => {
      const exists = prev.some(
        (acc) => acc.username.toLowerCase() === newAccount.username.toLowerCase()
      )
      if (exists) return prev
      return [...prev, newAccount]
    })
  }

  // ─── Normal email/password signup ─────────────────────────────────────────
  const signup = async (fullName, desiredUsername, desiredEmail, password) => {
    await new Promise((res) => setTimeout(res, 800))

    if (!fullName || !fullName.trim()) {
      throw new Error('Please enter your full name.')
    }
    if (!desiredUsername || !desiredUsername.trim()) {
      throw new Error('Please enter a username.')
    }
    if (!desiredEmail || !desiredEmail.trim()) {
      throw new Error('Please enter an email address.')
    }
    if (!password || !password.trim()) {
      throw new Error('Please enter a password.')
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.')
    }

    const cleanUsername = desiredUsername.trim()
    const cleanEmail = validateAuthorizedEmail(desiredEmail)
    const normalizedUsername = cleanUsername.toLowerCase()
    const normalizedEmail = cleanEmail.toLowerCase()

    // Read stored users from localStorage and merge latest Cloud registry
    let currentUsers = readUsers()
    try {
      const cloudUsers = await fetchCloudUsers()
      if (cloudUsers) {
        currentUsers = mergeUserLists(currentUsers, cloudUsers)
      }
    } catch { /* ignore */ }

    // 1. CHECK IF USERNAME IS ALREADY TAKEN
    const usernameTaken = currentUsers.some((u) => {
      const uUsername = (u.username || '').trim().toLowerCase()
      const uEmail = (u.email || '').trim().toLowerCase()
      const uEmailPrefix = uEmail.split('@')[0]
      return uUsername === normalizedUsername || uEmailPrefix === normalizedUsername
    })

    if (usernameTaken) {
      throw new Error(
        `The username "${cleanUsername}" is already taken. Please choose a different username.`
      )
    }

    // 2. CHECK IF EMAIL IS ALREADY REGISTERED
    const emailTaken = currentUsers.some((u) => {
      const uEmail = (u.email || '').trim().toLowerCase()
      return uEmail === normalizedEmail
    })

    if (emailTaken) {
      throw new Error(
        `The email address "${cleanEmail}" is already registered. Please sign in or use a different email.`
      )
    }

    // 3. STORE LOGIN DATA: Create new user object with password and persist it
    const newUser = {
      id: `usr-${Date.now()}`,
      name: fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      role: 'Registered Studio Specialist',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName.trim())}`,
      password: password,
    }

    // Write to localStorage and sync to Cloud Storage immediately
    const updatedUsersList = [...currentUsers, newUser]
    writeUsers(updatedUsersList)
    await pushCloudUsers(updatedUsersList, newUser)

    // Session user — never expose password
    const { password: _pw, ...sessionUser } = newUser
    const sessionNewUser = { ...sessionUser, provider: 'email' }

    setUser(sessionNewUser)

    sendWelcomeEmail(newUser.name, newUser.email).catch(() => { })

    return sessionNewUser
  }

  // ─── Normal email/password login ──────────────────────────────────────────
  const login = async (identifier, password, rememberMe = true) => {
    await new Promise((res) => setTimeout(res, 500))

    if (!identifier || !identifier.trim() || !password || !password.trim()) {
      throw new Error('Please enter both username/email and password.')
    }

    const rawInput = identifier.trim()
    const exactHandle = rawInput.replace(/^@+/, '').trim()
    const isEmailInput = rawInput.includes('@') && rawInput.includes('.')
    const cleanPassword = password.trim()

    // Always sync fresh user list from Cloud Storage on login attempt for cross-device support (Desktop ↔ Mobile)
    const allUsers = await syncUsersFromCloud()

    const findMatchingUser = (usersList) => {
      return (usersList || []).find((u) => {
        if (!u) return false
        const uUsername = (u.username || '').trim()
        const uUsernameClean = uUsername.replace(/^@+/, '').trim()
        const uEmail = (u.email || '').trim()

        // 1. Strict case-sensitive username match (e.g. 'hello' will NOT match 'hellO')
        if (uUsernameClean === exactHandle || uUsername === rawInput) {
          return true
        }

        // 2. Email match (if raw input is a valid email format)
        if (isEmailInput && uEmail.toLowerCase() === rawInput.toLowerCase()) {
          return true
        }

        return false
      })
    }

    let existingUser = findMatchingUser(allUsers)

    // Direct Supabase lookup if not found in list
    if (!existingUser) {
      try {
        const suUser = await findSupabaseUser(exactHandle)
        if (suUser) {
          const docUsername = (suUser.username || '').trim().replace(/^@+/, '')
          if (
            docUsername === exactHandle ||
            (isEmailInput && (suUser.email || '').toLowerCase() === rawInput.toLowerCase())
          ) {
            existingUser = suUser
          }
        }
      } catch { /* ignore */ }
    }

    if (!existingUser) {
      if (isEmailInput) {
        throw new Error('Incorrect email address. Please check your email and try again.')
      }
      throw new Error('Incorrect username. Please check your username and try again.')
    }

    const storedPassword = existingUser.password || ''
    // Strict case-sensitive password match (e.g. 'pass' will NOT match 'Pass')
    const isPasswordMatch =
      storedPassword === password ||
      storedPassword.trim() === cleanPassword

    if (!isPasswordMatch) {
      throw new Error('Incorrect password. Please check your password and try again.')
    }

    // LOGIN SUCCESS: Set session user with exact database username and details
    const { password: _pw, ...sessionUser } = existingUser
    const authenticatedUser = {
      ...sessionUser,
      username: existingUser.username, // EXACT username from database
      provider: 'email',
    }

    setUser(authenticatedUser)
    return {
      ...authenticatedUser,
      password: storedPassword, // EXACT password from database
    }
  }

  // ─── Verify credentials against Cloud Registry without full desktop login ──
  const verifyCredentials = async (identifier, password) => {
    await new Promise((res) => setTimeout(res, 500))

    if (!identifier || !identifier.trim()) {
      throw new Error('Please enter your username or email address.')
    }
    if (!password || !password.trim()) {
      throw new Error('Please enter your password.')
    }

    const rawInput = identifier.trim()
    const exactHandle = rawInput.replace(/^@+/, '').trim()
    const isEmailInput = rawInput.includes('@') && rawInput.includes('.')
    const cleanPassword = password.trim()

    // Always fetch fresh users from Cloud Registry / Supabase database
    const allUsers = await syncUsersFromCloud()

    const findMatchingUser = (usersList) => {
      return (usersList || []).find((u) => {
        if (!u) return false
        const uUsername = (u.username || '').trim()
        const uUsernameClean = uUsername.replace(/^@+/, '').trim()
        const uEmail = (u.email || '').trim()

        // 1. Strict case-sensitive username match
        if (uUsernameClean === exactHandle || uUsername === rawInput) {
          return true
        }

        // 2. Email match (if raw input is a valid email format)
        if (isEmailInput && uEmail.toLowerCase() === rawInput.toLowerCase()) {
          return true
        }

        return false
      })
    }

    let existingUser = findMatchingUser(allUsers)

    // Direct Supabase lookup if not present in merged array
    if (!existingUser) {
      try {
        const suUser = await findSupabaseUser(exactHandle)
        if (suUser) {
          const docUsername = (suUser.username || '').trim().replace(/^@+/, '')
          if (
            docUsername === exactHandle ||
            (isEmailInput && (suUser.email || '').toLowerCase() === rawInput.toLowerCase())
          ) {
            existingUser = suUser
          }
        }
      } catch { /* ignore */ }
    }

    if (!existingUser) {
      if (isEmailInput) {
        throw new Error('Incorrect email address. Please check your email and try again.')
      }
      throw new Error('Incorrect username. Please check your username and try again.')
    }

    const storedPassword = existingUser.password || ''
    // Strict case-sensitive password match
    const isPasswordMatch =
      storedPassword === password ||
      storedPassword.trim() === cleanPassword

    if (!isPasswordMatch) {
      throw new Error('Incorrect password. Please check your password and try again.')
    }

    // Return the user with the EXACT database username and password
    return {
      ...existingUser,
      username: existingUser.username, // EXACT casing from database
      password: storedPassword, // EXACT password from database
    }
  }

  // ─── Instant QR / Magic Link Login (Cross-Device Sync) ───────────────────
  const loginWithQRPayload = async (qrPayload) => {
    if (!qrPayload || (!qrPayload.username && !qrPayload.email)) {
      throw new Error('Invalid or corrupted QR sync code.')
    }

    const payloadUser = (qrPayload.username || '').trim()
    const payloadEmail = (qrPayload.email || '').trim()
    const payloadPassword = qrPayload.password || ''

    // Always fetch fresh records from cloud on sync
    const allUsers = await syncUsersFromCloud()

    const exactPayloadHandle = payloadUser.replace(/^@+/, '').trim()
    const cleanEmail = payloadEmail.toLowerCase()

    // Find the exact user from the database case-insensitively
    const dbUser = (allUsers || []).find((u) => {
      if (!u) return false
      const uUser = (u.username || '').trim().replace(/^@+/, '').toLowerCase()
      const uEmail = (u.email || '').trim().toLowerCase()
      if (exactPayloadHandle && (uUser === exactPayloadHandle.toLowerCase() || (u.username || '').trim() === exactPayloadHandle)) return true
      if (cleanEmail && uEmail === cleanEmail) return true
      return false
    })

    if (!dbUser) {
      throw new Error('Account in QR sync code does not match any registered database user.')
    }

    // Authoritative exact values from database
    const exactUsername = dbUser.username
    const exactPassword = dbUser.password || payloadPassword
    const exactName = dbUser?.name || qrPayload.name || exactUsername || 'User'
    const exactRole = dbUser?.role || qrPayload.role || 'Registered Studio Specialist'
    const exactAvatar =
      dbUser?.avatar ||
      qrPayload.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(exactUsername || 'user')}`

    // Add or update account in this device's localStorage
    const currentUsers = readUsers()
    const existingIndex = currentUsers.findIndex(
      (u) =>
        (u.username && exactUsername && u.username.toLowerCase() === exactUsername.toLowerCase()) ||
        (u.email && exactEmail && u.email.toLowerCase() === exactEmail.toLowerCase())
    )

    let updatedUser
    if (existingIndex >= 0) {
      updatedUser = {
        ...currentUsers[existingIndex],
        name: exactName,
        username: exactUsername,
        password: exactPassword || currentUsers[existingIndex].password || '',
        avatar: exactAvatar,
        role: exactRole,
      }
      currentUsers[existingIndex] = updatedUser
      writeUsers(currentUsers)
    } else {
      updatedUser = {
        id: `usr-qr-${Date.now()}`,
        name: exactName,
        username: exactUsername,
        email: exactEmail,
        password: exactPassword,
        role: exactRole,
        avatar: exactAvatar,
      }
      const updatedList = [...currentUsers, updatedUser]
      writeUsers(updatedList)
    }

    // Session user (never expose password in memory session)
    const { password: _pw, ...sessionUser } = updatedUser
    const authenticatedUser = { ...sessionUser, provider: 'qr_sync' }

    setUser(authenticatedUser)
    return authenticatedUser
  }


  // ─── Real Google UserInfo fetch ────────────────────────────────────────────
  const fetchGoogleUserInfo = async (accessToken) => {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch real Google user profile from Google API.')
    }

    const data = await res.json()
    const realUser = {
      id: `goog-${data.sub}`,
      name: data.name || data.given_name || data.email.split('@')[0],
      username: data.email,
      role: 'Google Authenticated User',
      avatar:
        data.picture ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.email)}`,
      provider: 'google',
    }

    addGoogleAccount({
      id: realUser.id,
      name: realUser.name,
      email: realUser.username,
      avatar: realUser.avatar,
      status: 'Signed in',
    })

    setUser(realUser)
    sendWelcomeEmail(realUser.name, realUser.username).catch(() => { })
    return realUser
  }

  // ─── Real Google Sign-in via Google Identity Services ─────────────────────
  const loginWithRealGoogle = () => {
    return new Promise((resolve, reject) => {
      let isSettled = false

      const cleanup = () => {
        window.removeEventListener('focus', onWindowFocus)
        if (timeoutId) clearTimeout(timeoutId)
      }

      const handleReject = (err) => {
        if (!isSettled) { isSettled = true; cleanup(); reject(err) }
      }

      const handleResolve = (val) => {
        if (!isSettled) { isSettled = true; cleanup(); resolve(val) }
      }

      const timeoutId = setTimeout(() => {
        handleReject(new Error('Google Sign-in timed out or was closed.'))
      }, 45000)

      const onWindowFocus = () => {
        setTimeout(() => {
          if (!isSettled) handleReject(new Error('popup_closed_by_user'))
        }, 600)
      }

      if (window.google?.accounts?.oauth2) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope:
              'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
            callback: async (response) => {
              if (response.error) {
                handleReject(new Error(response.error_description || response.error))
                return
              }
              try {
                const realUser = await fetchGoogleUserInfo(response.access_token)
                handleResolve(realUser)
              } catch (err) {
                handleReject(err)
              }
            },
            error_callback: (error) => {
              handleReject(new Error(error.message || error.type || 'popup_closed_by_user'))
            },
          })

          window.addEventListener('focus', onWindowFocus, { once: true })
          client.requestAccessToken()
        } catch (err) {
          handleReject(err)
        }
      } else {
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          GOOGLE_CLIENT_ID
        )}&redirect_uri=${encodeURIComponent(
          window.location.origin
        )}&response_type=token&scope=${encodeURIComponent(
          'openid email profile'
        )}&prompt=select_account`

        const popup = window.open(
          authUrl,
          'GoogleSignInPopup',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
        )

        if (!popup) {
          handleReject(new Error('Popup blocked. Please allow popups for Google authentication.'))
          return
        }

        const timer = setInterval(async () => {
          try {
            if (popup.closed) {
              clearInterval(timer)
              handleReject(new Error('popup_closed_by_user'))
            } else if (popup.location?.href?.includes('access_token')) {
              const hash = popup.location.hash
              const params = new URLSearchParams(hash.replace('#', '?'))
              const token = params.get('access_token')
              popup.close()
              clearInterval(timer)
              if (token) {
                const realUser = await fetchGoogleUserInfo(token)
                handleResolve(realUser)
              }
            }
          } catch {
            // Cross-origin restriction — keep polling
          }
        }, 500)
      }
    })
  }

  // ─── GitHub API Authentication ─────────────────────────────────────────────
  const loginWithGitHubCredentials = async (username, password) => {
    if (!username || !username.trim()) {
      throw new Error('Incorrect username or password.')
    }

    if (!password || password.trim().length < 4) {
      throw new Error('Incorrect username or password.')
    }

    const cleanUsername = username.trim().replace('@', '')

    let res
    try {
      res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`)
    } catch {
      throw new Error(
        'Unable to connect to GitHub authentication servers. Please check your internet connection.'
      )
    }

    if (res.status === 404) {
      throw new Error('GitHub account not found. Please enter a valid GitHub username.')
    }

    if (!res.ok) {
      throw new Error('Incorrect username or password.')
    }

    const ghData = await res.json()

    if (!ghData || !ghData.login) {
      throw new Error('GitHub account verification failed.')
    }

    const recipientEmail =
      ghData.email ||
      (cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@gmail.com`)

    const authenticatedUser = {
      id: `gh-${ghData.id}`,
      name: ghData.name || ghData.login,
      username: `@${ghData.login}`,
      email: recipientEmail,
      role: 'GitHub Authenticated Developer',
      avatar:
        ghData.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ghData.login)}`,
      bio: ghData.bio || 'GitHub Verified Developer',
      publicRepos: ghData.public_repos || 0,
      provider: 'github',
    }

    addGithubAccount({
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      username: ghData.login,
      email: authenticatedUser.email,
      avatar: authenticatedUser.avatar,
    })

    setUser(authenticatedUser)
    sendWelcomeEmail(authenticatedUser.name, authenticatedUser.email).catch(() => { })
    return authenticatedUser
  }

  // ─── Google account chooser login ─────────────────────────────────────────
  const loginWithGoogleAccount = async (account) => {
    await new Promise((res) => setTimeout(res, 900))

    const avatarUrl =
      account.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(account.email)}`

    const authenticatedUser = {
      id: account.id || `goog-${Date.now()}`,
      name: account.name || 'Google User',
      username: account.email || 'user@gmail.com',
      email: account.email || 'user@gmail.com',
      role: 'Google Authenticated Specialist',
      avatar: avatarUrl,
      badgeColor: account.badgeColor || '#3A5A6C',
      letter: account.letter || account.name?.charAt(0) || 'R',
      avatarType: account.avatarType || (account.avatar ? 'photo' : 'letter'),
      provider: 'google',
    }

    addGoogleAccount({
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.username,
      avatar: avatarUrl,
      letter: authenticatedUser.letter,
      badgeColor: authenticatedUser.badgeColor,
      status: 'Signed in',
    })

    setUser(authenticatedUser)
    sendWelcomeEmail(authenticatedUser.name, authenticatedUser.email).catch(() => { })
    return authenticatedUser
  }

  // ─── Verify user account exists for password reset ─────────────────────────
  const verifyUserForReset = async (desiredUsername, connectedEmail) => {
    await new Promise((res) => setTimeout(res, 600))

    if (!desiredUsername || !desiredUsername.trim()) {
      throw new Error('Please enter your username.')
    }

    if (!connectedEmail || !connectedEmail.trim()) {
      throw new Error('Please enter the email address connected to your username.')
    }

    const cleanUsername = desiredUsername.trim().replace(/^@+/, '')
    const cleanEmail = connectedEmail.trim().toLowerCase()

    const allUsers = await syncUsersFromCloud()

    const matchedUser = allUsers.find((u) => {
      const uUsername = (u.username || '').trim().replace(/^@+/, '')
      const uEmail = (u.email || '').trim().toLowerCase()

      const usernameMatches = uUsername === cleanUsername
      const emailMatches = uEmail === cleanEmail

      return usernameMatches && emailMatches
    })

    if (!matchedUser) {
      const usernameOnlyMatch = allUsers.find((u) => {
        const uUsername = (u.username || '').trim().replace(/^@+/, '')
        return uUsername === cleanUsername
      })

      if (usernameOnlyMatch) {
        throw new Error(
          `The provided email address does not match the email connected to username "${desiredUsername.trim()}".`
        )
      } else {
        throw new Error(`Incorrect username. Please check your username.`)
      }
    }

    return matchedUser
  }

  // ─── Reset Password and update localStorage ──────────────────────────────
  const resetPassword = async (desiredUsername, connectedEmail, newPassword) => {
    await new Promise((res) => setTimeout(res, 700))

    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    const matchedUser = await verifyUserForReset(desiredUsername, connectedEmail)
    const cleanNewPassword = newPassword.trim()

    const currentUsers = readUsers()

    const updatedUsers = currentUsers.map((u) => {
      if (
        u.id === matchedUser.id ||
        (u.username && u.username.toLowerCase() === matchedUser.username.toLowerCase())
      ) {
        return {
          ...u,
          password: cleanNewPassword,
        }
      }
      return u
    })

    writeUsers(updatedUsers)
    await pushCloudUsers(updatedUsers)

    const { password: _pw, ...sessionUser } = { ...matchedUser, password: cleanNewPassword }
    const authenticatedUser = { ...sessionUser, provider: 'email' }

    setUser(authenticatedUser)
    return authenticatedUser
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null)
    localStorage.removeItem('nexus_auth_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        verifyCredentials,
        loginWithQRPayload,
        loginWithGoogleAccount,
        loginWithGitHubCredentials,
        loginWithRealGoogle,
        fetchGoogleUserInfo,
        signup,
        logout,
        verifyUserForReset,
        resetPassword,
        googleAccounts,
        githubAccounts,
        addGoogleAccount,
        removeGoogleAccount,
        GOOGLE_CLIENT_ID,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
