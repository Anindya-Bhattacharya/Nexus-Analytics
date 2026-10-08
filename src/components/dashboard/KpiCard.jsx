import { motion, AnimatePresence } from 'framer-motion'
import styles from './KpiCard.module.css'

export default function KpiCard({ label, value, delta }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <div className={styles.valueRow}>
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            className={styles.value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {delta && <span className={styles.delta}>{delta}</span>}
      </div>
    </div>
  )
}
