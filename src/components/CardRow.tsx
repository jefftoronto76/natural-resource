import { useRef, useState, useEffect } from 'react'

interface CardRowProps {
  children: React.ReactNode
  cardWidth?: number
  peek?: boolean
  label?: string
  headline?: string
  subheadline?: string
}

export function CardRow({ children, cardWidth = 320, label, headline, subheadline }: CardRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const childCount = Array.isArray(children) ? children.length : 1

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const scrollLeft = el.scrollLeft
    const index = Math.round(scrollLeft / (cardWidth + 24))
    setActive(Math.min(index, childCount - 1))
  }

  const scrollTo = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: index * (cardWidth + 24), behavior: 'smooth' })
    setActive(index)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderBottom: '1px solid rgba(26,25,23,0.08)' }}>

      {/* Section header */}
      {(label || headline || subheadline) && (
        <div style={{ padding: '0 clamp(24px, 5vw, 48px)', marginBottom: '48px' }}>
          {label && (
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--color-text-dim)', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              {label}
              <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
            </p>
          )}
          {headline && (
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)',
              fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)', marginBottom: subheadline ? '16px' : '0',
            }}
              dangerouslySetInnerHTML={{ __html: headline }}
            />
          )}
          {subheadline && (
            <p style={{
              fontSize: 'clamp(16px, 1.8vw, 18px)', lineHeight: 1.7,
              color: 'var(--color-text-muted)', maxWidth: '600px', fontWeight: 400,
            }}>
              {subheadline}
            </p>
          )}
        </div>
      )}

      {/* Scrollable card row */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          overflowY: 'visible',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingLeft: 'clamp(24px, 5vw, 48px)',
          paddingRight: 'clamp(24px, 5vw, 48px)',
          paddingBottom: '8px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`.nr-card-row::-webkit-scrollbar { display: none; }`}</style>
        {Array.isArray(children)
          ? children.map((child, i) => (
            <div key={i} style={{
              width: `${cardWidth}px`,
              minWidth: `${cardWidth}px`,
              scrollSnapAlign: 'start',
            }}>
              {child}
            </div>
          ))
          : <div style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px`, scrollSnapAlign: 'start' }}>{children}</div>
        }
        {/* Right padding spacer */}
        <div style={{ width: '1px', flexShrink: 0 }} />
      </div>

      {/* Dot indicators */}
      {childCount > 1 && (
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'center',
          marginTop: '28px', paddingLeft: 'clamp(24px, 5vw, 48px)',
        }}>
          {Array.from({ length: childCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              style={{
                width: i === active ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === active ? 'var(--color-accent)' : 'rgba(26,25,23,0.15)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
