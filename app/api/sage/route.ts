import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { getAdminClient } from '@/lib/supabase-admin'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/sage-prompt'

async function getSystemPrompt(): Promise<string> {
  try {
    const { data } = await getAdminClient()
      .from('master_prompt')
      .select('content')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data?.content || DEFAULT_SYSTEM_PROMPT
  } catch {
    return DEFAULT_SYSTEM_PROMPT
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response('ANTHROPIC_API_KEY is not configured', { status: 500 })
  }

  let body: { messages: { role: string; content: string }[] }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const { messages } = body

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

  const systemPrompt = await getSystemPrompt()

  try {
    const result = await streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt,
      messages: conversationMessages,
      maxTokens: 1000,
    })
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('[sage/route] streamText error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(`Upstream error: ${message}`, { status: 502 })
  }
}
