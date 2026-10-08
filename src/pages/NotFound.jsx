import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimatedLogo from '../components/ui/AnimatedLogo.jsx'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatedLogo size={96} wordmark={false} play="pulse" />
      </motion.div>

      <motion.span
        className={styles.code}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        ERROR — NODE NOT FOUND
      </motion.span>

      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        This page isn't on the map.
      </motion.h1>

      <motion.p
        className={styles.description}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        The page you're looking for doesn't exist or may have moved. Let's get
        you back to somewhere useful.
      </motion.p>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link to="/contact" className="btn btn-outline">
          Contact us
        </Link>
      </motion.div>
    </div>
  )
}
