import { motion } from 'framer-motion'
import AnimatedLogo from './AnimatedLogo.jsx'
import styles from './PageHeader.module.css'

export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div className={styles.wrap}>
      <div className={`container ${styles.inner}`}>
        <AnimatedLogo size={140} wordmark={false} play="idle" glow={false} className={styles.headerWatermark} />
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {eyebrow}
        </motion.span>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            className={styles.description}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  )
}

