import { useReveal } from '@/hooks/useReveal'

export function Session() {
  const ref = useReveal()
  return (
    <section id="session" style={{ padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)', borderBottom: '1px solid rgba(26,25,23,0.08)' }}>
      <div ref={ref} className="reveal" style={{ maxWidth: '680px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          How to Start
          <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: '32px' }}>
          Whichever lane fits,<br /><em style={{ fontStyle: 'italic' }}>both start here.</em>
        </h2>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 7vw, 80px)', fontWeight: 400, color: 'var(--color-accent)', lineHeight: 1 }}>$250</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '32px', marginTop: '8px' }}>Single session — 60 minutes</p>

        <div style={{ border: '1px solid rgba(26,25,23,0.1)', padding: 'clamp(24px, 3vw, 40px)', position: 'relative', marginBottom: '16px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--color-accent)' }} />
          <div style={{ border: '1px dashed rgba(26,25,23,0.12)', padding: '28px', textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>Calendly Embed — Placeholder</p>
          </div>
          <div style={{ border: '1px dashed rgba(26,25,23,0.12)', padding: '28px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>Stripe Payment — Placeholder</p>
          </div>
        </div>
        <p style={{ fontSize: '16px', color: 'var(--color-text-dim)', lineHeight: 1.7 }}>
          ICF-aligned. Root-cause focused. Designed to help you find the right path forward. Not every engagement is a fit — if it isn't, you'll know by the end of the session.
        </p>
      </div>
    </section>
  )
}
