export function Hero() {
  return (
    <>
      <section id="hero" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 'clamp(100px, 12vw, 140px) clamp(24px, 5vw, 48px) 80px',
        borderBottom: '1px solid rgba(26,25,23,0.08)',
        background: 'var(--color-bg)',
      }}>
        <div style={{ maxWidth: '860px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--color-text-dim)', marginBottom: '40px',
          }}>Performance-Driven, <span style={{
            background: 'rgba(45, 106, 79, 0.15)',
            padding: '2px 6px',
            borderRadius: '2px',
          }}>Heart-Led</span></p>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 72px)',
            fontWeight: 400, lineHeight: 1.06, letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)', marginBottom: '32px',
          }}>
            Better close rates.<br />
            Deeper relationships.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>Revenue growth, made easier.</em>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.7, fontWeight: 400,
            color: 'var(--color-text-muted)', maxWidth: '540px', marginBottom: '48px',
          }}>
            I'm Jeff Lougheed, a revenue and operations leader who helps technology companies and ambitious professionals fix the problems slowing growth.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="#session" style={{
              display: 'inline-block', background: 'var(--color-text-primary)',
              color: 'var(--color-bg)', fontFamily: 'var(--font-mono)',
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '16px 32px', textDecoration: 'none',
            }}>Book a Session — $250</a>
            <a href="#chat" style={{
              display: 'inline-block', background: 'transparent',
              color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '16px 32px', textDecoration: 'none',
              border: '1px solid rgba(26,25,23,0.15)',
            }}>Ask a Question</a>
          </div>
        </div>
      </section>
    </>
  )
}
