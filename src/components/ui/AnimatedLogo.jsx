import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './AnimatedLogo.module.css'

/**
 * AnimatedLogo — Nexus Analytics Dynamic Studio Brand Mark
 * 
 * Features:
 * - 3D Isometric Nexus Prism with liquid fill-up energy waves
 * - Animated vector beam paths with streaming data pulses
 * - Ambient pulse rings & vertex particle nodes
 * - Interactive hover dynamics & shimmer wordmark
 */
export default function AnimatedLogo({
  size = 36,
  play = 'mount',
  wordmark = true,
  wordSize,
  variant = 'full',
  glow = true,
  vertical = false,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false)

  const hover = play === 'hover' || isHovered
  const isPulse = play === 'pulse'

  // Standard viewBox size for high precision geometry
  const vb = 80
  const center = 40

  return (
    <span
      className={`${styles.wrap} ${styles[variant]} ${vertical ? styles.wrapVertical : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${vb} ${vb}`}
        className={`${styles.markSvg} ${glow ? styles.hasGlow : ''}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Dynamic Gradients */}
          <linearGradient id="nexus-gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.85" />
          </linearGradient>
          
          <linearGradient id="nexus-gradient-blue" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5B8CF0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1E2430" stopOpacity="0.6" />
          </linearGradient>
          
          <linearGradient id="nexus-gradient-top" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="nexus-shimmer-fill" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.85" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7000FF" stopOpacity="0.3" />
          </linearGradient>

          <radialGradient id="nexus-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.7" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background aura */}
        {glow && (
          <circle
            cx={center}
            cy={center}
            r="36"
            fill="url(#nexus-core-glow)"
            className={styles.aura}
          />
        )}

        {/* Outer Hexagon Frame */}
        <motion.polygon
          points="40,8 70,24 70,56 40,72 10,56 10,24"
          fill="none"
          stroke="url(#nexus-gradient-cyan)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0, rotate: -30 }}
          animate={
            isPulse
              ? { pathLength: 1, opacity: 1, rotate: [0, 360] }
              : hover
              ? { pathLength: 1, opacity: 1, rotate: [0, 8, 0], scale: 1.03 }
              : { pathLength: 1, opacity: 1, rotate: 0 }
          }
          style={{ transformOrigin: '40px 40px' }}
          transition={
            isPulse
              ? { rotate: { duration: 25, repeat: Infinity, ease: 'linear' } }
              : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }
        />

        {/* Liquid Energy Fill-Up Layer inside Prism */}
        <motion.polygon
          points="40,16 64,28 64,52 40,64 16,52 16,28"
          fill="url(#nexus-shimmer-fill)"
          initial={{ opacity: 0.15, scale: 0.9 }}
          animate={hover ? { opacity: [0.3, 0.75, 0.5], scale: [0.92, 1, 0.98] } : { opacity: 0.25, scale: 0.95 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 40px' }}
        />

        {/* Inner Isometric Facets */}
        {/* Top Facet */}
        <motion.polygon
          points="40,20 60,30 40,40 20,30"
          fill="url(#nexus-gradient-top)"
          stroke="var(--signal)"
          strokeWidth="1"
          strokeOpacity="0.6"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={hover ? { scale: [1, 1.05, 1], opacity: 1 } : { opacity: 1, scale: 1 }}
          style={{ transformOrigin: '40px 40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        {/* Left Facet */}
        <motion.polygon
          points="20,30 40,40 40,60 20,50"
          fill="url(#nexus-gradient-blue)"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeOpacity="0.6"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={hover ? { scale: [1, 1.05, 1], opacity: 1 } : { opacity: 1, scale: 1 }}
          style={{ transformOrigin: '40px 40px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
        />

        {/* Right Facet */}
        <motion.polygon
          points="40,40 60,30 60,50 40,60"
          fill="url(#nexus-gradient-cyan)"
          fillOpacity="0.3"
          stroke="url(#nexus-gradient-cyan)"
          strokeWidth="1"
          strokeOpacity="0.8"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={hover ? { scale: [1, 1.05, 1], opacity: 1 } : { opacity: 1, scale: 1 }}
          style={{ transformOrigin: '40px 40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* Internal Radial Vectors with Streaming Data Beams */}
        {[
          { x1: 40, y1: 8, x2: 40, y2: 40, color: 'var(--signal)' },
          { x1: 10, y1: 56, x2: 40, y2: 40, color: 'var(--accent)' },
          { x1: 70, y1: 56, x2: 40, y2: 40, color: 'var(--accent)' },
        ].map((line, idx) => (
          <g key={idx}>
            <motion.line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.color}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeOpacity="0.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
            />
            {/* Streaming Pulse Particle along path */}
            <motion.circle
              r="2"
              fill="var(--paper)"
              initial={{ cx: line.x1, cy: line.y1, opacity: 0 }}
              animate={{
                cx: [line.x1, line.x2],
                cy: [line.y1, line.y2],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: idx * 0.4,
                ease: 'easeInOut',
              }}
            />
          </g>
        ))}

        {/* Vertex Data Nodes */}
        {[
          { x: 40, y: 8 },
          { x: 70, y: 24 },
          { x: 70, y: 56 },
          { x: 40, y: 72 },
          { x: 10, y: 56 },
          { x: 10, y: 24 },
        ].map((pt, idx) => (
          <motion.circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={hover ? 3.5 : 2.5}
            fill="var(--paper)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.05, duration: 0.3 }}
          />
        ))}

        {/* Dynamic Energy Wave Rings radiating from core */}
        <motion.circle
          cx={center}
          cy={center}
          r="6"
          fill="none"
          stroke="var(--signal)"
          strokeWidth="1"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: [1, 2.4, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />

        {/* Glowing Central Nexus Core */}
        <motion.circle
          cx={center}
          cy={center}
          r="6.5"
          fill="var(--signal)"
          className={styles.centralCore}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: hover ? [1, 1.3, 1] : [1, 1.15, 1],
            opacity: 1,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.circle
          cx={center}
          cy={center}
          r="2.5"
          fill="var(--white)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      </svg>

      {wordmark && (
        <span className={styles.wordmarkGroup} style={{ fontSize: wordSize ?? size * 0.42 }}>
          <span className={styles.brandTitle}>
            <span className={styles.synapseText}>SYNAPSE</span>
            <span className={styles.accentDot} />
          </span>
          <span className={styles.analyticsText}>ANALYTICS</span>
        </span>
      )}
    </span>
  )
}
