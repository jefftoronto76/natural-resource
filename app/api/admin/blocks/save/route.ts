import { getAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  let body: {
    type: string
    topic_id: string
    title: string
    body: string
    source_id: string
    owner_id: string
    is_default?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { type, topic_id, title, body: blockBody, source_id, owner_id, is_default } = body

  if (!type || !topic_id || !title || !blockBody || !source_id || !owner_id) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = getAdminClient()

  // Insert the block
  const { data: block, error: blockError } = await supabase
    .from('blocks')
    .insert({
      type,
      topic_id,
      title,
      body: blockBody,
      source_id,
      owner_id,
      tenant_id: 'e07334a0-2afd-4544-898b-edb124d2dd33',
      active: true,
      is_default: is_default ?? false,
    })
    .select()
    .single()

  if (blockError) {
    console.error('[blocks/save] insert failed:', blockError.message)
    return Response.json({ error: blockError.message }, { status: 500 })
  }

  // Link content record back to the block
  const { error: contentError } = await supabase
    .from('content')
    .update({ block_id: block.id })
    .eq('id', source_id)

  if (contentError) {
    console.error('[blocks/save] content update failed:', contentError.message)
    // Block was saved — log but don't fail the request
  }

  return Response.json(block)
}
