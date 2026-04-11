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
    documentContext?: string
    existingBlocks?: { title: string; type: string; body: string }[]
  }

  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const { type, topic, content_type, content, messages, documentContext, existingBlocks } = body

  const documentSection = documentContext
    ? `\n\nThe owner has uploaded a document. Here is its content:\n\n${documentContext}\n\nUse this to suggest relevant blocks.`
    : ''

  const blocksSection = existingBlocks && existingBlocks.length > 0
    ? `\n\nHere are the owner's existing blocks:\n\n${existingBlocks.map(b => `- [${b.type}] ${b.title}: ${b.body}`).join('\n')}\n\nDo not duplicate existing blocks. Suggest blocks that fill gaps or complement what exists.`
    : ''

  const systemPrompt = `You are a prompt block builder for Sage, an AI sales assistant. Your job is to help the owner create well-structured prompt blocks through conversation.

A block is one focused instruction or piece of context that will be compiled into Sage's master system prompt. There are five block types:

- Identity — who Sage is, tone, personality, voice
- Knowledge — factual context about the business, owner, or services
- Guardrail — a rule or constraint on what Sage should or should not do
- Process — step-by-step instructions for how Sage should handle a specific situation
- Escalation — when and how Sage should route a visitor to a human or off-ramp

Your process:
1. ALWAYS draft first. When the owner provides any content — typed, pasted, or uploaded — immediately draft one or more blocks from it. Never ask a clarifying question before attempting a draft.
2. If the content is rich enough to warrant multiple blocks, draft all of them in sequence. Present each draft clearly with its suggested type and topic.
3. Present drafts and ask if they capture what the owner meant.
4. Refine based on feedback, then commit to a final version.
5. For each block you draft, output the block prose followed immediately by its JSON object on the next line. One JSON object per block, output immediately when drafted — do not wait for confirmation.
{"done":true,"title":"[block title]","content":"[full block text]","type":"[suggested type]","topic":"[suggested topic]"}

Rules:
- Draft first, ask later. Only ask a clarifying question if it is genuinely impossible to draft anything from the input — this is the last resort, not the default.
- Even with minimal input, attempt a draft. A rough draft the owner can react to is always better than a question.
- Write blocks in second person directed at Sage ("When a visitor asks X, you should Y...")
- One idea per block, maximum 150 words
- Always suggest the block type and topic — the owner can override in the metadata sidebar
- You have a maximum of 10 exchanges per session`

  const conversationMessages = messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  try {
    const result = await streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt + documentSection + blocksSection,
      messages: conversationMessages,
      maxTokens: 4000,
    })
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('[blocks/chat/route] streamText error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(`Upstream error: ${message}`, { status: 502 })
  }
}
