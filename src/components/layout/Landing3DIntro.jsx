import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Landing3DCanvas from '../3d/Landing3DCanvas.jsx'
import styles from './Landing3DIntro.module.css'

const INTRO_DURATION_MS = 3800 // Smooth ~3.8 seconds sequence

export default function Landing3DIntro({ onComplete, autoStart = true }) {
  const [progress, setProgress] = useState(0)
  const [isWarping, setIsWarping] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Dynamic phase messages based on percentage
  const getPhaseMessage = (pct) => {
    if (pct < 28) return 'INITIALIZING 3D NEURAL DATA MATRIX...'
    if (pct < 58) return 'CALIBRATING DIRECTQUERY DAX TELEMETRY...'
    if (pct < 85) return 'SYNCHRONIZING ENTERPRISE DASHBOARDS...'
    if (pct < 100) return 'NEURAL CORE LINKED • ACCESS GRANTED'
    return 'STUDIO READY • LAUNCHING LOGIN...'
  }

  // Smooth exit sequence with 3D camera warp speed
  const handleProceed = useCallback(() => {
    if (isExiting) return
    setIsWarping(true)
    setIsExiting(true)

    // Give 450ms for the 3D hyperspace warp zoom before fading into login
    setTimeout(() => {
      if (onComplete) onComplete()
    }, 450)
  }, [isExiting, onComplete])

  // Keyboard shortcut: ESC or Enter to immediately transition
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleProceed()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleProceed])

  // Progress timer loop
  useEffect(() => {
    if (!autoStart) return

    const intervalTime = 25
    const stepIncrement = 100 / (INTRO_DURATION_MS / intervalTime)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + stepIncrement
        if (nextVal >= 100) {
          clearInterval(timer)
          return 100
        }
        return nextVal
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [autoStart])

  // Auto proceed when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      const exitTimer = setTimeout(() => {
        handleProceed()
      }, 350)
      return () => clearTimeout(exitTimer)
    }
  }, [progress, isExiting, handleProceed])

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className={styles.landingIntro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: 'blur(10px)',
            transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* 3D WebGL Three.js Scene */}
          <Landing3DCanvas isWarping={isWarping} />

          {/* Ambient Lighting & Scanline Overlays */}
          <div className={styles.ambientBackdrop} />
          <div className={styles.vignetteOverlay} />
          <div className={styles.scanGridOverlay} />

          {/* Top Cyber Telemetry Bar */}
          <motion.header
            className={styles.topHud}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={styles.systemBadge}>
              <span className={styles.pulseBeacon} />
              <span>SYNAPSE 3D CORE v2.8 // SECURE CHANNEL</span>
            </div>

            <div className={styles.hudRightGroup}>
              <div className={styles.hudTelemetry}>
                <span className={styles.hudMetric}>
                  <span className={styles.hudMetricDot} />
                  DIRECTQUERY: ACTIVE
                </span>
                <span className={styles.hudMetric}>
                  <span className={styles.hudMetricDot} />
                  QUANTUM 3D: 60 FPS
                </span>
              </div>
            </div>
          </motion.header>

          {/* Center Brand & Studio Reveal Section */}
          <motion.main
            className={styles.centerStage}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.brandSuperTag}>
              <span>⚡</span>
              <span>SYNAPSE ENTERPRISE ANALYTICS</span>
              <span>⚡</span>
            </div>

            <h1 className={styles.mainHeadline}>
              Bespoke Web Systems
              <br />
              <span className={styles.headlineGradient}>&amp; 3D Data Dashboards</span>
            </h1>

            <p className={styles.heroSubtext}>
              High-performance React architectures, structured SQL data models, and live Power BI telemetry engineered for decision makers.
            </p>

            <div className={styles.pillsRow}>
              <span className={styles.techPill}>⚡ REACT 18 &amp; VITE</span>
              <span className={styles.techPill}>📊 ENTERPRISE SQL</span>
              <span className={styles.techPill}>📈 DIRECTQUERY DAX</span>
              <span className={styles.techPill}>🔮 3D WEBGL CORE</span>
            </div>
          </motion.main>

          {/* Bottom Telemetry HUD & Progress Indicator */}
          <motion.footer
            className={styles.bottomHud}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className={styles.telemetryStatusRow}>
              <span className={styles.phaseMessage}>{getPhaseMessage(progress)}</span>
              <span className={styles.percentageNum}>{Math.floor(progress)}%</span>
            </div>

            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className={styles.dragTip}>Move cursor / touch screen to orbit 3D core in real time</span>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
