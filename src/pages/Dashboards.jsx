import { useState, useRef } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'
import SectionHead from '../components/ui/SectionHead.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import AnimatedLogo from '../components/ui/AnimatedLogo.jsx'
import CtaBand from '../components/sections/CtaBand.jsx'
import { LIVE_POWERBI_EMBED_URL, dashboardCatalog } from '../data/dashboardData.js'
import styles from './Dashboards.module.css'

export default function Dashboards() {
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const pbiFrameContainerRef = useRef(null)

  const handleReloadIframe = () => {
    setIframeLoading(true)
    setIframeKey((prev) => prev + 1)
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (pbiFrameContainerRef.current?.requestFullscreen) {
        pbiFrameContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Live Power BI Deployment"
        title="Dashboards built to be trusted at a glance."
        description="Interact directly with our live Microsoft Power BI report deployment below. Filter data models, cross-highlight visual elements, and drill into metrics in real time."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className={isFullWidth ? styles.fullContainer : 'container'}>
          {/* Power BI Control Toolbar */}
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Status:</span>
              <span
                className={styles.filterBtn}
                style={{
                  borderColor: 'rgba(52, 211, 153, 0.4)',
                  background: 'rgba(52, 211, 153, 0.08)',
                  color: '#34d399',
                }}
              >
                <span
                  className={`${styles.statusBadgeDot} ${styles.pulseGreen}`}
                  style={{ margin: 0, marginRight: 6 }}
                />
                Live Cloud Service Connected
              </span>
            </div>

            <div className={styles.actionToolbar}>
              <button
                className={`btn btn-outline ${styles.toolBtn}`}
                onClick={handleReloadIframe}
                title="Reload live Power BI iframe"
              >
                ↻ Refresh Report
              </button>

              <button
                className={`btn btn-outline ${styles.toolBtn}`}
                onClick={() => setIsFullWidth(!isFullWidth)}
                title="Toggle full screen container width"
              >
                {isFullWidth ? 'Standard View' : 'Expand Full Width'}
              </button>

              <button
                className={`btn btn-outline ${styles.toolBtn}`}
                onClick={handleToggleFullscreen}
                title="View report in full screen mode"
              >
                ⛶ Fullscreen
              </button>

              <a
                href={LIVE_POWERBI_EMBED_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.directLinkBtn}
                title="Open live report directly in Power BI web"
              >
                <span>↗ Open in Power BI</span>
              </a>
            </div>
          </div>

          {/* Live Power BI Frame Container */}
          <Reveal className={`${styles.frame} ${isFullWidth ? styles.frameExpanded : ''}`}>
            <div className={styles.frameBar}>
              <div className={styles.frameTitleGroup}>
                <span className={`${styles.frameDot} live`} />
                <span className={styles.frameTitle}>
                  Microsoft Power BI Service — Live Embedded Session
                </span>
              </div>

              <div className={styles.frameBrandMeta}>
                <AnimatedLogo size={24} wordmark={false} play="pulse" glow={true} />
              </div>
            </div>

            {/* Iframe Viewport */}
            <div ref={pbiFrameContainerRef} className={styles.pbiFrameWrapper}>
              {iframeLoading && (
                <div className={styles.pbiLoading}>
                  <div className={styles.pbiSpinner} />
                  <span className={styles.pbiLoadingText}>
                    Connecting to Power BI Service & Rendering Visuals...
                  </span>
                </div>
              )}

              <iframe
                key={iframeKey}
                title="Synapse Analytics - Live Power BI Report"
                src={LIVE_POWERBI_EMBED_URL}
                className={styles.pbiIframe}
                allowFullScreen={true}
                onLoad={() => setIframeLoading(false)}
              />
            </div>

            {/* Live Metadata & Architecture Bar */}
            <div className={styles.pbiMetaBar}>
              <div className={styles.pbiMetaItem}>
                <span>Gateway:</span>
                <span className={styles.pbiMetaValue}>Power BI Service (Online)</span>
              </div>
              <div className={styles.pbiMetaItem}>
                <span>Security:</span>
                <span className={styles.pbiMetaValue}>Encrypted TLS 1.3 / Verified Embed</span>
              </div>
              <div className={styles.pbiMetaItem}>
                <span>Interactivity:</span>
                <span className={styles.pbiMetaValue}>
                  Slicers, Drilldowns & Visual Cross-Highlighting Active
                </span>
              </div>
            </div>
          </Reveal>

          <div className={styles.embedNote}>
            <p>
              <strong style={{ color: 'var(--paper)' }}>Live Deployment Active:</strong> You are
              interacting directly with the live published Microsoft Power BI report. Click and filter
              any chart or visual element within the frame to see cross-highlighting in real time.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Recent builds"
            title="Dashboards from the catalog"
            description="A sample of the report types we build most often — each one adapted to the client's actual data, not a generic template."
          />

          <div className={styles.catalogGrid}>
            {dashboardCatalog.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.08} className={styles.catalogCard}>
                <div className={styles.catalogTop}>
                  <span className={styles.catalogNode}>{d.node}</span>
                  <AnimatedLogo size={18} wordmark={false} play="idle" glow={false} />
                </div>
                <h3>{d.title}</h3>
                <p>{d.summary}</p>
                <div className={styles.tagRow}>
                  {d.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Want a dashboard like this for your data?"
        description="Send us what you're tracking now — we'll show you what it could look like."
        primaryLabel="Start a project"
      />
    </>
  )
}
