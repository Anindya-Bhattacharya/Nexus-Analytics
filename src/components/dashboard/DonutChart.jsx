import { motion } from 'framer-motion'
import styles from './DonutChart.module.css'

const SIZE = 160
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

export default function DonutChart({ data }) {
  let cumulative = 0

  return (
    <div className={styles.wrap}>
      <div className={styles.svgWrap}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--ink-line)"
            strokeWidth={STROKE}
          />
          {data.map((slice, i) => {
            const dash = (slice.value / 100) * CIRC
            const offset = CIRC - (cumulative / 100) * CIRC
            cumulative += slice.value
            return (
              <motion.circle
                key={slice.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${CIRC - dash}`}
                strokeLinecap="butt"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            )
          })}
        </svg>
        <div className={styles.centerLabel}>
          <span className={styles.centerValue}>100</span>
          <span className={styles.centerUnit}>Projects</span>
        </div>
      </div>

      <div className={styles.legend}>
        {data.map((slice) => (
          <div key={slice.label} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: slice.color }} />
            <span className={styles.legendLabel}>{slice.label}</span>
            <span className={styles.legendValue}>{slice.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
