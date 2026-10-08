import { Link } from 'react-router-dom'
import AnimatedLogo from '../ui/AnimatedLogo.jsx'
import { navLinks } from '../../data/nav.js'
import styles from './Footer.module.css'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div>
            <div className={styles.brand}>
              <Link to="/">
                <AnimatedLogo size={32} play="hover" wordSize="var(--fs-md)" />
              </Link>
            </div>
            <p className={styles.tagline}>
              A dedicated studio building front ends and Power BI dashboards
              that turn raw data into something people can actually act on.
            </p>
          </div>

          <nav>
            <div className={styles.colTitle}>Navigate</div>
            <div className={styles.colLinks}>
              {navLinks.map((item) => (
                <Link key={item.path} to={item.path}>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <div className={styles.colTitle}>Studio</div>
            <div className={styles.colLinks}>
              <a href="mailto:noreply.synapseanalytics@gmail.com">noreply.synapseanalytics@gmail.com</a>
              <Link to="/team">Meet the team</Link>
              <Link to="/dashboards">View dashboards</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {year} Synapse Analytics. All rights reserved.</span>
          <span>Built with React</span>
        </div>
      </div>
    </footer>
  )
}
