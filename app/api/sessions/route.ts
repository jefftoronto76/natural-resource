import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST() {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ messages: [], status: 'active' })
    .select('id')
    .single()

  if (error) {
    console.error('[sessions/route] insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
