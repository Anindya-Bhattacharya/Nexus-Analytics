import { motion } from 'framer-motion'

/**
 * Reveal — scroll-triggered fade + rise, used everywhere instead of
 * ad-hoc animation props so motion stays consistent site-wide.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  duration = 0.7,
  once = true,
  as: Component = motion.div,
  className,
  amount = 0.2,
}) {
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  )
}
