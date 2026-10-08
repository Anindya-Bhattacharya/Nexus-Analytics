import Reveal from '../ui/Reveal.jsx'
import AnimatedLogo from '../ui/AnimatedLogo.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import { services } from '../../data/services.js'
import styles from './ServiceGrid.module.css'

export default function ServiceGrid() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow="What We Do"
          title="Frontend Development, Data Modeling & Power BI"
          description="The interface and the insight are usually built by different teams who never talk. We're five specialists who fuse web development, data engineering, analytics, and dashboard design into one seamless workflow."
        />

        <div className={styles.grid}>
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.1} as="div" className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.node}>{s.node}</span>
                <AnimatedLogo size={26} wordmark={false} play="pulse" glow={true} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              {s.stack && (
                <div className={styles.stackRow}>
                  {s.stack.map((tag) => (
                    <span key={tag} className={styles.stackTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

