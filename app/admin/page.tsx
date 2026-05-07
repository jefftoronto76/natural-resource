import { getAdminClient } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/get-auth-context'
import { InboundChatsTable, type ChatSession } from './InboundChatsTable'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  let rows: ChatSession[] = []

  try {
    const { tenant_id } = await getAuthContext()
    const supabase = getAdminClient()

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('session_type', 'prospect')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[admin/page] fetch error:', error)
    } else {
      rows = (sessions as ChatSession[] | null) ?? []
    }
  } catch (err) {
    console.error('[admin/page] auth failed:', err instanceof Error ? err.message : err)
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
