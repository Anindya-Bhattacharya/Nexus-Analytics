import PageHeader from '../components/ui/PageHeader.jsx'
import SectionHead from '../components/ui/SectionHead.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import CtaBand from '../components/sections/CtaBand.jsx'
import { values } from '../data/values.js'
import styles from './About.module.css'

const stack = [
  'React', 'Django', 'Python', 'JavaScript', 'CSS',
  'Power BI', 'DAX', 'SQL', 'Data Modeling',
]

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About the studio"
        title="A studio built around one idea: your data and your interface should come from the same team."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.storyGrid}>
            <Reveal className={styles.storyCopy}>
              <p>
                <strong>Synapse Analytics</strong> started as a simple frustration:
                the people who build a company's dashboards rarely talk to the
                people who build the site those dashboards live on. Insight gets
                lost in the handoff.
              </p>
              <p>
                So we built a studio where that handoff doesn't exist. Five
                specialists, two disciplines, one room — front-end development and
                Power BI dashboard design, worked on side by side instead of
                passed between vendors.
              </p>
              <p>
                The result is work that's consistent end to end: a dashboard that
                looks like it belongs on your site, on a site that was actually
                built to hold it.
              </p>
            </Reveal>

            <Reveal delay={0.15} className={styles.statCard}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Team size</span>
                <span className={styles.statValue}>5 people</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Core disciplines</span>
                <span className={styles.statValue}>Frontend + Power BI</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Primary stack</span>
                <span className={styles.statValue}>React & Power BI</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Working style</span>
                <span className={styles.statValue}>Collaborative, in-house</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="How we work"
            title="What we optimize for"
            description="Not principles for the sake of principles — the actual decisions that shape every project we take on."
          />

          <div className={styles.valuesList}>
            {values.map((v, i) => (
              <Reveal key={v.node} delay={i * 0.08} className={styles.valueRow}>
                <span className={styles.valueNode}>{v.node}</span>
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Toolkit" title="What we build with" />
          <Reveal className={styles.stackGrid}>
            {stack.map((tool) => (
              <span key={tool} className={styles.stackPill}>
                {tool}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Want the same team on your project?"
        description="We take on a limited number of projects at a time — small studio, on purpose."
        primaryLabel="Get in touch"
        secondaryLabel="Meet the team"
        secondaryTo="/team"
      />
    </>
  )
}
