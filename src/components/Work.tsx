import { useReveal } from '@/hooks/useReveal'

const LANES = [
  {
    number: '01', title: '1-on-1 Coaching',
    audience: 'For ambitious professionals',
    body: 'For ambitious professionals who need help. I help you identify the root cause and build a practical plan to address it.',
    items: ['Pipeline management', 'Account strategy', 'Team dynamics', 'Leadership challenges', 'A bad project', "A promotion you're working toward", "Figuring out what's next"],
  },
  {
    number: '02', title: 'Embedded Execution',
    audience: 'For founders, CEOs, and PE leaders',
    body: "For organizations that need to move faster without breaking what they're building.",
    items: ["Systems that aren't scaling", "A pipeline that isn't converting", 'An AI strategy that needs to get real', "A project that's gone sideways", 'A leadership gap creating drag'],
  },
]

export function Work() {
  const ref = useReveal()
  return (
    <>
      <section id="work" style={{ padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)', borderBottom: '1px solid rgba(26,25,23,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div ref={ref} className="reveal" style={{ marginBottom: '48px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              Two <span className="highlight-marker">Levers</span>
              <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              One operator.<br /><em style={{ fontStyle: 'italic' }}>Two ways in.</em>
            </h2>
          </div>

          <div className="nr-lanes">
            {LANES.map(({ number, title, audience, body, items }) => {
              const laneRef = useReveal()
              return (
                <div key={number} ref={laneRef} className="reveal" style={{ background: 'var(--color-bg)', padding: 'clamp(32px, 4vw, 48px) clamp(24px, 3.5vw, 40px)' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(26,25,23,0.2)', marginBottom: '24px' }}>{number}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '12px' }}>{audience}</p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: '16px', lineHeight: 1.2 }}>{title}</h3>
                  <p style={{ fontSize: 'clamp(16px, 1.6vw, 17px)', lineHeight: 1.75, color: 'var(--color-text-muted)', fontWeight: 400, marginBottom: '28px' }}>{body}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '16px', height: '1px', background: 'var(--color-accent)', opacity: 0.5, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <style>{`
        .nr-lanes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: rgba(26,25,23,0.08);
        }
        @media (max-width: 768px) {
          .nr-lanes { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
