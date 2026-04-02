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

  const systemPrompt = `You are helping refine a prompt block of type "${type}" for topic "${topic}".

The user provided this raw content (content_type: ${content_type}):
---
${content}
---

Review the content. Ask 1-2 short clarifying questions if anything is unclear or could be stronger. Then produce a polished block under 150 words.

When the block is ready, respond with valid JSON on its own line (no other text after it):
{"done":true,"title":"short block title","content":"polished block content, max 150 words"}

Be concise and direct. Professional tone.`

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
