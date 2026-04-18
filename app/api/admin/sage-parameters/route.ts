import { getAdminClient } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/get-auth-context'

interface SageParameter {
  id: string
  tenant_id: string
  key: string
  value: string
  label: string | null
  description: string | null
  cta_label: string | null
  url: string | null
  updated_at: string
}

const DESCRIPTION_MAX = 60
const CTA_LABEL_MAX = 20

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
    .select('id, tenant_id, key, value, label, description, cta_label, url, updated_at')
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

  let body: {
    key?: unknown
    value?: unknown
    label?: unknown
    description?: unknown
    cta_label?: unknown
    url?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body.key !== 'string' || body.key.length === 0) {
    return Response.json({ error: 'Missing or invalid key' }, { status: 400 })
  }
  if (typeof body.label !== 'string') {
    return Response.json({ error: 'Missing or invalid label' }, { status: 400 })
  }
  if (body.value !== undefined && typeof body.value !== 'string') {
    return Response.json({ error: 'Invalid value' }, { status: 400 })
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    return Response.json({ error: 'Invalid description' }, { status: 400 })
  }
  if (body.cta_label !== undefined && typeof body.cta_label !== 'string') {
    return Response.json({ error: 'Invalid cta_label' }, { status: 400 })
  }
  if (body.url !== undefined && typeof body.url !== 'string') {
    return Response.json({ error: 'Invalid url' }, { status: 400 })
  }

  const key: string = body.key
  const label: string = body.label
  const value: string = typeof body.value === 'string' ? body.value : ''
  const description: string = typeof body.description === 'string' ? body.description : ''
  const ctaLabel: string = typeof body.cta_label === 'string' ? body.cta_label : ''
  const url: string = typeof body.url === 'string' ? body.url : ''

  if (description.length > DESCRIPTION_MAX) {
    return Response.json(
      { error: `Description must be ${DESCRIPTION_MAX} characters or fewer` },
      { status: 400 },
    )
  }
  if (ctaLabel.length > CTA_LABEL_MAX) {
    return Response.json(
      { error: `CTA label must be ${CTA_LABEL_MAX} characters or fewer` },
      { status: 400 },
    )
  }

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('sage_parameters')
    .upsert(
      {
        tenant_id: authCtx.tenant_id,
        key,
        value,
        label,
        description,
        cta_label: ctaLabel,
        url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id, key' },
    )
    .select('id, tenant_id, key, value, label, description, cta_label, url, updated_at')
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
