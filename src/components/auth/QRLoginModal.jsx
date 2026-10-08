import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { generateQRAuthUrl, listenForMobileLoginSuccess } from '../../utils/qrAuth'
import styles from './QRLoginModal.module.css'

// Official Synapse Analytics Brand Logo SVG for Center of QR Code
const PROJECT_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <linearGradient id="fav-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#28E0B0"/>
      <stop offset="100%" stop-color="#4A7FE8"/>
    </linearGradient>
    <linearGradient id="fav-blue" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5B8CF0" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#10141D" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="fav-top" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4A7FE8" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#28E0B0" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="80" height="80" rx="16" fill="#0B0E14" stroke="#00E5FF" stroke-width="2.5" stroke-opacity="0.9"/>
  <polygon points="40,8 70,24 70,56 40,72 10,56 10,24" fill="none" stroke="url(#fav-cyan)" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="40,20 60,30 40,40 20,30" fill="url(#fav-top)" stroke="#28E0B0" stroke-width="1.2" stroke-opacity="0.8"/>
  <polygon points="20,30 40,40 40,60 20,50" fill="url(#fav-blue)" stroke="#4A7FE8" stroke-width="1.2" stroke-opacity="0.8"/>
  <polygon points="40,40 60,30 60,50 40,60" fill="url(#fav-cyan)" fill-opacity="0.35" stroke="url(#fav-cyan)" stroke-width="1.2" stroke-opacity="0.9"/>
  <circle cx="40" cy="8" r="3" fill="#F5F3EE"/>
  <circle cx="70" cy="24" r="3" fill="#F5F3EE"/>
  <circle cx="70" cy="56" r="3" fill="#F5F3EE"/>
  <circle cx="40" cy="72" r="3" fill="#F5F3EE"/>
  <circle cx="10" cy="56" r="3" fill="#F5F3EE"/>
  <circle cx="10" cy="24" r="3" fill="#F5F3EE"/>
  <circle cx="40" cy="40" r="7" fill="#28E0B0"/>
  <circle cx="40" cy="40" r="3" fill="#FFFFFF"/>
</svg>
`)}`

export default function QRLoginModal({ isOpen, onClose, account, title = 'Instant Mobile Login Sync' }) {
  const [copied, setCopied] = useState(false)
  const [loginConfirmed, setLoginConfirmed] = useState(false)
  const [confirmedData, setConfirmedData] = useState(null)

  const targetAccount = useMemo(() => {
    if (!account || (!account.username && !account.email)) return null
    return account
  }, [account])

  // Generate a unique session ID and QR URL when modal opens
  const { url: qrUrl, sessionId } = useMemo(() => {
    if (!isOpen || !targetAccount) return { url: '', sessionId: '' }
    return generateQRAuthUrl(targetAccount)
  }, [isOpen, targetAccount?.username, targetAccount?.email, targetAccount?.password])

  // Reset confirmation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoginConfirmed(false)
      setConfirmedData(null)
    }
  }, [isOpen])

  // Listen in real-time for mobile scan confirmation
  useEffect(() => {
    if (!isOpen || !sessionId) return

    const unsubscribe = listenForMobileLoginSuccess(sessionId, (data) => {
      setLoginConfirmed(true)
      setConfirmedData(data)
    })

    return () => unsubscribe()
  }, [isOpen, sessionId])

  if (!isOpen) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const el = document.createElement('textarea')
      el.value = qrUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={`${styles.modalCard} ${loginConfirmed ? styles.cardSuccess : ''}`}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={`${styles.iconWrap} ${loginConfirmed ? styles.iconWrapSuccess : ''}`}>
                {loginConfirmed ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                )}
              </div>
              <div>
                <h3 className={styles.title}>
                  {loginConfirmed ? 'Device Connected Successfully!' : title}
                </h3>
                <p className={styles.subtitle}>
                  {loginConfirmed
                    ? 'Your mobile phone is now logged in to this account'
                    : 'Scan on your mobile phone for 1-second instant login'}
                </p>
              </div>
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          {/* REAL-TIME SUCCESS VIEW */}
          {loginConfirmed ? (
            <motion.div
              className={styles.successContainer}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className={styles.successPulseCircle}>
                <div className={styles.successCheckIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              <div className={styles.successHeadText}>
                Login Successful on Mobile!
              </div>

              <div className={styles.successDetailsCard}>
                <div className={styles.successRow}>
                  <span className={styles.detailLabel}>📱 Connected Device</span>
                  <span className={styles.detailValue}>Mobile Phone (Active)</span>
                </div>
                <div className={styles.successRow}>
                  <span className={styles.detailLabel}>👤 Authenticated User</span>
                  <span className={styles.detailValue}>
                    @{confirmedData?.username || targetAccount.username}
                  </span>
                </div>
                <div className={styles.successRow}>
                  <span className={styles.detailLabel}>⚡ Status</span>
                  <span className={styles.statusLiveBadge}>🟢 SYNCHRONIZED</span>
                </div>
              </div>

              <p className={styles.successHint}>
                You can now freely use the Studio on both your desktop and phone simultaneously.
              </p>

              <button
                type="button"
                className={styles.successDoneBtn}
                onClick={onClose}
              >
                Done
              </button>
            </motion.div>
          ) : !targetAccount || !qrUrl ? (
            <div className={styles.unauthorizedNotice}>
              <div className={styles.unauthorizedIcon}>🔒</div>
              <h4 className={styles.unauthorizedTitle}>Credentials Verification Required</h4>
              <p className={styles.unauthorizedDesc}>
                A valid username and password registered in the Supabase database is required to generate the mobile login QR scanner.
              </p>
              <button type="button" className={styles.unauthorizedBtn} onClick={onClose}>
                ← Back to Sign In
              </button>
            </div>
          ) : (
            /* QR SCANNING VIEW */
            <>
              {/* Account Banner */}
              {targetAccount && (
                <div className={styles.accountBanner}>
                  <img
                    src={targetAccount.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetAccount.username || 'user')}`}
                    alt={targetAccount.name || targetAccount.username}
                    className={styles.accountAvatar}
                  />
                  <div className={styles.accountInfo}>
                    <span className={styles.accountName}>{targetAccount.name || targetAccount.username}</span>
                    <span className={styles.accountMeta}>
                      @{targetAccount.username} {targetAccount.email ? `• ${targetAccount.email}` : ''}
                    </span>
                  </div>
                  <span className={styles.readyBadge}>🟢 READY TO SCAN</span>
                </div>
              )}

              {/* QR Container with Cyber Scanner Effect */}
              <div className={styles.qrSection}>
                <div className={styles.qrFrame}>
                  <div className={styles.laserScan}></div>
                  <div className={styles.cornerTL}></div>
                  <div className={styles.cornerTR}></div>
                  <div className={styles.cornerBL}></div>
                  <div className={styles.cornerBR}></div>
                  
                  <div className={styles.qrCodeWrapper}>
                    <QRCodeSVG
                      value={qrUrl}
                      size={210}
                      level="H"
                      includeMargin={true}
                      bgColor="#0D1117"
                      fgColor="#00E5FF"
                      imageSettings={{
                        src: PROJECT_LOGO_SVG,
                        x: undefined,
                        y: undefined,
                        height: 44,
                        width: 44,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.instructions}>
                  <div className={styles.step}>
                    <span className={styles.stepNum}>1</span>
                    <span>Open standard <strong>Phone Camera</strong> or QR scanner</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNum}>2</span>
                    <span>Point camera at this screen</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNum}>3</span>
                    <span>Tap the link banner to <strong>log in instantly</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className={styles.footer}>
                <button
                  type="button"
                  className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Link Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      <span>Copy Magic Mobile Link</span>
                    </>
                  )}
                </button>

                <button type="button" className={styles.doneBtn} onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
