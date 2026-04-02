import { getAdminClient } from '@/lib/supabase-admin'

const TENANT_ID = 'e07334a0-2afd-4544-898b-edb124d2dd33'

export async function GET() {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('topics')
    .select('id, name, type')
    .eq('tenant_id', TENANT_ID)
    .order('name')

  if (error) {
    console.error('[topics] fetch failed:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(req: Request) {
  let body: { name: string; type: string }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, type } = body

  if (!name || !type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('topics')
    .insert({ name, type, tenant_id: TENANT_ID })
    .select('id, name, type')
    .single()

  if (error) {
    console.error('[topics] insert failed:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
