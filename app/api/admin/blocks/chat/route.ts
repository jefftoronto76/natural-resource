import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response('ANTHROPIC_API_KEY is not configured', { status: 500 })
  }

  let body: {
    type: string
    topic: string
    content_type: string
    content: string
    messages: { role: string; content: string }[]
  }

  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const { type, topic, content_type, content, messages } = body

  const systemPrompt = `You are a prompt block builder for Sage, an AI sales assistant. Your job is to help the owner create a single, well-structured prompt block through conversation — ideally in 3-5 exchanges.

A block is one focused instruction or piece of context that will be compiled into Sage's master system prompt. There are five block types:

- Identity — who Sage is, tone, personality, voice
- Knowledge — factual context about the business, owner, or services
- Guardrail — a rule or constraint on what Sage should or should not do
- Process — step-by-step instructions for how Sage should handle a specific situation
- Escalation — when and how Sage should route a visitor to a human or off-ramp

Your process:
1. Ask the owner what they want Sage to know or do — one open question
2. Draft the block as soon as you have enough to work with — don't over-question
3. Present the draft clearly and ask if it captures what they meant
4. Refine once or twice based on feedback, then commit to a final version
5. When ready, suggest a block type and a short topic name based on the content
6. Output your final response as prose followed immediately by this JSON on the last line:
{"done":true,"title":"[block title]","content":"[full block text]","type":"[suggested type]","topic":"[suggested topic]"}

Rules:
- One question at a time
- Aim to have a confirmed block within 5 exchanges — you have a maximum of 10
- Write blocks in second person directed at Sage ("When a visitor asks X, you should Y...")
- One idea per block, maximum 150 words
- Always suggest the block type and topic — the owner can override in the metadata sidebar
- Do not output the JSON until the owner has confirmed the block is ready`

  const conversationMessages = messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  try {
    const result = await streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt,
      messages: conversationMessages,
      maxTokens: 800,
    })
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('[blocks/chat/route] streamText error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(`Upstream error: ${message}`, { status: 502 })
  }
}
