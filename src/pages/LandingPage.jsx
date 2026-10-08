import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import AnimatedLogo from '../components/ui/AnimatedLogo.jsx'
import { team } from '../data/team.js'
import styles from './LandingPage.module.css'

const marqueeItems = [
  '⚡ FRONTEND DEVELOPMENT',
  '📊 DATA MODELING',
  '📈 POWER BI DASHBOARDS',
  '🔮 DAX MEASURES',
  '💻 REACT 18 & VITE',
  '🚀 DIRECTQUERY TELEMETRY',
  '🛡️ ENTERPRISE SQL PIPELINES',
  '✨ EMBEDDED ANALYTICS',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const slideUpVariant = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

const slideLeftVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function LandingPage() {
  const navigate = useNavigate()

  // 3D Parallax Tilt Effects
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 })
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      className={styles.landingContainer}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: '-100%', opacity: 0, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
    >
      {/* Interactive Grid & Radiant Light Fields */}
      <div className={styles.gridOverlay} />
      <div className={styles.ambientAura} />
      <div className={styles.ambientAuraSecondary} />

      {/* Pulsing Animated Shockwave Rings */}
      <motion.div
        className={styles.pulseRingOne}
        animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={styles.pulseRingTwo}
        animate={{ scale: [0.6, 1.3, 0.6], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 5, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Infinite Sliding Marquee Ticker */}
      <div className={styles.tickerWrap}>
        <motion.div
          className={styles.tickerTrack}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className={styles.tickerItem}>
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      <div className={`container ${styles.contentWrap}`}>
        <motion.div
          className={styles.heroBlock}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top Live Badge */}
          <motion.div variants={slideUpVariant} className={styles.statusBadge}>
            <span className={styles.badgeDot} />
            <span className={styles.badgeText}>SYNAPSE ANALYTICS STUDIO • LIVE PORTAL</span>
          </motion.div>

          {/* 3D Interactive Logo Prism */}
          <motion.div
            variants={slideUpVariant}
            className={styles.logoPerspectiveContainer}
            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}
          >
            <div className={styles.logoBacklight} />
            <AnimatedLogo
              size={210}
              play="pulse"
              wordmark={true}
              wordSize="2.3rem"
              glow={true}
              vertical={true}
              className={styles.mainLogo}
            />
          </motion.div>

          {/* Animated Main Headline */}
          <motion.h1 variants={slideUpVariant} className={styles.headline}>
            Bespoke Web Development
            <br />
            <span className={styles.gradientText}>&amp; Enterprise Power BI Dashboards</span>
          </motion.h1>

          <motion.p variants={slideUpVariant} className={styles.subhead}>
            We design high-performance React front ends, structure clean SQL data models, and build live Power BI dashboards — delivering complete data solutions from one studio team.
          </motion.p>

          {/* 3D Interactive Core Pillars */}
          <motion.div variants={slideUpVariant} className={styles.pillarsGrid}>
            <motion.div
              className={styles.pillarCard}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3 } }}
            >
              <div className={styles.pillarCardHeader}>
                <div className={styles.pillarIcon}>⚡</div>
                <span className={styles.pillarTag}>PILLAR 01</span>
              </div>
              <h4>Frontend Development</h4>
              <p>Custom React 18 &amp; Vite web applications built for speed, responsiveness, and fluid user experience.</p>
              <div className={styles.tagRow}>
                <span>React</span>
                <span>Vite</span>
                <span>Framer Motion</span>
                <span>CSS3</span>
              </div>
            </motion.div>

            <motion.div
              className={styles.pillarCard}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3 } }}
            >
              <div className={styles.pillarCardHeader}>
                <div className={styles.pillarIcon}>📊</div>
                <span className={styles.pillarTag}>PILLAR 02</span>
              </div>
              <h4>Data Modeling &amp; Cleaning</h4>
              <p>Structuring messy datasets into clean, optimized SQL models and reliable analytics pipelines.</p>
              <div className={styles.tagRow}>
                <span>SQL</span>
                <span>Data Cleaning</span>
                <span>ETL</span>
                <span>DAX</span>
              </div>
            </motion.div>

            <motion.div
              className={styles.pillarCard}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3 } }}
            >
              <div className={styles.pillarCardHeader}>
                <div className={styles.pillarIcon}>📈</div>
                <span className={styles.pillarTag}>PILLAR 03</span>
              </div>
              <h4>Power BI Dashboards</h4>
              <p>Interactive reports, custom DAX measures, and DirectQuery dashboards built for decision makers.</p>
              <div className={styles.tagRow}>
                <span>Power BI</span>
                <span>DirectQuery</span>
                <span>Analytics</span>
                <span>KPIs</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Sliding Primary Actions */}
          <motion.div variants={slideUpVariant} className={styles.ctaRow}>
            <button
              type="button"
              className={`btn btn-primary ${styles.mainCtaBtn}`}
              onClick={() => navigate('/home')}
            >
              <span>Enter Studio Portal →</span>
            </button>

            <Link to="/dashboards" className={`btn btn-outline ${styles.secCtaBtn}`}>
              View Live Dashboards
            </Link>

            <button
              type="button"
              className={`btn btn-outline ${styles.secCtaBtn}`}
              onClick={() => window.dispatchEvent(new CustomEvent('replay-3d-intro'))}
              title="Experience 3D Landing Page Animation"
            >
              🔮 3D Intro
            </button>
          </motion.div>

          {/* Admin Team Members Section */}
          <motion.div variants={slideUpVariant} className={styles.teamSection}>
            <div className={styles.teamSectionHeader}>
              <span className={styles.teamSectionTitle}>STUDIO SPECIALISTS</span>
              <span className={styles.teamSectionSub}>Five specialists • Every project</span>
            </div>

            <div className={styles.teamGrid}>
              {team.map((member) => (
                <motion.div
                  key={member.id}
                  className={styles.teamCard}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className={styles.teamPhotoWrap}>
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className={styles.teamPhoto} />
                    ) : (
                      <div className={styles.teamInitials}>{member.name.charAt(0)}</div>
                    )}
                    <div className={styles.teamPhotoGlow} />
                  </div>

                  <div className={styles.teamInfo}>
                    <span className={styles.teamName}>{member.name}</span>
                    <span className={styles.teamRole}>{member.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
