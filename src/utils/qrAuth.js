/**
 * QR Code Authentication & Cross-Device Account Sync Utility
 * Generates and parses secure magic-login QR codes and direct links
 * with real-time cross-device pairing notifications (zero database required).
 */

function toBase64(str) {
  try {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return btoa(unescape(encodeURIComponent(str)))
    }
  } catch { /* fallback */ }
  return Buffer.from(str, 'utf8').toString('base64')
}

function fromBase64(b64) {
  try {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return decodeURIComponent(escape(atob(b64)))
    }
  } catch { /* fallback */ }
  return Buffer.from(b64, 'base64').toString('utf8')
}

export function generateQRSessionId() {
  return `nexus_sync_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

function getStoredAccountForSync(account) {
  if (!account) return null
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('nexus_registered_users') : null
    if (raw) {
      const users = JSON.parse(raw)
      if (Array.isArray(users)) {
        const accUser = (account.username || '').trim().replace(/^@+/, '')
        const accEmail = (account.email || '').trim().toLowerCase()
        const isEmail = accUser.includes('@') && accUser.includes('.')
        const found = users.find((u) => {
          if (!u) return false
          const uUser = (u.username || '').trim().replace(/^@+/, '')
          const uEmail = (u.email || '').trim().toLowerCase()
          if (accUser && uUser === accUser) return true
          if (isEmail && accEmail && uEmail === accEmail) return true
          if (account.id && u.id && u.id === account.id) return true
          return false
        })
        if (found) return found
      }
    }
  } catch { /* ignore */ }
  return null
}

function getStoredPasswordForAccount(account) {
  if (account && account.password) return account.password
  const matched = getStoredAccountForSync(account)
  return matched && matched.password ? matched.password : ''
}

export function generateQRAuthUrl(account, customSessionId = null) {
  if (!account || (!account.username && !account.email)) {
    return { url: '', sessionId: '' }
  }

  // Look up authoritative record from database to preserve exact username casing and password
  const dbMatch = getStoredAccountForSync(account)
  const exactUsername = (dbMatch?.username || account.username || '').trim()
  const exactPassword = (dbMatch?.password || account.password || getStoredPasswordForAccount(account) || '').trim()
  const exactName = dbMatch?.name || account.name || exactUsername || 'User'
  const exactEmail = (dbMatch?.email || account.email || '').trim()
  const exactRole = dbMatch?.role || account.role || 'Registered Studio Specialist'
  const exactAvatar =
    dbMatch?.avatar ||
    account.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(exactUsername || 'user')}`

  // Strict requirement: Never generate a magic login QR code without a verified password
  if (!exactPassword) {
    return { url: '', sessionId: '' }
  }

  const sessionId = customSessionId || generateQRSessionId()

  const payload = {
    v: 'nexus_qr_1',
    sid: sessionId,
    u: exactUsername, // EXACT same username from database
    e: exactEmail,
    n: exactName,
    r: exactRole,
    p: exactPassword, // EXACT same password from database
    a: exactAvatar,
    ts: Date.now(),
  }

  try {
    const jsonStr = JSON.stringify(payload)
    const encoded = toBase64(jsonStr)
    const origin = typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : 'https://aivonix-frontend-doy2.onrender.com'
    const url = `${origin}/login?qr_auth=${encodeURIComponent(encoded)}`
    return { url, sessionId }
  } catch (err) {
    console.error('Error generating QR auth payload:', err)
    return { url: '', sessionId }
  }
}

export function parseQRAuthPayload(searchOrUrl) {
  if (!searchOrUrl) return null

  try {
    let rawEncoded = ''

    if (searchOrUrl.includes('qr_auth=')) {
      const queryString = searchOrUrl.includes('?') ? searchOrUrl.split('?')[1] : searchOrUrl
      const params = new URLSearchParams(queryString)
      rawEncoded = params.get('qr_auth') || ''
    } else {
      rawEncoded = searchOrUrl
    }

    if (!rawEncoded) return null

    const jsonStr = fromBase64(decodeURIComponent(rawEncoded))
    const data = JSON.parse(jsonStr)

    if (data && (data.u || data.e)) {
      return {
        id: data.id || `usr-qr-${Date.now()}`,
        sessionId: data.sid || '',
        name: data.n || data.u || 'User',
        username: data.u || '',
        email: data.e || '',
        password: data.p || '',
        role: data.r || 'Registered Studio Specialist',
        avatar: data.a || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.u || 'user')}`,
        timestamp: data.ts || 0,
      }
    }
  } catch (err) {
    console.error('Error decoding QR auth payload:', err)
  }

  return null
}

/**
 * Notify Desktop that Mobile successfully scanned and logged in
 */
export async function notifyDesktopLoginSuccess(sessionId, account) {
  if (!sessionId) return false

  try {
    const res = await fetch(`https://ntfy.sh/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'DEVICE_LOGIN_SUCCESS',
        username: account.username,
        name: account.name || account.username,
        device: 'Mobile Phone',
        timestamp: Date.now(),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Desktop listens for the real-time notification from mobile phone
 */
export function listenForMobileLoginSuccess(sessionId, onLoginSuccess) {
  if (!sessionId || typeof window === 'undefined' || !window.EventSource) {
    return () => {}
  }

  let eventSource = null
  let isClosed = false

  try {
    eventSource = new EventSource(`https://ntfy.sh/${sessionId}/sse`)

    eventSource.onmessage = (event) => {
      if (isClosed) return
      try {
        const payload = JSON.parse(event.data)
        // Check if message body contains DEVICE_LOGIN_SUCCESS
        let messageData = payload
        if (payload.message) {
          try {
            messageData = JSON.parse(payload.message)
          } catch {
            messageData = { event: payload.message }
          }
        }

        if (messageData && (messageData.event === 'DEVICE_LOGIN_SUCCESS' || payload.event === 'message')) {
          onLoginSuccess(messageData)
        }
      } catch {
        /* ignore parse errors */
      }
    }

    eventSource.onerror = () => {
      // EventSource automatically retries
    }
  } catch (err) {
    console.error('Failed to initialize EventSource listener:', err)
  }

  return () => {
    isClosed = true
    if (eventSource) {
      eventSource.close()
    }
  }
}
