import { getAdminClient } from '@/lib/supabase-admin'
import { InboundChatsTable, type ChatSession } from './InboundChatsTable'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = getAdminClient()

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[admin/page] fetch error:', error)
  }

  const rows = (sessions as ChatSession[] | null) ?? []

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
        Inbound Chats
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '15px',
        color: 'var(--color-text-muted)',
        marginBottom: '48px',
      }}>
        Sage conversation history.
      </p>

      <InboundChatsTable rows={rows} />
    </div>
  )
}
