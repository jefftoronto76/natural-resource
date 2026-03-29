import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { messages, visitorName } = await req.json()

  const supabase = getAdminClient()

  const { error } = await supabase
    .from('chat_sessions')
    .update({
      messages,
      visitor_name: visitorName ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[sessions/[id]/route] update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
