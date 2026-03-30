'use client'

import { useReveal } from '@/hooks/useReveal'
import { CareerTimeline } from './CareerTimeline'
import { TestimonialCarousel } from './TestimonialCarousel'
import { QuoteCarouselSection } from './QuoteCarouselSection'

const STATS = [
  { value: '27', label: 'Years operating' },
  { value: '$25M', label: 'Personal quota scaled' },
  { value: '9×', label: 'ARR growth, Meal Garden' },
  { value: 'ICF', label: 'Coaching methodology' },
]

export function WhyMe() {
  const ref = useReveal()
  const carouselRef = useReveal()

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
            <span style={{
              position: 'relative',
              display: 'inline-block',
              padding: '0 4px',
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpath d='M2,14 C20,8 80,6 98,12 C99,16 95,20 80,21 C50,23 15,22 2,18 Z' fill='%232d6a4f' fill-opacity='0.2'/%3E%3C/svg%3E\")",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}>How I Operate</span>
            <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
          </p>

          <div className="nr-split">
            <div ref={ref} className="reveal nr-content-block">
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)',
                fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)', marginBottom: '28px',
              }}>
                Prioritize. Execute. <em style={{ fontStyle: 'italic' }}>Evolve.</em>
              </h2>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ ...bodyStyle, marginBottom: 0 }}>These are the qualities that have made me effective across the teams I've worked with and the outcomes I've delivered.</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ ...bodyStyle, fontWeight: 700, marginBottom: '4px' }}>I'm a player-coach.</p>
                <p style={{ ...bodyStyle, marginBottom: 0 }}>I operate at the decision level and get on the field when execution is the lever.</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ ...bodyStyle, fontWeight: 700, marginBottom: '4px' }}>Most of my career, I've worked directly with founders and GMs.</p>
                <p style={{ ...bodyStyle, marginBottom: 0 }}>I understand how to prioritize, think, and execute — not just advise.</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ ...bodyStyle, fontWeight: 700, marginBottom: '4px' }}>I deliver results with people, not through them.</p>
                <p style={{ ...bodyStyle, marginBottom: 0 }}>Because growth only sticks when your team knows how to carry it forward.</p>
              </div>
              <div>
                <p style={{ ...bodyStyle, fontWeight: 700, marginBottom: '4px' }}>Continuous learner. Active feedback seeker.</p>
                <p style={{ ...bodyStyle, marginBottom: 0 }}>I stay sharp by constantly refining how I think and execute.</p>
              </div>
            </div>

            <div ref={carouselRef} className="reveal">
              <TestimonialCarousel />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .nr-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .nr-split {
            grid-template-columns: 1fr;
            gap: 48px;
            align-items: start;
          }
        }
      `}</style>
      <QuoteCarouselSection />
      {/* <CareerTimeline /> */}
    </>
  )
}
