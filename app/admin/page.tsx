import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const STATUS_COLORS: Record<string, string> = {
  active: '#2d6a4f',
  completed: 'var(--color-text-muted)',
  flagged: '#b45309',
}

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('id, created_at, updated_at, visitor_name, message_count, status')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[admin/page] fetch error:', error)
  }

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 3vw, 40px)',
        fontWeight: 400,
        letterSpacing: '-0.02em',
        color: 'var(--color-text-primary)',
        marginBottom: '8px',
      }}>
        Chat Sessions
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '15px',
        color: 'var(--color-text-muted)',
        marginBottom: '48px',
      }}>
        Sage conversation history.
      </p>

      {!sessions?.length ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-dim)' }}>
          No sessions yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 100px 180px',
            gap: '16px',
            padding: '0 16px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-text-dim)',
          }}>
            <span>Visitor</span>
            <span>Messages</span>
            <span>Status</span>
            <span>Last Active</span>
          </div>

          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/admin/sessions/${session.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px 180px',
                gap: '16px',
                padding: '16px',
                background: 'white',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: session.visitor_name ? 'var(--color-text-primary)' : 'var(--color-text-dim)',
                fontWeight: session.visitor_name ? 500 : 400,
                fontStyle: session.visitor_name ? 'normal' : 'italic',
              }}>
                {session.visitor_name ?? 'Anonymous'}
              </span>

              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
              }}>
                {session.message_count ?? 0}
              </span>

              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: STATUS_COLORS[session.status] ?? 'var(--color-text-muted)',
              }}>
                {session.status ?? 'active'}
              </span>

              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-text-dim)',
              }}>
                {formatDate(session.updated_at ?? session.created_at)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
