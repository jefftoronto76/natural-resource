import { Card } from './Card'

interface ServiceCardProps {
  number: string
  title: string
  audience: string
  body: string
  items: string[]
  tags: string[]
  ctaHref?: string
}

export function ServiceCard({ number, title, audience, body, items, tags, ctaHref = '#session' }: ServiceCardProps) {
  return (
    <Card
      mode="focus"
      expandedContent={
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {items.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '16px', height: '1px', background: 'var(--color-accent)', opacity: 0.5, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
            {tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '6px 14px', border: '1px solid rgba(26,25,23,0.12)',
                color: 'var(--color-text-dim)',
              }}>{tag}</span>
            ))}
          </div>
          <a href={ctaHref} style={{
            display: 'inline-block', background: 'var(--color-text-primary)',
            color: 'var(--color-bg)', fontFamily: 'var(--font-mono)',
            fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
            padding: '15px 32px', textDecoration: 'none',
          }}>Book a Session — $250</a>
        </div>
      }
    >
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '11px',
        letterSpacing: '0.2em', color: 'rgba(26,25,23,0.2)', marginBottom: '20px',
      }}>{number}</p>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '11px',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--color-accent)', marginBottom: '10px',
      }}>{audience}</p>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 32px)',
        fontWeight: 400, color: 'var(--color-text-primary)',
        marginBottom: '14px', lineHeight: 1.2,
      }}>{title}</h3>
      <p style={{
        fontSize: '16px', lineHeight: 1.75,
        color: 'var(--color-text-muted)', fontWeight: 400,
      }}>{body}</p>
    </Card>
  )
}
