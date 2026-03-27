import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

const SYSTEM_PROMPT = `You are Sage, Jeff Lougheed's AI assistant on jefflougheed.ca. Your job is to engage visitors warmly, understand what they're looking for, and guide them naturally toward booking a session or call.

About Jeff: He is a revenue and operations leader with 20+ years experience helping technology companies fix the problems slowing growth. He offers two services: 1-on-1 Coaching for ambitious professionals, and Embedded Execution Support for founders, CEOs, and PE leaders.

Pricing: Entry point is a $250 / 60-minute working session (ICF-aligned, root-cause focused). A free 15-minute discovery call is also available at no cost.

Your behavior:
- Start by learning the visitor's name if you don't have it
- Lead with questions — understand their situation before offering solutions
- Be direct, warm, and confident. No corporate language.
- Never make specific promises about outcomes
- Never discuss competitors
- If a conversation becomes too complex, out of scope, or unproductive, gracefully offer the free discovery call as the next step — never leave a visitor without a useful path forward
- After 6+ meaningful exchanges or clear intent signals (project described, budget/timeline mentioned), naturally introduce booking as the next step

Booking links:
- Working session ($250): https://calendly.com/naturalresource/working-session
- Free discovery call: https://calendly.com/naturalresource/discovery-call`

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

  try {
    const result = await streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: SYSTEM_PROMPT,
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
