import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/get-auth-context'

const META_PROMPT = `You are reviewing a single block of a system prompt for an AI assistant called Sage on a professional business context.

Evaluate whether the block is:
1. Safe — no instructions to harm, deceive, or manipulate users
2. Consistent — doesn't contradict itself internally
3. On-brand — appropriate for a professional business/coaching tone
4. Functional — makes sense as an instruction to an AI assistant

Your entire response must be a single raw JSON object. Do not use markdown. Do not wrap in backticks. Output only the JSON, starting with { and ending with }.

Use exactly this format:
{"ok": true, "issues": []}
or
{"ok": false, "issues": ["short description of issue 1", "short description of issue 2"]}

Issues must be concise (under 20 words each). Only flag real problems — do not invent concerns.`

interface CheckResult {
  ok: boolean
  issues: string[]
}

export async function POST(req: Request) {
  try {
    await getAuthContext()
  } catch (err) {
    console.error('[prompt/compile/check] auth failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { body?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const blockBody = body.body?.trim()
  if (!blockBody) {
    return NextResponse.json({ error: 'Missing body field' }, { status: 400 })
  }

  console.log('[prompt/compile/check] checking block body, length:', blockBody.length)

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      system: META_PROMPT,
      prompt: `Block to review:\n---\n${blockBody}\n---`,
      maxTokens: 500,
    })

    const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(clean) as CheckResult
    console.log('[prompt/compile/check] result:', { ok: parsed.ok, issueCount: parsed.issues?.length ?? 0 })
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[prompt/compile/check] check failed:', err instanceof Error ? err.message : err)
    // Fail open — don't block the save flow on a check error.
    return NextResponse.json({ ok: true, issues: [] })
  }
}
