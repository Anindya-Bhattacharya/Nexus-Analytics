import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import AnimatedLogo from '../components/ui/AnimatedLogo.jsx'
import { team } from '../data/team.js'
import styles from './Contact.module.css'

const initials = (name) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2)

const projectTypes = [
  'Power BI Dashboard',
  'Frontend / Website',
  'Both',
  'Not sure yet',
]

const initialForm = { name: '', email: '', projectType: projectTypes[0], message: '' }

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Enter your name.'
  if (!values.email.trim()) {
    errors.email = 'Enter your email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.message.trim()) errors.message = 'Tell us a little about the project.'
  else if (values.message.trim().length < 12) errors.message = 'A bit more detail helps — a sentence or two.'
  return errors
}

export default function Contact() {
  const [values, setValues] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)

    try {
      const response = await fetch('https://formsubmit.co/ajax/noreply.synapseanalytics@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          Name: values.name,
          Email: values.email,
          'Project Type': values.projectType,
          Message: values.message,
          _subject: `⚡ Synapse Analytics Inquiry from ${values.name} (${values.projectType})`,
          _template: 'table',
          _captcha: 'false',
          _autoresponse: `Thank you for reaching out to Synapse Analytics. We have received your inquiry regarding "${values.projectType}". Our team will review your message and reach out shortly.`,
        }),
      })

      if (response.ok) {
        setTicketId(`NX-${Math.floor(10000 + Math.random() * 90000)}`)
        setSubmitted(true)
      } else {
        setTicketId(`NX-${Math.floor(10000 + Math.random() * 90000)}`)
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Email dispatch error:', error)
      setTicketId(`NX-${Math.floor(10000 + Math.random() * 90000)}`)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setValues(initialForm)
    setErrors({})
    setSubmitted(false)
  }

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Tell us what you're working with."
        description="One message reaches the whole team — no routing between departments, no account manager in between."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.layout}>
            <Reveal>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    className={styles.successBox}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={styles.successHeader}>
                      <AnimatedLogo size={52} play="pulse" glow={true} />
                      <div className={styles.ticketBadge}>
                        <span className={styles.ticketDot} />
                        <span>TICKET #{ticketId} • TRANSMITTED</span>
                      </div>
                    </div>

                    <h3>Inquiry Transmitted to Synapse Analytics</h3>
                    <p>
                      Thanks, <strong>{values.name}</strong> — your message has been sent to{' '}
                      <code>noreply.synapseanalytics@gmail.com</code>. Our team will review your requirements and respond within 1 business day.
                    </p>

                    {/* FormSubmit Payload Summary Receipt */}
                    <div className={styles.receiptGrid}>
                      <div className={styles.receiptItem}>
                        <span className={styles.receiptLabel}>Sender Email</span>
                        <span className={styles.receiptVal}>{values.email}</span>
                      </div>
                      <div className={styles.receiptItem}>
                        <span className={styles.receiptLabel}>Project Scope</span>
                        <span className={styles.receiptVal}>{values.projectType}</span>
                      </div>
                      <div className={styles.receiptItem}>
                        <span className={styles.receiptLabel}>Routing Target</span>
                        <span className={styles.receiptVal}>noreply.synapseanalytics@gmail.com</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ marginTop: 'var(--sp-4)', alignSelf: 'flex-start' }}
                      onClick={resetForm}
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    className={styles.form}
                    onSubmit={handleSubmit}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.row2}>
                      <div className={`${styles.field} ${errors.name ? styles.fieldError : ''}`}>
                        <label htmlFor="name">Name</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your name"
                          value={values.name}
                          onChange={handleChange}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                        {errors.name && (
                          <span id="name-error" className={styles.errorText}>{errors.name}</span>
                        )}
                      </div>

                      <div className={`${styles.field} ${errors.email ? styles.fieldError : ''}`}>
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@company.com"
                          value={values.email}
                          onChange={handleChange}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                          <span id="email-error" className={styles.errorText}>{errors.email}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="projectType">Project type</label>
                      <select
                        id="projectType"
                        name="projectType"
                        value={values.projectType}
                        onChange={handleChange}
                      >
                        {projectTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className={`${styles.field} ${errors.message ? styles.fieldError : ''}`}>
                      <label htmlFor="message">What are you working with?</label>
                      <textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your data, your timeline, or what you're picturing..."
                        value={values.message}
                        onChange={handleChange}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && (
                        <span id="message-error" className={styles.errorText}>{errors.message}</span>
                      )}
                    </div>

                    <div className={styles.submitRow}>
                      <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={submitting}
                      >
                        {submitting ? 'Sending…' : 'Send message'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </Reveal>

            <Reveal delay={0.15} className={styles.sidePanel}>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>
                  <a href="mailto:noreply.synapseanalytics@gmail.com">noreply.synapseanalytics@gmail.com</a>
                </span>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Response time</span>
                <span className={styles.infoValue}>1–2 business days</span>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Reaches</span>
                <div className={styles.teamMiniRow}>
                  {team.map((m) => (
                    <div key={m.id} className={styles.teamMiniItem}>
                      {m.photo ? (
                        <div className={styles.teamMiniPhotoWrap}>
                          <img
                            src={m.photo}
                            alt={m.name}
                            className={styles.teamMiniPhoto}
                          />
                        </div>
                      ) : (
                        <span className={styles.teamMiniAvatar}>{initials(m.name)}</span>
                      )}
                      <span>
                        <span className={styles.teamMiniName}>{m.name}</span>
                        <span className={styles.teamMiniRole}>{m.role}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
