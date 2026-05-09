import { streamText, generateText } from 'ai'
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

// Server-side first-name extraction. A single Haiku call against the last
// few turns of the conversation is cheaper to maintain than a regex tree and
// covers the four scenarios (visitor names self up-front, visitor responds
// to a name-ask, visitor ignores, visitor names self mid-conversation).
// Cost is bounded by the chat_sessions.visitor_name pre-check in onFinish:
// once captured, no further Haiku calls fire for that session.
const HAIKU_NAME_EXTRACTOR_SYSTEM =
  "You are extracting one piece of structured data. Given the conversation below, return ONLY the visitor's first name if they have clearly stated it. If the name is unstated or unclear, return the word EMPTY and nothing else. No punctuation, no explanation."

function isPlausibleName(candidate: string): boolean {
  if (candidate.length < 2 || candidate.length > 30) return false
  if (!/^[A-Z][a-zA-Z'-]+$/.test(candidate)) return false
  const upper = candidate.toUpperCase()
  if (
    upper === 'EMPTY' ||
    upper === 'NONE' ||
    upper === 'UNKNOWN' ||
    upper === 'VISITOR' ||
    upper === 'USER'
  ) {
    return false
  }
  return true
}

// Detects whether Sage offered a calendar/booking link in the streamed
// assistant message. Two shapes are covered: the structured booking card
// (always emitted on its own line at the end of a message) and a raw
// calendly.com URL in prose (escape hatch for the discovery-call link
// referenced from DEFAULT_SYSTEM_PROMPT).
function scanForCalendarOffer(text: string): boolean {
  return /\[BOOKING:[^\]]*\]/.test(text) || /calendly\.com/i.test(text)
}

async function extractNameWithHaiku(
  recentMessages: { role: 'user' | 'assistant'; content: string }[],
): Promise<{
  name: string | null
  usage: { promptTokens: number; completionTokens: number } | null
}> {
  try {
    const conversationStr = recentMessages
      .map(m => `${m.role === 'user' ? 'Visitor' : 'Sage'}: ${m.content}`)
      .join('\n\n')

    const result = await generateText({
      model: anthropic('claude-haiku-4-5'),
      system: HAIKU_NAME_EXTRACTOR_SYSTEM,
      messages: [{ role: 'user', content: conversationStr }],
      maxTokens: 20,
    })

    const usage = {
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
    }

    const raw = result.text.trim()
    console.log('[sage/route] haiku extractor returned:', JSON.stringify(raw), '| usage:', usage)

    if (raw === 'EMPTY' || raw.length === 0) return { name: null, usage }

    // Titlecase before the shape check. Haiku tends to preserve the
    // visitor's casing ("ronald" stays "ronald"), but isPlausibleName
    // requires a single capital lead.
    const candidate = raw[0].toUpperCase() + raw.slice(1).toLowerCase()

    if (!isPlausibleName(candidate)) {
      console.log('[sage/route] haiku candidate rejected by shape check:', candidate)
      return { name: null, usage }
    }
    return { name: candidate, usage }
  } catch (err) {
    console.error(
      '[sage/route] haiku extractor failed:',
      err instanceof Error ? err.message : err,
    )
    return { name: null, usage: null }
  }
}

async function persistVisitorName(sessionId: string, name: string): Promise<void> {
  try {
    const supabase = getAdminClient()
    const { data, error: selectError } = await supabase
      .from('chat_sessions')
      .select('visitor_name')
      .eq('id', sessionId)
      .maybeSingle()

    if (selectError) {
      console.error('[sage/route] visitor_name select failed:', selectError.message)
      return
    }

    if (!data) {
      console.warn('[sage/route] visitor_name persist skipped — session not found:', sessionId)
      return
    }

    if (data.visitor_name && data.visitor_name.length > 0) {
      console.log('[sage/route] visitor_name already set, skipping write:', {
        session_id: sessionId,
        existing: data.visitor_name,
        extracted: name,
      })
      return
    }

    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ visitor_name: name })
      .eq('id', sessionId)

    if (updateError) {
      console.error('[sage/route] visitor_name update failed:', updateError.message)
      return
    }

    console.log('[sage/route] visitor_name written:', { session_id: sessionId, name })
  } catch (err) {
    console.error('[sage/route] persistVisitorName threw:', err instanceof Error ? err.message : err)
  }
}

async function persistCalendarOffered(sessionId: string): Promise<void> {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from('chat_sessions')
      .update({ calendar_offered: true })
      .eq('id', sessionId)

    if (error) {
      console.error('[sage/route] calendar_offered update failed:', error.message)
      return
    }

    console.log('[sage/route] calendar_offered written:', { session_id: sessionId })
  } catch (err) {
    console.error(
      '[sage/route] persistCalendarOffered threw:',
      err instanceof Error ? err.message : err,
    )
  }
}

// Increments the cumulative input_tokens / output_tokens counters on the
// session row by the given deltas. Read-modify-write — fine for a single
// visitor's serialized turns; not safe under concurrent writes for the
// same session, but no caller produces that pattern.
async function persistTokenUsage(
  sessionId: string,
  inputDelta: number,
  outputDelta: number,
): Promise<void> {
  if (inputDelta <= 0 && outputDelta <= 0) return
  try {
    const supabase = getAdminClient()
    const { data, error: selectError } = await supabase
      .from('chat_sessions')
      .select('input_tokens, output_tokens')
      .eq('id', sessionId)
      .maybeSingle()

    if (selectError) {
      console.error('[sage/route] token usage select failed:', selectError.message)
      return
    }

    if (!data) {
      console.warn('[sage/route] token usage skipped — session not found:', sessionId)
      return
    }

    const currentInput = typeof data.input_tokens === 'number' ? data.input_tokens : 0
    const currentOutput = typeof data.output_tokens === 'number' ? data.output_tokens : 0
    const nextInput = currentInput + Math.max(0, Math.floor(inputDelta))
    const nextOutput = currentOutput + Math.max(0, Math.floor(outputDelta))

    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ input_tokens: nextInput, output_tokens: nextOutput })
      .eq('id', sessionId)

    if (updateError) {
      console.error('[sage/route] token usage update failed:', updateError.message)
      return
    }

    console.log('[sage/route] token usage written:', {
      session_id: sessionId,
      input_delta: inputDelta,
      output_delta: outputDelta,
      input_total: nextInput,
      output_total: nextOutput,
    })
  } catch (err) {
    console.error(
      '[sage/route] persistTokenUsage threw:',
      err instanceof Error ? err.message : err,
    )
  }
}

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
  const systemPrompt = [basePrompt, bookingSection, questionMode ? QUESTION_MODE_CONTEXT : '']
    .filter(segment => segment.length > 0)
    .join('\n\n')

  try {
    const result = await streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt,
      messages: conversationMessages,
      maxTokens: 1000,
      onFinish: async ({ text, usage }) => {
        if (!sessionId) {
          console.log('[sage/route] onFinish: no session_id, skipping detection flows')
          return
        }

        // Token usage — main streamText turn. Persisted before any other
        // flow so its short-circuits cannot bypass the metric.
        if (usage) {
          await persistTokenUsage(sessionId, usage.promptTokens, usage.completionTokens)
        }

        // Calendar offer detection. Pre-check bounds cost: once true for a
        // session, no further scans fire. Self-contained try/catch so a
        // failure here does not abort the visitor_name flow below.
        try {
          const { data, error } = await getAdminClient()
            .from('chat_sessions')
            .select('calendar_offered')
            .eq('id', sessionId)
            .maybeSingle()

          if (error) {
            console.error(
              '[sage/route] onFinish: calendar_offered pre-check failed:',
              error.message,
            )
          } else if (!data) {
            console.warn(
              '[sage/route] onFinish: session not found for calendar pre-check:',
              sessionId,
            )
          } else if (data.calendar_offered === true) {
            console.log(
              '[sage/route] onFinish: calendar_offered already set, skipping scan',
            )
          } else if (scanForCalendarOffer(text)) {
            console.log('[sage/route] onFinish: calendar offer detected in assistant text')
            await persistCalendarOffered(sessionId)
          }
        } catch (err) {
          console.error(
            '[sage/route] onFinish: calendar_offered detection threw:',
            err instanceof Error ? err.message : err,
          )
        }

        // Pre-check: skip the Haiku call entirely if visitor_name is already
        // populated. This is what bounds extraction cost to ~one call per
        // session in the steady state.
        try {
          const { data, error } = await getAdminClient()
            .from('chat_sessions')
            .select('visitor_name')
            .eq('id', sessionId)
            .maybeSingle()

          if (error) {
            console.error(
              '[sage/route] onFinish: visitor_name pre-check failed:',
              error.message,
            )
            return
          }
          if (!data) {
            console.warn('[sage/route] onFinish: session not found:', sessionId)
            return
          }
          if (typeof data.visitor_name === 'string' && data.visitor_name.length > 0) {
            console.log('[sage/route] onFinish: visitor_name already set, skipping extraction')
            return
          }
        } catch (err) {
          console.error(
            '[sage/route] onFinish: pre-check threw:',
            err instanceof Error ? err.message : err,
          )
          return
        }

        // Last 4 turns: up to 3 trailing entries from the conversation we
        // sent in, plus the assistant message that just finished streaming.
        const recent = [
          ...conversationMessages.slice(-3),
          { role: 'assistant' as const, content: text },
        ].slice(-4)

        const { name, usage: haikuUsage } = await extractNameWithHaiku(recent)
        if (haikuUsage) {
          await persistTokenUsage(
            sessionId,
            haikuUsage.promptTokens,
            haikuUsage.completionTokens,
          )
        }
        if (!name) {
          console.log('[sage/route] onFinish: haiku extracted no name')
          return
        }
        console.log('[sage/route] onFinish: haiku extracted candidate:', name)
        await persistVisitorName(sessionId, name)
      },
    })
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('[sage/route] streamText error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(`Upstream error: ${message}`, { status: 502 })
  }
}
