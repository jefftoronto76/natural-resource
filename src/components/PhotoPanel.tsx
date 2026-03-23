interface PhotoPanelProps {
  src?: string
  alt?: string
  caption?: string
  side?: 'left' | 'right'
}

export function PhotoPanel({ src, alt = '', caption, side = 'right' }: PhotoPanelProps) {
  const isPlaceholder = !src

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: side === 'right' ? '1fr 1fr' : '1fr 1fr',
      minHeight: '480px',
      borderBottom: '1px solid rgba(26,25,23,0.08)',
    }}>
      {side === 'left' && (
        <div style={{
          background: isPlaceholder ? 'rgba(26,25,23,0.04)' : 'transparent',
          position: 'relative', overflow: 'hidden',
          minHeight: '320px',
        }}>
          {isPlaceholder ? (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px',
            }}>
              <div style={{ width: '48px', height: '48px', border: '1px dashed rgba(26,25,23,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-dim)', fontSize: '20px' }}>↑</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>Photo placeholder</p>
            </div>
          ) : (
            <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
      )}

      <div style={{
        padding: 'clamp(48px, 6vw, 80px) clamp(32px, 5vw, 64px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {caption && (
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)',
            fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5,
            color: 'var(--color-text-muted)', maxWidth: '400px',
          }}>{caption}</p>
        )}
      </div>

      {side === 'right' && (
        <div style={{
          background: isPlaceholder ? 'rgba(26,25,23,0.04)' : 'transparent',
          position: 'relative', overflow: 'hidden',
          minHeight: '320px',
        }}>
          {isPlaceholder ? (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px',
            }}>
              <div style={{ width: '48px', height: '48px', border: '1px dashed rgba(26,25,23,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-dim)', fontSize: '20px' }}>↑</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>Photo placeholder</p>
            </div>
          ) : (
            <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nr-photo-panel { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
