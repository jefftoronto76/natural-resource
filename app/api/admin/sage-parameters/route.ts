import { getAdminClient } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/get-auth-context'

interface SageParameter {
  id: string
  tenant_id: string
  key: string
  value: string
  label: string | null
  updated_at: string
}

export async function GET() {
  let authCtx: { owner_id: string; tenant_id: string }
  try {
    authCtx = await getAuthContext()
  } catch (err) {
    console.error('[sage-parameters] auth failed:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('sage_parameters')
    .select('id, tenant_id, key, value, label, updated_at')
    .eq('tenant_id', authCtx.tenant_id)
    .order('key')

  if (error) {
    console.error('[sage-parameters] fetch failed:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const parameters: SageParameter[] = data ?? []
  console.log('[sage-parameters] GET', {
    tenant_id: authCtx.tenant_id,
    count: parameters.length,
  })

  return Response.json(parameters)
}

export async function PATCH(req: Request) {
  let authCtx: { owner_id: string; tenant_id: string }
  try {
    authCtx = await getAuthContext()
  } catch (err) {
    console.error('[sage-parameters] auth failed:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { key?: unknown; value?: unknown; label?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body.key !== 'string' || body.key.length === 0) {
    return Response.json({ error: 'Missing or invalid key' }, { status: 400 })
  }
  if (typeof body.value !== 'string') {
    return Response.json({ error: 'Missing or invalid value' }, { status: 400 })
  }
  if (typeof body.label !== 'string') {
    return Response.json({ error: 'Missing or invalid label' }, { status: 400 })
  }

  const key: string = body.key
  const value: string = body.value
  const label: string = body.label

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('sage_parameters')
    .upsert(
      {
        tenant_id: authCtx.tenant_id,
        key,
        value,
        label,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id, key' },
    )
    .select('id, tenant_id, key, value, label, updated_at')
    .single()

  if (error) {
    console.error('[sage-parameters] upsert failed:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const parameter: SageParameter = data
  console.log('[sage-parameters] PATCH', {
    key,
    result: parameter,
  })

  return Response.json(parameter)
}
