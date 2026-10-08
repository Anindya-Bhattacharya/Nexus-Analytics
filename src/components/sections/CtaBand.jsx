import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal.jsx'
import AnimatedLogo from '../ui/AnimatedLogo.jsx'
import styles from './CtaBand.module.css'

export default function CtaBand({
  title = 'Have a dataset that deserves better?',
  description = "Tell us what you're working with. We'll tell you what it could look like.",
  primaryLabel = 'Start a project',
  primaryTo = '/contact',
  secondaryLabel = 'View our work',
  secondaryTo = '/dashboards',
}) {
  return (
    <section className="section">
      <div className="container">
        <Reveal className={styles.wrap}>
          <AnimatedLogo size={160} wordmark={false} play="idle" glow={false} className={styles.hexDeco} />
          <div className={styles.copy}>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <div className={styles.actions}>
            <Link to={primaryTo} className="btn btn-primary">
              {primaryLabel}
            </Link>
            {secondaryTo && (
              <Link to={secondaryTo} className="btn btn-outline">
                {secondaryLabel}
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
