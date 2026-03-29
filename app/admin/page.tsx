export default function AdminPage() {
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)',
        fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--color-text-primary)',
        marginBottom: '8px',
      }}>
        Chat Sessions
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '15px',
        color: 'var(--color-text-muted)', marginBottom: '48px',
      }}>
        Sage conversation history.
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-dim)' }}>
        Session persistence coming in the next step.
      </p>
    </div>
  )
}
