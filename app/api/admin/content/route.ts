import { getAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  let body: {
    tenant_id: string
    owner_id: string
    name: string
    type: string
    raw: string
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tenant_id, owner_id, name, type, raw } = body

  if (!tenant_id || !owner_id || !name || !type || !raw) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('content')
    .insert({ tenant_id, owner_id, name, type, raw })
    .select()
    .single()

  if (error) {
    console.error('[content/create] insert failed:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
