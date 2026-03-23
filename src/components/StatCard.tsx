import { Card } from './Card'

interface StatCardProps {
  value: string
  label: string
  company?: string
  note?: string
}

export function StatCard({ value, label, company, note }: StatCardProps) {
  return (
    <Card mode="emphasize" expandedContent={note ? <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-muted)' }}>{note}</p> : undefined}>
      {company && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-text-dim)', marginBottom: '20px',
        }}>{company}</p>
      )}
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 72px)',
        fontWeight: 400, lineHeight: 1, color: 'var(--color-accent)',
        marginBottom: '10px',
      }}>{value}</p>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '11px',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
      }}>{label}</p>
    </Card>
  )
}
