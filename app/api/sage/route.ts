import { streamText, tool } from 'ai'
import { z } from 'zod'
import { anthropic } from '@ai-sdk/anthropic'
import { getAdminClient } from '@/lib/supabase-admin'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/sage-prompt'
import { getTenantFromRequest } from '@/lib/get-tenant-from-request'

// Appended to the master system prompt when the visitor arrives in
// question mode (?mode=question). The master prompt is never modified —
// this is additive context only.
// TODO: migrate to conditional block in Composer when activation_condition feature ships
const QUESTION_MODE_CONTEXT =
  'CONTEXT: This visitor arrived with a specific question in mind. Skip the name-ask and discovery phase. Answer their question directly and concisely. Do not ask for their name unless the conversation develops into a longer exchange. If the answer reveals a deeper need or a topic better handled in a paid session — coaching or a working session — pivot naturally to suggesting one, but only after actually answering their question first. All other guardrails and Do Not Engage rules still apply.'

interface SageParameterRow {
  key: string
  label: string | null
  description: string | null
  cta_label: string | null
  url: string | null
}

// Appended verbatim to the compiled system prompt so the model knows when to
// invoke the record_visitor_name tool. The tool itself is registered on the
// streamText call inside POST and writes to chat_sessions via PATCH.
const NAME_CAPTURE_INSTRUCTION =
  "When you learn the visitor's first name, call the record_visitor_name tool with their first name. Do this once only."

async function getBookingCardSection(tenantId: string): Promise<string> {
  try {
    const { data, error } = await getAdminClient()
      .from('sage_parameters')
      .select('key, label, description, cta_label, url')
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('[sage/route] sage_parameters query failed:', error.message)
      console.log('[sage/route] booking card section appended:', false, 'tenant_id:', tenantId)
      return ''
    }

    const rows: SageParameterRow[] = data ?? []
    console.log('[sage/route] sage_parameters fetched:', {
      tenant_id: tenantId,
      count: rows.length,
    })

    if (rows.length === 0) {
      console.log('[sage/route] booking card section appended:', false, 'tenant_id:', tenantId)
      return ''
    }

    const lines = rows.map(
      row =>
        `[BOOKING: ${row.label ?? ''} | ${row.description ?? ''} | ${row.cta_label ?? ''} | ${row.url ?? ''}]`,
    )

    const section = [
      'Booking cards — when offering a session or call, output a booking card on its own line at the end of your message using this exact syntax. Never output it inline within a sentence. Never output it mid-message.',
      '',
      'Available booking options:',
      ...lines,
    ].join('\n')

    console.log('[sage/route] booking card section appended:', true, 'tenant_id:', tenantId)
    return section
  } catch (err) {
    console.error(
      '[sage/route] sage_parameters query threw:',
      err instanceof Error ? err.message : err,
    )
    console.log('[sage/route] booking card section appended:', false, 'tenant_id:', tenantId)
    return ''
  }
}

async function getSystemPrompt(tenantId: string | null): Promise<string> {
  if (!tenantId) {
    console.log('[sage/route] no tenant_id — using DEFAULT_SYSTEM_PROMPT')
    return DEFAULT_SYSTEM_PROMPT
  }
  try {
    const { data, error } = await getAdminClient()
      .from('master_prompt')
      .select('content')
      .eq('tenant_id', tenantId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[sage/route] master_prompt query failed:', error.message)
      return DEFAULT_SYSTEM_PROMPT
    }

    if (!data?.content) {
      console.log('[sage/route] no master_prompt row for tenant_id:', tenantId, '— falling back to DEFAULT_SYSTEM_PROMPT')
      return DEFAULT_SYSTEM_PROMPT
    }

    console.log('[sage/route] using master_prompt for tenant_id:', tenantId)
    return data.content
  } catch (err) {
    console.error('[sage/route] master_prompt query threw:', err instanceof Error ? err.message : err)
    return DEFAULT_SYSTEM_PROMPT
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response('ANTHROPIC_API_KEY is not configured', { status: 500 })
  }

  const tenantId = await getTenantFromRequest(req)
  console.log('[sage/route] resolved tenant_id:', tenantId)

  let body: {
    messages: { role: string; content: string }[]
    mode?: string | null
    session_id?: string | null
  }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const { messages } = body
  const questionMode = body.mode === 'question'
  const sessionId =
    typeof body.session_id === 'string' && body.session_id.length > 0
      ? body.session_id
      : null
  console.log('[sage/route] mode:', questionMode ? 'question' : 'default', '| session_id:', sessionId)

  let conversationMessages: { role: 'user' | 'assistant'; content: string }[]

  if (messages.length === 0) {
    // Greeting flow — empty array triggers Sage's opening message
    conversationMessages = [{ role: 'user', content: 'Hi' }]
  } else {
    conversationMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Anthropic requires conversations to start with a user message.
    // The greeting response is stored as an assistant message in the client
    // store, so we prepend the implicit trigger that generated it.
    if (conversationMessages[0].role === 'assistant') {
      conversationMessages = [
        { role: 'user', content: 'Hi' },
        ...conversationMessages,
      ]
    }
  }

  const [basePrompt, bookingSection] = await Promise.all([
    getSystemPrompt(tenantId),
    tenantId ? getBookingCardSection(tenantId) : Promise.resolve(''),
  ])
  const systemPrompt = [
    basePrompt,
    bookingSection,
    questionMode ? QUESTION_MODE_CONTEXT : '',
    NAME_CAPTURE_INSTRUCTION,
  ]
    .filter(segment => segment.length > 0)
    .join('\n\n')

  const recordVisitorNameTool = tool({
    description: "Call this tool when you learn the visitor's first name. Pass only the first name.",
    parameters: z.object({
      first_name: z.string(),
    }),
    execute: async ({ first_name }) => {
      console.log('[sage/route] record_visitor_name called:', { first_name, session_id: sessionId })
      if (!sessionId) {
        console.warn('[sage/route] record_visitor_name: no session_id, skipping')
        return { ok: false, reason: 'no_session_id' as const }
      }
      try {
        const patchUrl = new URL(`/api/sessions/${sessionId}`, req.url).toString()
        const res = await fetch(patchUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorName: first_name }),
        })
        if (!res.ok) {
          console.error('[sage/route] record_visitor_name PATCH failed:', res.status)
          return { ok: false, reason: 'patch_failed' as const }
        }
        console.log('[sage/route] record_visitor_name PATCH succeeded for session:', sessionId)
        return { ok: true as const }
      } catch (err) {
        console.error(
          '[sage/route] record_visitor_name threw:',
          err instanceof Error ? err.message : err,
        )
        return { ok: false, reason: 'exception' as const }
      }
    },
  })

  try {
    const result = await streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt,
      messages: conversationMessages,
      maxTokens: 1000,
      tools: {
        record_visitor_name: recordVisitorNameTool,
      },
    })
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('[sage/route] streamText error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(`Upstream error: ${message}`, { status: 502 })
  }
}
