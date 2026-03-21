import { useReveal } from '@/hooks/useReveal'

export function Problem() {
  const ref = useReveal()
  return (
    <section style={{
      padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)',
      borderBottom: '1px solid rgba(26,25,23,0.08)',
    }}>
      <div ref={ref} className="reveal" style={{ maxWidth: '700px' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--color-text-dim)', marginBottom: '40px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          The Work
          <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 56px)',
          fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em',
          color: 'var(--color-text-primary)', marginBottom: '24px',
        }}>
          Most problems aren't<br />
          <em style={{ fontStyle: 'italic' }}>what they look like.</em>
        </h2>
        <p style={{ fontSize: 'clamp(16px, 1.8vw, 18px)', lineHeight: 1.8, color: 'var(--color-text-muted)', fontWeight: 400 }}>
          Pipeline issues are usually people issues. Growth ceilings are usually judgment issues. Bad projects are usually clarity issues. I help you find the real problem — and build the capability to solve it.
        </p>
      </div>
    </section>
  )
}
