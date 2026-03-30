import { getAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { prompt, checkResult } = await req.json()

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt cannot be empty' }, { status: 400 })
  }

  const supabase = getAdminClient()
  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from('master_prompt')
    .select('id, version, content, safety_check_result')
    .limit(1)
    .maybeSingle()

  if (existing) {
    // Archive current version to history before overwriting
    await supabase
      .from('master_prompt_history')
      .insert({
        content: existing.content,
        version: existing.version,
        saved_at: now,
        safety_check_result: existing.safety_check_result ?? null,
      })

    const newVersion = existing.version + 1
    const { error } = await supabase
      .from('master_prompt')
      .update({
        content: prompt,
        version: newVersion,
        updated_at: now,
        last_safety_check: now,
        safety_check_result: checkResult ?? null,
      })
      .eq('id', existing.id)

    if (error) {
      console.error('[prompt/save] update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ version: newVersion })
  } else {
    const { error } = await supabase
      .from('master_prompt')
      .insert({
        content: prompt,
        version: 1,
        updated_at: now,
        last_safety_check: now,
        safety_check_result: checkResult ?? null,
      })

    if (error) {
      console.error('[prompt/save] insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ version: 1 })
  }
}
