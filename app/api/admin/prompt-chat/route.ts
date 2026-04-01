import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response('ANTHROPIC_API_KEY is not configured', { status: 500 })
  }

  let body: { messages: { role: string; content: string }[]; systemContext: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const { messages, systemContext } = body

  const systemPrompt = `You are a helpful AI assistant for the Natural Resource Prompt Builder — an admin tool used to build and manage the system prompt for Sage, an AI assistant on jefflougheed.ca.

Your job: help the admin understand, improve, and add content to their prompt blocks. Answer questions about prompt engineering, suggest improvements, and help draft new block content.

If the user explicitly asks you to create or add a block, end your response with a JSON action on its own line in this exact format (no other text after it):
{"action":"add_block","topicId":"<id>","topicName":"<name>","name":"<short block name>","content":"<block content, max 150 words>"}

Only include the JSON action when the user has explicitly asked to create/add a block. For questions, analysis, and suggestions, just respond in plain text.

Be concise and direct. Professional tone.

Current prompt builder contents:
${systemContext}`

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
    console.error('[prompt-chat/route] streamText error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(`Upstream error: ${message}`, { status: 502 })
  }
}
