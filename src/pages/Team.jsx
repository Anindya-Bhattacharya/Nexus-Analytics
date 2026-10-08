import PageHeader from '../components/ui/PageHeader.jsx'
import SectionHead from '../components/ui/SectionHead.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import AnimatedLogo from '../components/ui/AnimatedLogo.jsx'
import CtaBand from '../components/sections/CtaBand.jsx'
import { team } from '../data/team.js'
import styles from './Team.module.css'

const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

const process = [
  {
    node: 'Step 01',
    title: 'Data Collection & Preprocessing',
    description: 'Manish collects, pre-processes, and structures raw inputs into clean, query-ready models.',
  },
  {
    node: 'Step 02',
    title: 'Power BI Modeling, Visualization & Reports',
    description: 'Anindya, Suman, and Dipankar engineer the data models, design intuitive dashboards, and build publication-grade analytical reports.',
  },
  {
    node: 'Step 03',
    title: 'Frontend, Database & Authentication',
    description: 'Rupankar designs the complete web application, manages database infrastructure, and integrates secure authentication.',
  },
]

export default function Team() {
  return (
    <>
      <PageHeader
        eyebrow="Our team"
        title="Five specialists. Every project, dedicated hands-on expertise."
        description="No account managers, no hand-offs between departments. The people listed here are the people who build your project."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.grid}>
            {team.map((member, i) => (
              <Reveal key={member.id} delay={i * 0.1} className={styles.card}>
                <AnimatedLogo size={120} wordmark={false} play="idle" glow={false} className={styles.hexDeco} />
                <span className={styles.node}>{member.node}</span>

                {/* Photo or initials avatar */}
                {member.photo ? (
                  <div className={styles.photoWrap}>
                    <img
                      src={member.photo}
                      alt={`${member.name} profile`}
                      className={styles.photo}
                    />
                    <div className={styles.photoGlow} />
                  </div>
                ) : (
                  <div className={styles.avatar}>{initials(member.name)}</div>
                )}

                <h3>{member.name}</h3>
                <span className={styles.role}>{member.role}</span>
                <p className={styles.focus}>{member.focus}</p>

                {/* Contact links — only if defined */}
                {(member.email || member.phone || member.linkedin) && (
                  <div className={styles.contactRow}>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className={styles.contactLink}
                        title="Call"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.5 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {member.phone}
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className={styles.contactLink}
                        title="Email"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        {member.email}
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactLink}
                        title="LinkedIn"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}

                <div className={styles.stackRow}>
                  {member.stack.map((s) => (
                    <span key={s} className={styles.stackTag}>
                      {s}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="How we collaborate"
            title="What a project actually looks like"
          />
          <div className={styles.processRow}>
            {process.map((p, i) => (
              <Reveal key={p.node} delay={i * 0.1} className={styles.processItem}>
                <span className={styles.processNode}>{p.node}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to work with the whole team?"
        description="One message reaches all five of us — no routing, no waiting on a reply from someone else."
        primaryLabel="Contact us"
        secondaryLabel="See our dashboards"
        secondaryTo="/dashboards"
      />
    </>
  )
}
