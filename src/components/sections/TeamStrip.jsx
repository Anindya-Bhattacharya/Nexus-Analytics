import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal.jsx'
import AnimatedLogo from '../ui/AnimatedLogo.jsx'
import { team } from '../../data/team.js'
import styles from './TeamStrip.module.css'

const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

export default function TeamStrip() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.head}>
          <div className="section-head">
            <span className="eyebrow">The people</span>
            <h2>Five specialists, one studio</h2>
          </div>
          <Link to="/team" className="btn btn-ghost">
            Meet the full team →
          </Link>
        </div>

        <div className={styles.row}>
          {team.map((member, i) => (
            <Reveal key={member.id} delay={i * 0.1} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                {member.photo ? (
                  <div className={styles.photoWrap}>
                    <img src={member.photo} alt={member.name} className={styles.photo} />
                    <div className={styles.photoGlow} />
                  </div>
                ) : (
                  <div className={styles.avatar}>{initials(member.name)}</div>
                )}
                <AnimatedLogo size={22} wordmark={false} play="idle" glow={false} />
              </div>
              <h3>{member.name}</h3>
              <span className={styles.role}>{member.role}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

