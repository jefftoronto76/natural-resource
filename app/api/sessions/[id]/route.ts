import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  console.log('[sessions/[id]/route] env check — url present:', !!url, '| service key present:', !!key)
  return createClient(url!, key!)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('[sessions/[id]/route] PATCH called for id:', id)
  const { messages, visitorName } = await req.json()
  console.log('[sessions/[id]/route] message count:', messages?.length, '| visitorName:', visitorName)

  const supabase = getAdminClient()

  // Only write visitor_name when the client sends a non-empty string. The
  // server-side name extractor in /api/sage may have already populated it
  // from Sage's response, and client PATCHes still send `visitorName: null`
  // until front-end name capture lands — so unconditionally writing would
  // clobber the server's value.
  const trimmedName = typeof visitorName === 'string' ? visitorName.trim() : ''
  const baseUpdate = {
    messages,
    updated_at: new Date().toISOString(),
    status: 'in_progress' as const,
  }
  const update = trimmedName.length > 0
    ? { ...baseUpdate, visitor_name: trimmedName }
    : baseUpdate

  const { error } = await supabase
    .from('chat_sessions')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('[sessions/[id]/route] update error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[sessions/[id]/route] updated session:', id)
  return NextResponse.json({ ok: true })
}
