import Reveal from './Reveal.jsx'

export default function SectionHead({ eyebrow, title, description }) {
  return (
    <Reveal className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </Reveal>
  )
}
