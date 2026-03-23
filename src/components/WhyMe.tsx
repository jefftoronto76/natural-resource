import { useReveal } from '@/hooks/useReveal'
import { CareerTimeline } from './CareerTimeline'

const STATS = [
  { value: '27', label: 'Years operating' },
  { value: '$25M', label: 'Personal quota scaled' },
  { value: '9×', label: 'ARR growth, Meal Garden' },
  { value: 'ICF', label: 'Coaching methodology' },
]

export function WhyMe() {
  const ref = useReveal()
  const statsRef = useReveal()

  const sectionPad = 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)'
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '11px',
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'var(--color-text-dim)', marginBottom: '40px',
    display: 'flex', alignItems: 'center', gap: '16px',
  }
  const bodyStyle: React.CSSProperties = {
    fontSize: 'clamp(16px, 1.8vw, 17px)', lineHeight: 1.8,
    color: 'var(--color-text-muted)', fontWeight: 400, marginBottom: '20px',
  }
  const quoteStyle: React.CSSProperties = {
    borderLeft: '2px solid var(--color-accent)',
    paddingLeft: '24px', marginTop: '32px',
  }

  return (
    <>
      <section id="about" style={{ padding: sectionPad, borderBottom: '1px solid rgba(26,25,23,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={labelStyle}>
            Why <span className="highlight-marker">Me</span>
            <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
          </p>

          <div className="nr-split">
            <div ref={ref} className="reveal">
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)',
                fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)', marginBottom: '28px',
              }}>
                Built in the<br /><em style={{ fontStyle: 'italic' }}>hard rooms.</em>
              </h2>
              <p style={bodyStyle}>My operating approach was shaped inside Constellation Software — where growth is earned through discipline, not narrative. Over 13 years at Trapeze Group, I scaled personal quota from $350K to $25M.</p>
              <p style={bodyStyle}>Since then: Head of Revenue at Keyhole (acquired by Muck Rack), GM at Meal Garden where a product-led motion drove ninefold ARR growth. And a Graduate Certificate in Executive Coaching from Royal Roads University.</p>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>Today I work with founders, operators, and revenue leaders — coaching the people and scoping the problems that need both.</p>

              <div style={quoteStyle}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 1.8vw, 20px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.6, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                  "I took that advice and went out guns blazing — #1 on my team and #2 in Canada."
                </p>
                <cite style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-dim)', fontStyle: 'normal' }}>
                  — Chris Chun, Intuit
                </cite>
              </div>
              <div style={{ ...quoteStyle, marginTop: '24px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 1.8vw, 20px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.6, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                  "A very capable leader, an advocate for the customer base, and a true partner as we re-built our sales organization."
                </p>
                <cite style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-dim)', fontStyle: 'normal' }}>
                  — Jim Schnepp, VP Sales, Trapeze Group
                </cite>
              </div>
            </div>

            <div ref={statsRef} className="reveal">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(26,25,23,0.08)' }}>
                {STATS.map(({ value, label }) => (
                  <div key={label} style={{ background: 'var(--color-bg)', padding: 'clamp(24px, 3vw, 36px) clamp(20px, 2.5vw, 28px)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 400, color: 'var(--color-accent)', lineHeight: 1, marginBottom: '8px' }}>{value}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .nr-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .nr-split {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }
      `}</style>
      <CareerTimeline />
    </>
  )
}
