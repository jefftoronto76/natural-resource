import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

const META_PROMPT = `You are reviewing a system prompt for an AI assistant called Sage on a professional business coaching website (jefflougheed.ca).

Evaluate whether the prompt is:
1. Safe — no instructions to harm, deceive, or manipulate users against their interests
2. On-brand — appropriate for a professional business/coaching context
3. Non-deceptive — doesn't instruct the AI to misrepresent itself or make false claims
4. Functional — maintains a coherent purpose as a business assistant

Respond with valid JSON only. No explanation, no markdown. Use exactly this format:
{"pass": true, "issues": []}
or
{"pass": false, "issues": ["Specific issue 1", "Specific issue 2"]}`

export async function POST(req: Request) {
  const { prompt } = await req.json()

  if (!prompt?.trim()) {
    return NextResponse.json({ pass: false, issues: ['Prompt cannot be empty'] })
  }

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      system: META_PROMPT,
      prompt: `System prompt to review:\n---\n${prompt}\n---`,
      maxTokens: 300,
    })

    const result = JSON.parse(text.trim())
    return NextResponse.json(result)
  } catch (error) {
    console.error('[prompt/check] error:', error)
    return NextResponse.json({ error: 'Safety check failed' }, { status: 500 })
  }
}
