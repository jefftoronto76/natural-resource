import { useState, useRef } from 'react'

const STOPS = [
  {
    year: '1998–2013',
    company: 'Trapeze Group',
    role: 'Account Manager → Sales Director',
    context: 'Constellation Software — first operating company',
    milestones: [
      { label: 'Quota growth', value: '$350K → $25M' },
      { label: 'Tenure', value: '13 years' },
      { label: 'Markets', value: 'Transit, Paratransit, Rail' },
    ],
    note: 'Built the go-to-market foundation. Scaled from rep to director while maintaining top performer status every year.',
  },
  {
    year: '2014–2016',
    company: 'Infor',
    role: 'Senior Account Executive',
    context: 'Enterprise HCM & Workforce Management',
    milestones: [
      { label: 'Largest deal in Canada', value: '$2.1M' },
      { label: 'Deal type', value: 'Enterprise, multi-stakeholder' },
      { label: 'Method', value: 'Strategic patience' },
    ],
    note: 'Spotted a WFM opportunity others dismissed. Closed the largest Canadian deal in Infor\'s history by aligning stakeholders across a 3-year cycle.',
  },
  {
    year: '2017–2019',
    company: 'Keyhole',
    role: 'Head of Revenue',
    context: 'Analytics SaaS — acquired by Muck Rack',
    milestones: [
      { label: 'Deal size', value: '2× in 15 months' },
      { label: 'Key accounts', value: 'Spotify, UFC' },
      { label: 'Outcome', value: 'Acquisition' },
    ],
    note: 'Rebuilt the revenue team while maintaining growth. Closed marquee enterprise accounts. Company acquired by Muck Rack.',
  },
  {
    year: '2020–2022',
    company: 'Meal Garden',
    role: 'General Manager',
    context: 'Health tech SaaS — product-led growth',
    milestones: [
      { label: 'ARR growth', value: '9×' },
      { label: 'Motion', value: 'Product-led' },
      { label: 'Outcome', value: 'Clean exit' },
    ],
    note: 'Took over a stalled product. Rebuilt pricing, marketing, and delivery simultaneously. Drove ninefold ARR growth through a PLG motion before negotiating a clean exit.',
  },
  {
    year: '2015 / 2023–',
    company: 'Natural Resource',
    role: 'Founder — Coach & Operator',
    context: 'Royal Roads University, ICF-aligned',
    milestones: [
      { label: 'Credential', value: 'Graduate Certificate' },
      { label: 'Methodology', value: 'ICF-aligned' },
      { label: 'Focus', value: 'Revenue & Operations' },
    ],
    note: 'Graduate Certificate in Executive Coaching from Royal Roads University. Coaching ambitious professionals and operators while taking on embedded execution work.',
  },
]

export function CareerTimeline() {
  const [open, setOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ borderTop: '1px solid rgba(26,25,23,0.08)', marginTop: '0' }}>

      {/* Toggle button */}
      <div style={{ padding: 'clamp(24px, 3vw, 32px) clamp(24px, 5vw, 48px)' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '12px',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            padding: 0, transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <span style={{
            width: '18px', height: '18px',
            border: '1px solid rgba(26,25,23,0.2)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.3s ease',
            transform: open ? 'rotate(45deg)' : 'none',
            fontSize: '14px', lineHeight: 1, color: 'var(--color-accent)',
            flexShrink: 0,
          } as React.CSSProperties}>+</span>
          {open ? 'Close' : 'Career highlights'}
        </button>
      </div>

      {/* Expandable timeline */}
      <div style={{
        maxHeight: open ? '600px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ borderTop: '1px solid rgba(26,25,23,0.06)', paddingBottom: '48px' }}>

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            style={{
              overflowX: 'auto', overflowY: 'hidden',
              paddingLeft: 'clamp(24px, 5vw, 48px)',
              paddingRight: 'clamp(24px, 5vw, 48px)',
              paddingTop: '40px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>{`.nr-timeline-scroll::-webkit-scrollbar { display: none; }`}</style>

            {/* Timeline track */}
            <div style={{
              display: 'flex', gap: '0',
              minWidth: 'max-content',
              position: 'relative',
            }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute',
                top: '20px', left: '20px',
                right: '20px', height: '1px',
                background: 'rgba(26,25,23,0.1)',
                zIndex: 0,
              }} />

              {STOPS.map((stop, i) => (
                <div key={stop.company} style={{
                  width: '280px', flexShrink: 0,
                  paddingRight: i < STOPS.length - 1 ? '32px' : '0',
                  position: 'relative', zIndex: 1,
                }}>
                  {/* Dot */}
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: 'var(--color-accent)',
                    border: '2px solid var(--color-bg)',
                    outline: '1px solid var(--color-accent)',
                    marginBottom: '20px',
                    marginLeft: '4px',
                  }} />

                  {/* Card */}
                  <div style={{
                    background: 'var(--color-bg)',
                    border: '1px solid rgba(26,25,23,0.08)',
                    padding: '24px',
                  }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--color-accent)', marginBottom: '6px' }}>{stop.year}</p>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>{stop.company}</h4>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{stop.role}</p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', marginBottom: '20px', fontStyle: 'italic' }}>{stop.context}</p>

                    {/* Milestones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid rgba(26,25,23,0.06)' }}>
                      {stop.milestones.map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.06em', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>{label}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'var(--color-text-primary)', textAlign: 'right' }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--color-text-muted)', borderTop: '1px solid rgba(26,25,23,0.06)', paddingTop: '16px' }}>{stop.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-dim)', paddingLeft: 'clamp(24px, 5vw, 48px)', marginTop: '16px' }}>
            ← scroll →
          </p>
        </div>
      </div>
    </div>
  )
}
