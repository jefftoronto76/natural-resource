import { getAdminClient } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/get-auth-context'

export async function GET() {
  let authCtx: { owner_id: string; tenant_id: string }
  try {
    authCtx = await getAuthContext()
  } catch (err) {
    console.error('[blocks] auth failed:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('blocks')
    .select('id, title, type, body')
    .eq('tenant_id', authCtx.tenant_id)
    .eq('active', true)
    .order('type')
    .order('title')

  if (error) {
    console.error('[blocks] fetch failed:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
