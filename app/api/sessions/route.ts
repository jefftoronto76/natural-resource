import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  console.log('[sessions/route] env check — url present:', !!url, '| service key present:', !!key)
  return createClient(url!, key!)
}

export async function POST() {
  console.log('[sessions/route] POST called')
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ messages: [], status: 'active' })
    .select('id')
    .single()

  if (error) {
    console.error('[sessions/route] insert error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[sessions/route] created session:', data.id)
  return NextResponse.json({ id: data.id })
}
