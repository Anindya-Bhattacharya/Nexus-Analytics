import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimatedLogo from '../ui/AnimatedLogo.jsx'
import styles from './Hero.module.css'

const stagger = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const rise = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function Hero() {
  const [liveMetric, setLiveMetric] = useState('$1,248,500')

  useEffect(() => {
    const interval = setInterval(() => {
      const val = 1248500 + Math.floor(Math.random() * 4500)
      setLiveMetric(`$${val.toLocaleString()}`)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>

        {/* ── LEFT: copy ── */}
        <motion.div className={styles.copy} variants={stagger} initial="initial" animate="animate">
          <motion.div variants={rise} className={styles.eyebrowWrap}>
            <span className="eyebrow">Data &amp; Power BI Studio</span>
          </motion.div>

          <motion.h1 variants={rise}>
            We turn raw data
            <br />
            into decisions.
          </motion.h1>

          <motion.p variants={rise} className={styles.lead}>
            Synapse Analytics is a studio building custom front ends, data models, and
            Power BI dashboards — the interface and the insight, from the same team.
          </motion.p>

          {/* Three core pillars */}
          <motion.div variants={rise} className={styles.pillarRow}>
            <div className={styles.pillarBadge}><span>Frontend Development</span></div>
            <div className={styles.pillarBadge}><span>Data Modeling</span></div>
            <div className={styles.pillarBadge}><span>Power BI Dashboards</span></div>
          </motion.div>

          <motion.div variants={rise} className={styles.ctaRow}>
            <Link to="/dashboards" className="btn btn-primary">View dashboards →</Link>
            <Link to="/contact" className="btn btn-outline">Start a project</Link>
          </motion.div>

          <motion.div variants={rise} className={styles.stack}>
            <div className={styles.stackItem}>
              <span className={styles.stackNum}>03</span>
              <span className={styles.stackLabel}>Specialists</span>
            </div>
            <div className={styles.stackItem}>
              <span className={styles.stackNum}>3</span>
              <span className={styles.stackLabel}>Disciplines fused</span>
            </div>
            <div className={styles.stackItem}>
              <span className={styles.stackNum}>{liveMetric}</span>
              <span className={styles.stackLabel}>Live Stream ARR</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Large AnimatedLogo — same design as About page ── */}
        <motion.div
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* The exact same AnimatedLogo used on the About page, rendered large & vertical */}
          <AnimatedLogo
            size={300}
            play="pulse"
            wordmark={true}
            wordSize="2rem"
            glow={true}
            vertical={true}
            className={styles.heroLogo}
          />

        </motion.div>
      </div>
    </section>
  )
}
