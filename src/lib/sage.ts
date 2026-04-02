import { SageMessage } from './store'
import { readDataStream } from './stream'

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

  await readDataStream(response, onChunk)
}
