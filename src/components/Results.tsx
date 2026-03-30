'use client'

import { useReveal } from '@/hooks/useReveal'
import { TestimonialCarousel } from './TestimonialCarousel'

export function Results() {
  const ref = useReveal()

  const sectionPad = 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)'
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '13.75px',
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'rgba(26,25,23,0.37)', marginBottom: '40px',
    display: 'flex', alignItems: 'center', gap: '16px',
  }

  return (
    <section style={{ padding: sectionPad, borderBottom: '1px solid rgba(26,25,23,0.08)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={labelStyle}>
          <span style={{
            position: 'relative',
            display: 'inline-block',
            padding: '0 4px',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpath d='M2,14 C20,8 80,6 98,12 C99,16 95,20 80,21 C50,23 15,22 2,18 Z' fill='%232d6a4f' fill-opacity='0.2'/%3E%3C/svg%3E\")",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}>The Work</span>
          <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
        </p>

        <div ref={ref} className="reveal">
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)',
            fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)', marginBottom: '16px',
          }}>
            Built to last. <em style={{ fontStyle: 'italic' }}>Built to learn.</em>
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 1.8vw, 17px)', lineHeight: 1.8,
            color: 'var(--color-text-muted)', fontWeight: 400,
            maxWidth: '640px', marginBottom: '48px',
          }}>
            Fifteen years building a market leader. Then a deliberate choice to stay restless — new companies, new models, new outcomes.
          </p>

          <TestimonialCarousel />
        </div>
      </div>
    </section>
  )
}
