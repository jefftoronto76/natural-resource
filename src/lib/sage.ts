import { SageMessage } from './store'

export async function streamSageResponse(
  messages: SageMessage[],
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch('/api/sage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let accumulated = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    const lines = text.split('\n')

    for (const line of lines) {
      // Vercel AI SDK data stream format: `0:"delta text"`
      const match = line.match(/^0:"(.*)"$/)
      if (match) {
        // Unescape JSON string content
        try {
          const delta = JSON.parse(`"${match[1]}"`)
          accumulated += delta
          onChunk(accumulated)
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}
