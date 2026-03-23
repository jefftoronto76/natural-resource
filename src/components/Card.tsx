import { useState, useEffect } from 'react'

export type CardMode = 'emphasize' | 'focus'

export interface CardProps {
  mode: CardMode
  children: React.ReactNode
  expandedContent?: React.ReactNode
  className?: string
}

export function Card({ mode, children, expandedContent }: CardProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (active && mode === 'focus') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [active, mode])

  if (mode === 'emphasize') {
    return (
      <div
        onClick={() => setActive(!active)}
        style={{
          cursor: 'pointer',
          border: '1px solid rgba(26,25,23,0.08)',
          background: active ? '#fff' : 'var(--color-bg)',
          padding: '28px',
          transition: 'all 0.3s ease',
          transform: active ? 'scale(1.02)' : 'scale(1)',
          boxShadow: active ? '0 8px 32px rgba(26,25,23,0.08)' : 'none',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {children}
        {active && expandedContent && (
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(26,25,23,0.08)',
            animation: 'fadeIn 0.25s ease',
          }}>
            {expandedContent}
          </div>
        )}
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    )
  }

  return (
    <>
      <div
        onClick={() => setActive(true)}
        style={{
          cursor: 'pointer',
          border: '1px solid rgba(26,25,23,0.08)',
          background: 'var(--color-bg)',
          padding: '28px',
          transition: 'all 0.25s ease',
          flexShrink: 0,
          position: 'relative',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,25,23,0.2)'
          ;(e.currentTarget as HTMLElement).style.background = '#fff'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,25,23,0.08)'
          ;(e.currentTarget as HTMLElement).style.background = 'var(--color-bg)'
        }}
      >
        {children}
        <div style={{
          marginTop: '20px',
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          Learn more
          <span style={{ fontSize: '14px' }}>→</span>
        </div>
      </div>

      {active && (
        <div
          onClick={() => setActive(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(26,25,23,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'overlayIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-bg)',
              maxWidth: '680px', width: '100%',
              maxHeight: '85vh', overflowY: 'auto',
              padding: 'clamp(32px, 4vw, 52px)',
              position: 'relative',
              animation: 'modalIn 0.25s ease',
            }}
          >
            <button
              onClick={() => setActive(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >Close ✕</button>
            {children}
            {expandedContent && (
              <div style={{ marginTop: '28px', paddingTop: '28px', borderTop: '1px solid rgba(26,25,23,0.08)' }}>
                {expandedContent}
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  )
}
