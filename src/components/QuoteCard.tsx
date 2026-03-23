import { Card } from './Card'

interface QuoteCardProps {
  quote: string
  name: string
  role: string
  relationship: string
}

export function QuoteCard({ quote, name, role, relationship }: QuoteCardProps) {
  return (
    <Card mode="emphasize">
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2vw, 22px)',
        fontStyle: 'italic', fontWeight: 400, lineHeight: 1.55,
        color: 'var(--color-text-primary)', marginBottom: '24px',
      }}>
        "{quote}"
      </p>
      <div style={{ borderTop: '1px solid rgba(26,25,23,0.08)', paddingTop: '16px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '16px',
          fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px',
        }}>{name}</p>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.1em', color: 'var(--color-text-muted)',
          textTransform: 'uppercase', marginBottom: '4px',
        }}>{role}</p>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.08em', color: 'var(--color-text-dim)',
          textTransform: 'uppercase',
        }}>{relationship}</p>
      </div>
    </Card>
  )
}
