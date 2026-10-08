import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AnimatedLogo from '../ui/AnimatedLogo.jsx'
import QRLoginModal from '../auth/QRLoginModal.jsx'
import { navLinks } from '../../data/nav.js'
import { useAuth } from '../../context/AuthContext.jsx'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
    setUserDropdownOpen(false)
  }, [location.pathname])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [menuOpen])

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setUserDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
    setUserDropdownOpen(false)
    setMenuOpen(false)
    navigate('/login')
  }

  return (
    <>
      <header className={`${styles.navWrap} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          <NavLink to="/home" className={styles.brand} onClick={() => setMenuOpen(false)}>
            <AnimatedLogo size={36} play="hover" wordSize="var(--fs-md)" />
          </NavLink>

          <nav className={styles.links} aria-label="Primary">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={styles.linkNode}>{item.node}</span>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className={styles.underline}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className={styles.cta}>
            {isAuthenticated && user ? (
              <div className={styles.userProfileWrapper}>
                <button
                  type="button"
                  className={styles.userChipBtn}
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  title="Account Settings & Profile"
                >
                  <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.dropdownCaret}>▾</span>
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      className={styles.userDropdown}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownName}>{user.name}</span>
                        <span className={styles.dropdownEmail}>@{user.username || 'user'}</span>
                        <span className={styles.dropdownBadge}>{user.role || 'Specialist'}</span>
                      </div>

                      <div className={styles.dropdownDivider} />

                      <button
                        type="button"
                        className={`${styles.dropdownItem} ${styles.syncMobileDropdownItem}`}
                        onClick={() => {
                          setUserDropdownOpen(false)
                          setQrModalOpen(true)
                        }}
                        style={{ color: '#00E5FF' }}
                      >
                        <span>📱 Sync to Mobile (QR)</span>
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setUserDropdownOpen(false)
                          navigate('/login')
                        }}
                      >
                        <span>🔑 Auth Portal Settings</span>
                      </button>

                      <button
                        type="button"
                        className={`${styles.dropdownItem} ${styles.logoutItem}`}
                        onClick={handleLogout}
                      >
                        <span>🚪 Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink to="/login" className={`btn btn-outline ${styles.loginNavBtn}`}>
                <span>Sign In</span>
              </NavLink>
            )}

            <NavLink to="/contact" className={`btn btn-primary ${styles.ctaBtn}`}>
              Start a project
            </NavLink>

            <button
              className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className={styles.burgerBar} />
              <span className={styles.burgerBar} />
              <span className={styles.burgerBar} />
            </button>
          </div>
        </div>

        {/* Instant QR Mobile Sync Modal */}
        {isAuthenticated && user && (
          <QRLoginModal
            isOpen={qrModalOpen}
            onClose={() => setQrModalOpen(false)}
            account={user}
            title="Sync Account to Phone"
          />
        )}
      </header>

      {/* High-Performance Full-Screen Mobile Drawer via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {menuOpen && (
              <div
                className={styles.mobileDrawerBackdrop}
                onClick={() => setMenuOpen(false)}
              >
                <motion.div
                  className={styles.mobileDrawer}
                  initial={{ opacity: 0, x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.drawerHeader}>
                    <NavLink
                      to="/home"
                      className={styles.drawerBrand}
                      onClick={() => setMenuOpen(false)}
                    >
                      <AnimatedLogo size={32} play="hover" wordSize="1.1rem" />
                    </NavLink>
                    <button
                      type="button"
                      className={styles.drawerCloseBtn}
                      onClick={() => setMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      ✕
                    </button>
                  </div>

                  <div className={styles.drawerScrollBody}>
                    {/* User Profile Card (if authenticated) */}
                    {isAuthenticated && user && (
                      <div className={styles.drawerUserCard}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className={styles.drawerUserAvatar}
                        />
                        <div className={styles.drawerUserInfo}>
                          <div className={styles.drawerUserName}>{user.name}</div>
                          <div className={styles.drawerUserHandle}>
                            @{user.username || 'user'}
                          </div>
                          <span className={styles.drawerUserBadge}>
                            {user.role || 'Registered Studio Specialist'}
                          </span>
                        </div>
                      </div>
                    )}

                    <nav className={styles.drawerNav} aria-label="Mobile Navigation">
                      {navLinks.map((item, i) => (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.04 + i * 0.04,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                              `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`
                            }
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className={styles.drawerLinkNode}>{item.node}</span>
                            <span className={styles.drawerLinkLabel}>{item.label}</span>
                            <span className={styles.drawerLinkArrow}>→</span>
                          </NavLink>
                        </motion.div>
                      ))}
                    </nav>

                    <div className={styles.drawerActions}>
                      <NavLink
                        to="/contact"
                        className={`btn btn-primary ${styles.drawerCtaBtn}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>Start a project</span>
                        <span>✨</span>
                      </NavLink>

                      {isAuthenticated ? (
                        <div className={styles.drawerAuthGroup}>
                          <button
                            type="button"
                            className={`btn btn-outline ${styles.drawerAuthBtn}`}
                            onClick={() => {
                              setMenuOpen(false)
                              navigate('/login')
                            }}
                          >
                            <span>🔑 Account Settings</span>
                          </button>
                          <button
                            type="button"
                            className={`btn btn-outline ${styles.drawerLogoutBtn}`}
                            onClick={handleLogout}
                          >
                            <span>🚪 Sign Out</span>
                          </button>
                        </div>
                      ) : (
                        <NavLink
                          to="/login"
                          className={`btn btn-outline ${styles.drawerAuthBtn}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span>🔑 Sign In / Register</span>
                        </NavLink>
                      )}
                    </div>

                    <div className={styles.drawerFooterInfo}>
                      <span className={styles.telemetryDot} />
                      <span>Synapse Analytics • Mobile Studio Engine</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

