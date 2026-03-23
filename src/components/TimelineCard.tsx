import { Card } from './Card'

interface Milestone {
  label: string
  value: string
}

interface TimelineCardProps {
  year: string
  company: string
  role: string
  context: string
  milestones: Milestone[]
  note: string
  isLast?: boolean
  logoText?: string
  isContinuation?: boolean
}

export function TimelineCard({
  year, company, role, context,
  milestones, note, isLast, logoText, isContinuation
}: TimelineCardProps) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Timeline dot and line */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', paddingLeft: '4px' }}>
        <div style={{
          width: '12px', height: '12px', borderRadius: '50%',
          background: isContinuation ? 'rgba(45,106,79,0.4)' : 'var(--color-accent)',
          border: '2px solid var(--color-bg)',
          outline: `1px solid ${isContinuation ? 'rgba(45,106,79,0.4)' : 'var(--color-accent)'}`,
          flexShrink: 0, zIndex: 1, position: 'relative',
        }} />
        {!isLast && (
          <div style={{
            flex: 1, height: '1px',
            background: 'rgba(26,25,23,0.12)',
            marginLeft: '8px',
          }} />
        )}
      </div>

      <Card
        mode="emphasize"
        expandedContent={
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-muted)' }}>{note}</p>
        }
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              letterSpacing: '0.12em', color: 'var(--color-accent)', marginBottom: '6px',
            }}>{year}</p>
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: '24px',
              fontWeight: 400, color: 'var(--color-text-primary)',
              lineHeight: 1.2, marginBottom: '4px',
            }}>{company}</h4>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}>{role}</p>
          </div>

          {/* Logo badge */}
          {logoText && (
            <div style={{
              width: isContinuation ? '28px' : '40px',
              height: isContinuation ? '28px' : '40px',
              background: 'rgba(45,106,79,0.08)',
              border: '1px solid rgba(45,106,79,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: isContinuation ? '10px' : '14px',
                fontWeight: 400, color: 'var(--color-accent)',
              }}>{logoText}</span>
            </div>
          )}
        </div>

        <p style={{
          fontSize: '14px', color: 'var(--color-text-dim)',
          fontStyle: 'italic', marginBottom: '20px',
        }}>{context}</p>

        {/* Milestones */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '10px',
          borderTop: '1px solid rgba(26,25,23,0.06)', paddingTop: '16px',
        }}>
          {milestones.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '0.06em', color: 'var(--color-text-dim)',
                textTransform: 'uppercase',
              }}>{label}</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '18px',
                fontWeight: 400, color: 'var(--color-text-primary)',
              }}>{value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
