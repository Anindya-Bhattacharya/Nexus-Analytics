import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './BarChart.module.css'

export default function BarChart({ data, labels, unit = 'K' }) {
  const [hovered, setHovered] = useState(null)
  const max = Math.max(...data)

  return (
    <div className={styles.wrap}>
      <div className={styles.chart}>
        {data.map((value, i) => {
          const heightPct = (value / max) * 100
          return (
            <div
              key={i}
              className={styles.col}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <AnimatePresence>
                {hovered === i && (
                  <motion.div
                    className={styles.tooltip}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                  >
                    ${value}
                    {unit}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                className={styles.bar}
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          )
        })}
      </div>
      <div className={styles.labels}>
        {labels.map((l) => (
          <span key={l} className={styles.label}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}
