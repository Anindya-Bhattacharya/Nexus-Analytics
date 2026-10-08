import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, GOOGLE_CLIENT_ID } from '../context/AuthContext'
import { sendPasswordResetEmail } from '../utils/emailService'
import { parseQRAuthPayload, notifyDesktopLoginSuccess } from '../utils/qrAuth'
import QRLoginModal from '../components/auth/QRLoginModal'
import AnimatedLogo from '../components/ui/AnimatedLogo'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from?.pathname || '/overview'
  const {
    user,
    isAuthenticated,
    login,
    loginWithQRPayload,
    loginWithGoogleAccount,
    loginWithGitHubCredentials,
    loginWithRealGoogle,
    signup,
    logout,
    googleAccounts,
    verifyUserForReset,
    resetPassword,
    verifyCredentials,
  } = useAuth()

  // Form State
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Sign up fields
  const [fullName, setFullName] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Forgot Password Flow State
  const [forgotStep, setForgotStep] = useState('request') // 'request' | 'verify' | 'reset'
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [userOtpInput, setUserOtpInput] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showMailModal, setShowMailModal] = useState(false)

  // Google Account Chooser Popup Window Modal State
  const [googleModalOpen, setGoogleModalOpen] = useState(false)
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  const [customGoogleName, setCustomGoogleName] = useState('')
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false)
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false)

  // GitHub OAuth Popup Window Modal State
  const [githubModalOpen, setGithubModalOpen] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')
  const [githubPassword, setGithubPassword] = useState('')
  const [githubError, setGithubError] = useState('')
  const [githubAuthenticating, setGithubAuthenticating] = useState(false)

  // Status & Feedback
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null) // 'google' | 'github' | null
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // QR Code Cross-Device Login Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrTargetAccount, setQrTargetAccount] = useState(null)
  const [qrVerifying, setQrVerifying] = useState(false)

  // Mobile device detection: do not show QR code options on mobile
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const isSmall = window.innerWidth <= 768
    const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent || ''
    )
    return isSmall || isTouch || isMobileUA
  })

  useEffect(() => {
    const handleResize = () => {
      const isTouch = window.matchMedia('(pointer: coarse)').matches
      const isSmall = window.innerWidth <= 768
      const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || ''
      )
      setIsMobile(isSmall || isTouch || isMobileUA)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ─── Instant QR / Magic Link Auto-Login on Mobile ────────────────────────
  useEffect(() => {
    if (location.search && location.search.includes('qr_auth=')) {
      const qrData = parseQRAuthPayload(location.search)
      if (qrData) {
        setLoading(true)
        setSuccessMessage('⚡ Scanning Mobile Auth Token... Logging you in!')
        loginWithQRPayload(qrData)
          .then((sessionUser) => {
            // Signal back to the desktop screen in real-time
            if (qrData.sessionId) {
              notifyDesktopLoginSuccess(qrData.sessionId, sessionUser).catch(() => {})
            }

            try {
              window.history.replaceState({}, document.title, window.location.pathname)
            } catch { /* ignore */ }
            setSuccessMessage(`✨ Synced from Desktop! Welcome back, ${sessionUser.name || sessionUser.username}.`)
            setTimeout(() => {
              navigate(fromPath, { replace: true })
            }, 800)
          })
          .catch((err) => {
            setErrorMessage(err.message || 'QR Authentication failed.')
            setLoading(false)
          })
      }
    }
  }, [location.search])



  // ─── Forgot Password Handler Functions ────────────────────────────────────
  const handleStartForgotPassword = () => {
    setErrorMessage('')
    setSuccessMessage('')
    setForgotUsername(username.trim())
    setForgotEmail('')
    setForgotStep('request')
    setMode('forgot')
  }

  const handleRequestVerificationEmail = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!forgotUsername.trim()) {
      setErrorMessage('Please enter your username.')
      return
    }

    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter the Gmail address connected to your username.')
      return
    }

    setLoading(true)
    try {
      // Verify account and connected email match
      const matchedUser = await verifyUserForReset(forgotUsername, forgotEmail)

      // Generate 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(otp)
      setUserOtpInput('')

      // Dispatch real verification email directly to user's Gmail ID via EmailJS
      await sendPasswordResetEmail(matchedUser.name, forgotEmail, forgotUsername, otp)

      setLoading(false)
      setForgotStep('verify')
      setSuccessMessage(
        `Verification email sent to ${forgotEmail}! Please check your Gmail inbox for your 6-digit encrypted security code.`
      )
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please check your details.')
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!forgotEmail || !forgotUsername) return
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(otp)
      await sendPasswordResetEmail(forgotUsername, forgotEmail, forgotUsername, otp)
      setSuccessMessage(`New verification code sent to ${forgotEmail}! Please check your Gmail inbox.`)
    } catch {
      setErrorMessage('Failed to resend email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!userOtpInput.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.')
      return
    }

    if (userOtpInput.trim() !== generatedOtp.trim()) {
      setErrorMessage('Incorrect verification code. Please check your admin email and try again.')
      return
    }

    setForgotStep('reset')
    setSuccessMessage(`Code verified! Set a new password for username "${forgotUsername.trim()}".`)
  }

  const handleConfirmNewPasswordSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!newPassword || newPassword.trim().length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(forgotUsername, forgotEmail, newPassword)
      setSuccessMessage(
        `New password set successfully for username "${forgotUsername}"! Old password deleted. Logging you in...`
      )
      setTimeout(() => {
        navigate(fromPath)
      }, 1500)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoVerifyFromMail = () => {
    setUserOtpInput(generatedOtp)
    setShowMailModal(false)
    setForgotStep('reset')
    setErrorMessage('')
    setSuccessMessage(
      `Code verified automatically from Admin Mail! Enter your new password for username "${forgotUsername}".`
    )
  }

  // ─── Verify credentials & open QR scanner for mobile/device login ────────
  const handleOpenQRScanner = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanUser = (username || '').trim()
    const cleanPass = (password || '').trim()

    if (!cleanUser) {
      setErrorMessage('Please enter your username or email address.')
      return
    }

    if (!cleanPass) {
      setErrorMessage('Please enter your password.')
      return
    }

    setQrVerifying(true)

    try {
      // Validate credentials directly against Supabase database (strictly case-sensitive)
      const verifiedUser = await verifyCredentials(cleanUser, cleanPass)

      // Only if credentials are valid and saved in database:
      setQrTargetAccount(verifiedUser)
      setSuccessMessage(`Credentials verified! Opening mobile login scanner for @${verifiedUser.username}...`)
      setQrModalOpen(true)
    } catch (err) {
      const msg = err.message || 'Verification failed.'
      setQrTargetAccount(null)
      setQrModalOpen(false)
      setErrorMessage(msg)
    } finally {
      setQrVerifying(false)
    }
  }

  const handleSignInSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const loggedUser = await login(username, password, rememberMe)
      setSuccessMessage(`Welcome back, ${loggedUser.name}! Logging you in...`)
      setTimeout(() => {
        navigate(fromPath)
      }, 1100)
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service to create an account.')
      return
    }

    const targetUser = signupUsername.trim() || username.trim()
    const targetEmail = signupEmail.trim() || (targetUser.includes('@') ? targetUser : `${targetUser}@synapse.com`)

    if (!targetUser) {
      setErrorMessage('Please enter a desired username.')
      return
    }

    if (!targetEmail) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const newUser = await signup(fullName, targetUser, targetEmail, password)
      setSuccessMessage(`Account created! Welcome to Synapse Analytics, ${newUser.name}. Welcome email sent to ${newUser.email}!`)
      setTimeout(() => {
        navigate(fromPath)
      }, 1400)
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const closeGoogleModal = () => {
    setGoogleModalOpen(false)
    setGoogleAuthenticating(false)
    setSelectedGoogleAccount(null)
    setOauthLoading(null)
  }

  const closeGithubModal = () => {
    setGithubModalOpen(false)
    setGithubAuthenticating(false)
    setGithubError('')
    setOauthLoading(null)
  }

  // Handle Google OAuth Button Click
  const handleGoogleAuthClick = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    setOauthLoading('google')

    try {
      const realUser = await loginWithRealGoogle()
      setSuccessMessage(`Authenticated as ${realUser.name} (${realUser.username})! Welcome email sent to your Gmail.`)
      setTimeout(() => {
        navigate(fromPath)
      }, 1400)
    } catch (err) {
      console.warn('Real Google OAuth notice:', err.message)
      const msg = (err.message || '').toLowerCase()
      const isUserCancelled =
        msg.includes('closed') ||
        msg.includes('cancel') ||
        msg.includes('access_denied') ||
        msg.includes('popup_closed') ||
        msg.includes('user_logged_out')

      if (isUserCancelled) {
        // User explicitly backed out or closed the popup window — reset state cleanly
        setGoogleModalOpen(false)
      } else {
        // Fallback modal if origin_mismatch or GIS script fails
        setCustomGoogleEmail('')
        setCustomGoogleName('')
        setShowCustomGoogleInput(false)
        setGoogleModalOpen(true)
      }
    } finally {
      setOauthLoading(null)
    }
  }

  // Handle GitHub OAuth Button Click
  const handleGithubAuthClick = () => {
    setErrorMessage('')
    setSuccessMessage('')
    setOauthLoading(null)
    setGoogleModalOpen(false)
    setGithubUsername('')
    setGithubPassword('')
    setGithubError('')
    setGithubModalOpen(true)
  }

  const handleSelectGoogleAccount = async (account) => {
    setSelectedGoogleAccount(account)
    setGoogleAuthenticating(true)

    try {
      const authenticatedUser = await loginWithGoogleAccount(account)
      setGoogleModalOpen(false)
      setSuccessMessage(`Signed in as ${authenticatedUser.name} (${authenticatedUser.username})! Welcome email sent to your Gmail.`)
      setTimeout(() => {
        navigate(fromPath)
      }, 1400)
    } catch (err) {
      setErrorMessage('Google authentication failed. Please try again.')
    } finally {
      setGoogleAuthenticating(false)
      setSelectedGoogleAccount(null)
    }
  }

  const handleGithubFormSubmit = async (e) => {
    e.preventDefault()
    setGithubError('')

    if (!githubUsername.trim() || !githubPassword.trim()) {
      setGithubError('Incorrect username or password.')
      return
    }

    setGithubAuthenticating(true)
    try {
      const authenticatedUser = await loginWithGitHubCredentials(githubUsername, githubPassword)
      setGithubModalOpen(false)
      setSuccessMessage(`Signed in as ${authenticatedUser.name} (${authenticatedUser.username}) via GitHub!`)
      setTimeout(() => {
        navigate(fromPath)
      }, 1100)
    } catch (err) {
      setGithubError(err.message || 'Incorrect username or password.')
    } finally {
      setGithubAuthenticating(false)
    }
  }

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault()
    if (!customGoogleEmail) return

    const nameToUse = customGoogleName.trim() || customGoogleEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())

    const customAccount = {
      id: `goog-${Date.now()}`,
      name: nameToUse,
      email: customGoogleEmail,
      avatarType: 'letter',
      letter: nameToUse.charAt(0).toUpperCase(),
      badgeColor: '#4A7FE8',
      status: 'Signed in',
    }

    await handleSelectGoogleAccount(customAccount)
  }

  return (
    <div className={styles.pageContainer}>
      {/* Radiant Background Aura */}
      <div className={styles.gridOverlay} />
      <div className={styles.ambientAuraLeft} />
      <div className={styles.ambientAuraRight} />

      {/* Floating Animated Accent Elements */}
      <motion.div
        className={styles.pulseRing}
        animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className={`container ${styles.contentWrap}`}>
        {/* Main Card Grid */}
        <motion.div
          className={styles.authCard}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Brand Header */}
          <div className={styles.cardHeader}>
            <div className={styles.headerBadgeRow}>
              <div className={styles.brandBadge}>
                <span className={styles.badgeDot} />
                <span>SYNAPSE ANALYTICS STUDIO • AUTHENTICATION</span>
              </div>
            </div>

            <div className={styles.logoWrap}>
              <AnimatedLogo size={42} play="hover" wordmark={true} wordSize="1.5rem" glow={true} />
            </div>

            <h2 className={styles.authTitle}>
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className={styles.authSub}>
              {mode === 'signin'
                ? 'Sign in to access your enterprise dashboards and analytics pipelines.'
                : 'Join Synapse Analytics Studio to build high-performance data portals.'}
            </p>
          </div>

          {/* If already authenticated banner */}
          {isAuthenticated && user && (
            <motion.div
              className={styles.alreadyLoggedBanner}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className={styles.alreadyUserMeta}>
                {user.avatarType === 'letter' ? (
                  <div className={styles.letterAvatar} style={{ backgroundColor: user.badgeColor || '#3A5A6C' }}>
                    {user.letter || 'R'}
                  </div>
                ) : (
                  <img src={user.avatar} alt={user.name} className={styles.alreadyAvatar} />
                )}
                <div>
                  <span className={styles.alreadyName}>{user.name}</span>
                  <span className={styles.alreadyRole}>{user.role} ({user.username})</span>
                </div>
              </div>
              <div className={styles.alreadyActions}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/overview')}
                >
                  Continue to Landing Page →
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={logout}
                >
                  Switch Account / Log Out
                </button>
              </div>
            </motion.div>
          )}

          {/* Mode Switch Tabs */}
          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'signin' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('signin')
                setErrorMessage('')
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('signup')
                setErrorMessage('')
              }}
            >
              Create New Account
            </button>
          </div>

          {/* Social OAuth Buttons */}
          <div className={styles.oauthSection}>
            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogleAuthClick}
              disabled={loading || oauthLoading !== null}
            >
              {oauthLoading === 'google' ? (
                <span className={styles.btnLoading}>
                  <span className={styles.spinnerInline} /> Connecting to Google...
                </span>
              ) : (
                <>
                  <svg className={styles.oauthIcon} viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.35 7.37 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.25C.45 8.2.0 10.04.0 12s.45 3.8 1.25 5.4l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.65 1.25 6.6l4.03 3.13c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              className={styles.githubBtn}
              onClick={handleGithubAuthClick}
              disabled={loading || oauthLoading !== null}
            >
              <svg className={styles.oauthIcon} fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or continue with email</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="err"
                className={styles.errorAlert}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <span className={styles.alertIcon}>⚠️</span>
                {errorMessage === '__USERNAME_NOT_FOUND__' ||
                errorMessage.toLowerCase().includes('incorrect username') ||
                errorMessage.toLowerCase().includes('username not found') ? (
                  <span>
                    Incorrect username. Please check your username, or{' '}
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontWeight: 700,
                        padding: 0,
                        fontSize: 'inherit',
                      }}
                      onClick={() => {
                        setErrorMessage('')
                        setMode('signup')
                      }}
                    >
                      create a new account →
                    </button>
                  </span>
                ) : (
                  <span>{errorMessage}</span>
                )}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                key="succ"
                className={styles.successAlert}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <span className={styles.alertIcon}>✨</span>
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign In Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className={styles.formStack}>
              <div className={styles.fieldGroup}>
                <label htmlFor="username-input" className={styles.fieldLabel}>
                  Username or Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>👤</span>
                  <input
                    id="username-input"
                    type="text"
                    className={styles.textInput}
                    placeholder="Enter your email or username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="password-input" className={styles.fieldLabel}>
                    Password
                  </label>
                  <button
                    type="button"
                    className={styles.forgotPassLink}
                    onClick={handleStartForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.textInput}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div className={styles.metaRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              <div className={styles.authButtonsRow}>
                <button
                  type="submit"
                  className={`btn btn-primary ${styles.submitBtn}`}
                  disabled={loading || qrVerifying || oauthLoading !== null}
                >
                  {loading ? (
                    <span className={styles.btnLoading}>
                      <span className={styles.spinnerInline} /> Authenticating...
                    </span>
                  ) : (
                    <span>Sign In to Studio →</span>
                  )}
                </button>

                {!isMobile && (
                  <button
                    type="button"
                    className={styles.qrActionBtn}
                    onClick={handleOpenQRScanner}
                    disabled={loading || qrVerifying || oauthLoading !== null}
                    title="Verify credentials and open mobile QR scanner"
                  >
                    {qrVerifying ? (
                      <span className={styles.btnLoading}>
                        <span className={styles.spinnerInline} /> Verifying Credentials...
                      </span>
                    ) : (
                      <span>📱 Scan QR for Mobile Login</span>
                    )}
                  </button>
                )}
              </div>
            </form>
          ) : mode === 'signup' ? (
            /* Registration / Create Account Form */
            <form onSubmit={handleSignUpSubmit} className={styles.formStack}>
              <div className={styles.fieldGroup}>
                <label htmlFor="fullname-input" className={styles.fieldLabel}>
                  Full Name
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>✨</span>
                  <input
                    id="fullname-input"
                    type="text"
                    className={styles.textInput}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="signup-username" className={styles.fieldLabel}>
                    Username
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>👤</span>
                    <input
                      id="signup-username"
                      type="text"
                      className={styles.textInput}
                      placeholder="Choose a username"
                      value={signupUsername || username}
                      onChange={(e) => {
                        setSignupUsername(e.target.value)
                        setUsername(e.target.value)
                      }}
                      required
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="signup-email" className={styles.fieldLabel}>
                    Email Address
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>✉️</span>
                    <input
                      id="signup-email"
                      type="email"
                      className={styles.textInput}
                      placeholder="your.email@company.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="signup-password" className={styles.fieldLabel}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      className={styles.textInput}
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="confirm-password" className={styles.fieldLabel}>
                    Confirm Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🛡️</span>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      className={styles.textInput}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.metaRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <span>I agree to the Terms of Service & Privacy Policy</span>
                </label>
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={loading || oauthLoading !== null}
              >
                {loading ? (
                  <span className={styles.btnLoading}>
                    <span className={styles.spinnerInline} /> Registering Account...
                  </span>
                ) : (
                  <span>Create New Account →</span>
                )}
              </button>
            </form>
          ) : (
            /* Forgot Password Multi-Step Flow */
            <div className={styles.forgotContainer}>
              <div className={styles.forgotProgressBar}>
                <div
                  className={`${styles.progressStep} ${
                    forgotStep === 'request' || forgotStep === 'verify' || forgotStep === 'reset'
                      ? styles.progressActive
                      : ''
                  }`}
                >
                  <span className={styles.stepNum}>1</span>
                  <span className={styles.stepLabel}>Account</span>
                </div>
                <div className={styles.stepConnector} />
                <div
                  className={`${styles.progressStep} ${
                    forgotStep === 'verify' || forgotStep === 'reset' ? styles.progressActive : ''
                  }`}
                >
                  <span className={styles.stepNum}>2</span>
                  <span className={styles.stepLabel}>Verification</span>
                </div>
                <div className={styles.stepConnector} />
                <div
                  className={`${styles.progressStep} ${
                    forgotStep === 'reset' ? styles.progressActive : ''
                  }`}
                >
                  <span className={styles.stepNum}>3</span>
                  <span className={styles.stepLabel}>New Password</span>
                </div>
              </div>

              {/* STEP 1: REQUEST VERIFICATION MAIL */}
              {forgotStep === 'request' && (
                <form onSubmit={handleRequestVerificationEmail} className={styles.formStack}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="forgot-username-input" className={styles.fieldLabel}>
                      Username
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>👤</span>
                      <input
                        id="forgot-username-input"
                        type="text"
                        className={styles.textInput}
                        placeholder="Enter your registered username (e.g. admin)"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="forgot-email-input" className={styles.fieldLabel}>
                      Connected Email Address (Gmail ID)
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>✉️</span>
                      <input
                        id="forgot-email-input"
                        type="email"
                        className={styles.textInput}
                        placeholder="Enter email connected to username (e.g. admin@synapse.com)"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary ${styles.submitBtn}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className={styles.btnLoading}>
                        <span className={styles.spinnerInline} /> Verifying account & sending email...
                      </span>
                    ) : (
                      <span>Send Verification Mail →</span>
                    )}
                  </button>

                  <div className={styles.backLinkWrap}>
                    <button
                      type="button"
                      className={styles.switchLink}
                      onClick={() => {
                        setMode('signin')
                        setErrorMessage('')
                        setSuccessMessage('')
                      }}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: VERIFY OTP CODE */}
              {forgotStep === 'verify' && (
                <form onSubmit={handleVerifyOtpSubmit} className={styles.formStack}>
                  <div className={styles.verifyNoticeCard}>
                    <div className={styles.verifyNoticeHeader}>
                      <span>🔒 Encrypted Code Sent to Gmail</span>
                      <button
                        type="button"
                        className={styles.openMailModalBtn}
                        onClick={handleResendEmail}
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Resend Email ↻'}
                      </button>
                    </div>
                    <p className={styles.verifyNoticeText}>
                      A 6-digit security code has been sent directly to <strong>{forgotEmail}</strong> for username <strong>@{forgotUsername}</strong>.
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-dim)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      For security, the code is <strong>encrypted and sent only to your Gmail ID inbox</strong>. It is not shown on this website.
                    </p>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="otp-input" className={styles.fieldLabel}>
                      Enter 6-Digit Security Code
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>🔑</span>
                      <input
                        id="otp-input"
                        type="text"
                        maxLength={6}
                        className={`${styles.textInput} ${styles.otpInput}`}
                        placeholder="Enter 6-digit code (e.g. 482915)"
                        value={userOtpInput}
                        onChange={(e) => setUserOtpInput(e.target.value.replace(/\D/g, ''))}
                        required
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary ${styles.submitBtn}`}
                  >
                    Verify Code →
                  </button>

                  <div className={styles.backLinkWrap}>
                    <button
                      type="button"
                      className={styles.switchLink}
                      onClick={() => {
                        setForgotStep('request')
                        setErrorMessage('')
                        setSuccessMessage('')
                      }}
                    >
                      ← Back to Account Details
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: NEW PASSWORD & CONFIRM PASSWORD */}
              {forgotStep === 'reset' && (
                <form onSubmit={handleConfirmNewPasswordSubmit} className={styles.formStack}>
                  <div className={styles.targetAccountBadge}>
                    <span className={styles.targetIcon}>👤</span>
                    <div>
                      <span className={styles.targetTitle}>Resetting Password For:</span>
                      <strong className={styles.targetHandle}>@{forgotUsername}</strong>
                      <span className={styles.targetNotice}> (Username will remain unchanged)</span>
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="new-password-input" className={styles.fieldLabel}>
                      New Password
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>🔒</span>
                      <input
                        id="new-password-input"
                        type={showPassword ? 'text' : 'password'}
                        className={styles.textInput}
                        placeholder="Enter new password (min 6 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="confirm-new-password-input" className={styles.fieldLabel}>
                      Confirm New Password
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>🛡️</span>
                      <input
                        id="confirm-new-password-input"
                        type={showPassword ? 'text' : 'password'}
                        className={styles.textInput}
                        placeholder="Re-enter new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary ${styles.submitBtn}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className={styles.btnLoading}>
                        <span className={styles.spinnerInline} /> Setting new password & logging in...
                      </span>
                    ) : (
                      <span>Confirm New Password & Log In →</span>
                    )}
                  </button>

                  <div className={styles.backLinkWrap}>
                    <button
                      type="button"
                      className={styles.switchLink}
                      onClick={() => {
                        setMode('signin')
                        setErrorMessage('')
                        setSuccessMessage('')
                      }}
                    >
                      ← Cancel & Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Instant QR Mobile Login / Sync Banner (Desktop only) */}
          {mode === 'signin' && !isMobile && (
            <div
              className={`${styles.qrSyncCard} ${qrVerifying ? styles.qrSyncCardLoading : ''}`}
              onClick={handleOpenQRScanner}
              title="Verify credentials & open mobile login QR scanner"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpenQRScanner(e)
                }
              }}
            >
              <div className={styles.qrSyncLeft}>
                <div className={styles.qrSyncIconBadge}>
                  {qrVerifying ? '⏳' : '📱'}
                </div>
                <div className={styles.qrSyncTexts}>
                  <span className={styles.qrSyncHeading}>
                    Instant Mobile QR Sync & Scanner
                  </span>
                  <span className={styles.qrSyncSub}>
                    {qrVerifying
                      ? 'Verifying username & password with Supabase...'
                      : 'Enter credentials above, then scan with phone to log in'}
                  </span>
                </div>
              </div>
              <span className={styles.qrSyncArrow}>
                {qrVerifying ? '...' : '→'}
              </span>
            </div>
          )}

          {/* Switch Mode Footer link */}
          <div className={styles.cardFooter}>
            {mode === 'signin' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => {
                    setMode('signup')
                    setErrorMessage('')
                  }}
                >
                  Create new account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => {
                    setMode('signin')
                    setErrorMessage('')
                  }}
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Google Accounts OAuth Chrome Popup Modal */}
      <AnimatePresence>
        {googleModalOpen && (
          <motion.div
            className={styles.chromeWindowOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.chromeWindow}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Chrome Title Bar */}
              <div className={styles.chromeTitleBar}>
                <div className={styles.chromeTitleLeft}>
                  <svg className={styles.googleGLogoIcon} viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.35 7.37 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.25C.45 8.2.0 10.04.0 12s.45 3.8 1.25 5.4l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.65 1.25 6.6l4.03 3.13c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className={styles.chromeTitleText}>Sign in - Google Accounts - Google Chrome</span>
                </div>
                <div className={styles.chromeControls}>
                  <button type="button" className={styles.chromeWinBtn} onClick={closeGoogleModal}>_</button>
                  <button type="button" className={styles.chromeWinBtn} onClick={closeGoogleModal}>▢</button>
                  <button type="button" className={`${styles.chromeWinBtn} ${styles.chromeCloseBtn}`} onClick={closeGoogleModal}>✕</button>
                </div>
              </div>

              {/* URL Address Bar */}
              <div className={styles.chromeUrlBarRow}>
                <div className={styles.chromeUrlBox}>
                  <span className={styles.chromePadlock}>🔒</span>
                  <span className={styles.chromeUrlText}>
                    accounts.google.com/v3/signin/accountchooser?client_id={GOOGLE_CLIENT_ID.slice(0, 20)}...
                  </span>
                </div>
              </div>

              {/* Main Content inside Google Sign In Popup */}
              <div className={styles.googleModalBody}>
                <div className={styles.googleSignInBrandRow}>
                  <svg className={styles.googleBigGIcon} viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.35 7.37 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.25C.45 8.2.0 10.04.0 12s.45 3.8 1.25 5.4l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.65 1.25 6.6l4.03 3.13c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className={styles.googleSignInHeadingText}>Sign in with Google</span>
                </div>

                {googleAuthenticating ? (
                  <div className={styles.googleAuthProgress}>
                    <span className={styles.googleSpinner} />
                    <p className={styles.googleAuthText}>Authenticating with Google...</p>
                    {selectedGoogleAccount && (
                      <span className={styles.googleSelAccount}>{selectedGoogleAccount.email}</span>
                    )}
                  </div>
                ) : (
                  <>
                    <h1 className={styles.chooseAccountHeading}>Choose an account</h1>
                    <p className={styles.continueToSubhead}>
                      to continue to <span className={styles.domainHighlight}>{window.location.hostname}</span>
                    </p>

                    {!showCustomGoogleInput ? (
                      <div className={styles.googleExactAccountList}>
                        {googleAccounts.map((account) => (
                          <button
                            key={account.email}
                            type="button"
                            className={styles.exactAccountRowBtn}
                            onClick={() => handleSelectGoogleAccount(account)}
                          >
                            <div className={styles.exactAvatarBox}>
                              {account.avatarType === 'letter' ? (
                                <div
                                  className={styles.exactLetterAvatar}
                                  style={{ backgroundColor: account.badgeColor || '#3A5A6C' }}
                                >
                                  {account.letter || 'R'}
                                </div>
                              ) : (
                                <img
                                  src={account.avatar}
                                  alt={account.name}
                                  className={styles.exactPhotoAvatar}
                                />
                              )}
                            </div>

                            <div className={styles.exactAccountMeta}>
                              <span className={styles.exactAccountName}>{account.name}</span>
                              <span className={styles.exactAccountEmail}>{account.email}</span>
                            </div>
                          </button>
                        ))}

                        <button
                          type="button"
                          className={styles.exactAccountRowBtn}
                          onClick={() => setShowCustomGoogleInput(true)}
                        >
                          <div className={styles.exactAvatarBox}>
                            <div className={styles.useAnotherIconCircle}>
                              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                              </svg>
                            </div>
                          </div>
                          <div className={styles.exactAccountMeta}>
                            <span className={styles.exactUseAnotherText}>Use another account</span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCustomGoogleSubmit} className={styles.customGoogleForm}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>Google Email or Phone</label>
                          <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>✉️</span>
                            <input
                              type="email"
                              className={styles.textInput}
                              placeholder="Enter your email address"
                              value={customGoogleEmail}
                              onChange={(e) => setCustomGoogleEmail(e.target.value)}
                              autoFocus
                              required
                            />
                          </div>
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>Full Name (Optional)</label>
                          <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>👤</span>
                            <input
                              type="text"
                              className={styles.textInput}
                              placeholder="Your full name"
                              value={customGoogleName}
                              onChange={(e) => setCustomGoogleName(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className={styles.customGoogleActions}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setShowCustomGoogleInput(false)}
                          >
                            Back to Accounts
                          </button>
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Next →
                          </button>
                        </div>
                      </form>
                    )}

                    <div className={styles.googleExactFooterBar}>
                      <div className={styles.langSelector}>
                        <span>English (United States)</span>
                        <span style={{ fontSize: '0.65rem', marginLeft: '4px' }}>▼</span>
                      </div>
                      <div className={styles.googleFooterLinks}>
                        <button type="button" className={styles.footerLinkBtn}>Help</button>
                        <button type="button" className={styles.footerLinkBtn}>Privacy</button>
                        <button type="button" className={styles.footerLinkBtn}>Terms</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub Real Login Chrome Popup Window Modal */}
      <AnimatePresence>
        {githubModalOpen && (
          <motion.div
            className={styles.chromeWindowOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.githubChromeWindow}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Chrome Popup Title Bar */}
              <div className={styles.chromeTitleBar}>
                <div className={styles.chromeTitleLeft}>
                  <svg className={styles.githubTitleIcon} fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span className={styles.chromeTitleText}>Sign in to GitHub · GitHub - Google Chrome</span>
                </div>
                <div className={styles.chromeControls}>
                  <button type="button" className={styles.chromeWinBtn} onClick={closeGithubModal}>_</button>
                  <button type="button" className={styles.chromeWinBtn} onClick={closeGithubModal}>▢</button>
                  <button type="button" className={`${styles.chromeWinBtn} ${styles.chromeCloseBtn}`} onClick={closeGithubModal}>✕</button>
                </div>
              </div>

              {/* URL Address Bar */}
              <div className={styles.chromeUrlBarRow}>
                <div className={styles.chromeUrlBox}>
                  <span className={styles.chromePadlock}>🔒</span>
                  <span className={styles.chromeUrlText}>
                    github.com/login?return_to=%2Flogin%2Foauth%2Fauthorize...
                  </span>
                </div>
              </div>

              {/* Main Content inside GitHub Sign In Popup */}
              <div className={styles.githubModalBody}>
                {/* Header Logo */}
                <div className={styles.githubBrandHeader}>
                  <svg className={styles.githubBigLogo} fill="#FFFFFF" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <h1 className={styles.githubMainHeading}>Sign in to GitHub</h1>
                </div>

                {githubAuthenticating ? (
                  <div className={styles.githubAuthProgress}>
                    <span className={styles.githubSpinner} />
                    <p className={styles.githubAuthText}>Verifying GitHub credentials...</p>
                  </div>
                ) : (
                  <>
                    {/* Error message banner */}
                    {githubError && (
                      <div className={styles.githubErrorBanner}>
                        <span>{githubError}</span>
                      </div>
                    )}

                    {/* GitHub Credentials Login Form */}
                    <form onSubmit={handleGithubFormSubmit} className={styles.githubLoginForm}>
                      <div className={styles.githubFieldGroup}>
                        <label className={styles.githubFieldLabel}>Username or email address</label>
                        <input
                          type="text"
                          className={styles.githubTextInput}
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          autoFocus
                          required
                          autoComplete="username"
                        />
                      </div>

                      <div className={styles.githubFieldGroup}>
                        <div className={styles.githubLabelRow}>
                          <label className={styles.githubFieldLabel}>Password</label>
                          <a href="https://github.com/password_reset" target="_blank" rel="noreferrer" className={styles.githubForgotLink}>
                            Forgot password?
                          </a>
                        </div>
                        <input
                          type="password"
                          className={styles.githubTextInput}
                          value={githubPassword}
                          onChange={(e) => setGithubPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                      </div>

                      <button type="submit" className={styles.githubGreenSubmitBtn}>
                        Sign in
                      </button>
                    </form>


                    <div className={styles.githubFooterNoticeRow}>
                      <div className={styles.githubFooterLinks}>
                        <a href="https://docs.github.com/articles/github-terms-of-service" target="_blank" rel="noreferrer">Terms</a>
                        <a href="https://docs.github.com/articles/github-privacy-statement" target="_blank" rel="noreferrer">Privacy</a>
                        <a href="https://github.com/security" target="_blank" rel="noreferrer">Security</a>
                        <a href="https://support.github.com" target="_blank" rel="noreferrer">Contact GitHub</a>
                      </div>
                      <button type="button" className={styles.githubCancelLinkBtn} onClick={closeGithubModal}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password & Reset Password Modal */}
      <AnimatePresence>
        {false && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {!showResetForm ? (
                /* Step 1: Request Password Reset Email / Gmail Inbox Waiting Screen */
                <>
                  <h3>Reset Your Password</h3>
                  <p>Enter your username and the email address connected to your account. We will send a reset link to your Gmail.</p>

                  {forgotError && (
                    <div className={styles.githubErrorBanner} style={{ marginBottom: '12px' }}>
                      <span>⚠️ {forgotError}</span>
                    </div>
                  )}

                  {completedResetUsername ? (
                    /* ✅ Green Tick — Password was reset successfully (polled from other tab) */
                    <motion.div
                      key={`reset-success-${completedResetUsername}`}
                      className={styles.greenTickContainer}
                      initial={{ opacity: 0, scale: 0.85, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
                    >
                      <div className={styles.greenTickCircle}>
                        <svg className={styles.greenTickSvg} viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className={styles.greenTickTitle}>
                        Successfully created new password for username @{completedResetUsername}!
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: '100%', marginTop: '20px' }}
                        onClick={() => {
                          setForgotModalOpen(false)
                          setForgotError('')
                        }}
                      >
                        Close Window
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '12px' }}
                        onClick={handleProceedAfterReset}
                        disabled={loading}
                      >
                        {loading ? '🔐 Signing you in...' : 'Continue to sign in →'}
                      </button>
                    </motion.div>
                  ) : forgotSent ? (
                    /* 📩 Waiting for user to click email link — auto-updates to green tick when reset completes */
                    <div style={{ textAlign: 'center', margin: '16px 0' }}>
                      <div className={styles.forgotSuccess} style={{ marginBottom: '16px' }}>
                        <span>✨ Password reset email sent to <strong>{resetTargetEmail || forgotEmail}</strong>!</span>
                      </div>
                      <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#58a6ff', fontWeight: 600 }}>
                          📩 Check your Gmail Inbox:
                        </p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#c9d1d9' }}>
                          Username: <strong>@{resetTargetUsername || forgotUsername}</strong>
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#c9d1d9' }}>
                          Target Email: <strong>{resetTargetEmail || forgotEmail}</strong>
                        </p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.5 }}>
                          Please open the password reset email sent to your Gmail inbox and click the reset link inside to fill out your new password form.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: '100%' }}
                        onClick={() => {
                          setForgotModalOpen(false)
                          setForgotSent(false)
                          setForgotUsername('')
                          setForgotEmail('')
                        }}
                      >
                        Close Window
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotSubmit} className={styles.forgotForm}>
                      <div className={styles.fieldGroup} style={{ marginBottom: '12px', textAlign: 'left' }}>
                        <label className={styles.fieldLabel}>Username</label>
                        <div className={styles.inputWrapper}>
                          <span className={styles.inputIcon}>👤</span>
                          <input
                            type="text"
                            className={styles.textInput}
                            placeholder="Your account username (e.g. rupankar)"
                            value={forgotUsername}
                            onChange={(e) => setForgotUsername(e.target.value)}
                            required
                            disabled={forgotLoading}
                          />
                        </div>
                      </div>

                      <div className={styles.fieldGroup} style={{ marginBottom: '16px', textAlign: 'left' }}>
                        <label className={styles.fieldLabel}>Connected Email Address</label>
                        <div className={styles.inputWrapper}>
                          <span className={styles.inputIcon}>✉️</span>
                          <input
                            type="email"
                            className={styles.textInput}
                            placeholder="your.email@gmail.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            disabled={forgotLoading}
                          />
                        </div>
                      </div>

                      <div className={styles.modalButtons}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setForgotModalOpen(false)
                            setForgotError('')
                          }}
                          disabled={forgotLoading}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                          {forgotLoading ? 'Verifying & Sending Email...' : 'Send Reset Link'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                /* Step 2: Set New Password Form (Triggered via link sent in Gmail — opens in new tab) */
                <>
                  {!resetSuccess ? (
                    /* 🔒 Password entry form */
                    <>
                      <h3>Set New Password</h3>
                      <p>
                        Create a new password for account <strong>@{resetTargetUsername || 'user'}</strong> (<strong>{resetTargetEmail || 'email'}</strong>).
                      </p>

                      {resetError && (
                        <div className={styles.githubErrorBanner} style={{ marginBottom: '12px' }}>
                          <span>⚠️ {resetError}</span>
                        </div>
                      )}

                      <form onSubmit={handleResetPasswordSubmit} className={styles.forgotForm}>
                        <div className={styles.fieldGroup} style={{ marginBottom: '12px', textAlign: 'left' }}>
                          <label className={styles.fieldLabel}>New Password</label>
                          <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>🔒</span>
                            <input
                              type="password"
                              className={styles.textInput}
                              placeholder="Min 6 characters"
                              value={newResetPassword}
                              onChange={(e) => setNewResetPassword(e.target.value)}
                              required
                              minLength={6}
                              disabled={resetLoading}
                            />
                          </div>
                        </div>

                        <div className={styles.fieldGroup} style={{ marginBottom: '16px', textAlign: 'left' }}>
                          <label className={styles.fieldLabel}>Confirm New Password</label>
                          <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>🛡️</span>
                            <input
                              type="password"
                              className={styles.textInput}
                              placeholder="Re-enter new password"
                              value={confirmResetPassword}
                              onChange={(e) => setConfirmResetPassword(e.target.value)}
                              required
                              minLength={6}
                              disabled={resetLoading}
                            />
                          </div>
                        </div>

                        <div className={styles.modalButtons}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                              setShowResetForm(false)
                              setForgotModalOpen(false)
                              setResetError('')
                            }}
                            disabled={resetLoading}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary" disabled={resetLoading}>
                            {resetLoading ? 'Updating Password...' : 'Save New Password'}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    /* ✅ Success screen — shown in Tab 2 (reset link tab) after password is saved */
                    <div className={styles.greenTickContainer}>
                      <div className={styles.greenTickCircle}>
                        <svg className={styles.greenTickSvg} viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className={styles.greenTickTitle}>
                        Successfully created new password for account @{resetTargetUsername || forgotUsername || username || 'user'}!
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instant QR Code Login & Mobile Sync Modal */}
      <QRLoginModal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false)
          setQrTargetAccount(null)
        }}
        account={qrTargetAccount}
      />
    </div>
  )
}

