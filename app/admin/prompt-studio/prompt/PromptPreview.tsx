'use client'

import { useState } from 'react'
import { Button, Stack, Textarea, Group } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Text } from '@/components/admin/primitives/Text'
import { PromptFullnessMeter } from '@/components/admin/primitives/PromptFullnessMeter'

interface CompileResponse {
  success: boolean
  version: number
  tokenCount: number
  content: string
  updatedAt: string
}

export interface PromptPreviewProps {
  initialContent: string
  initialVersion: number | null
  initialUpdatedAt: string | null
  initialBodies: string[]
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function PromptPreview({
  initialContent,
  initialVersion,
  initialUpdatedAt,
  initialBodies,
}: PromptPreviewProps) {
  const [content, setContent] = useState(initialContent)
  const [version, setVersion] = useState<number | null>(initialVersion)
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt)
  const [bodies, setBodies] = useState<string[]>(initialBodies)
  const [publishing, setPublishing] = useState(false)

  async function handlePublish() {
    setPublishing(true)
    try {
      const res = await fetch('/api/admin/prompt/compile', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error ?? 'Compile failed'
        notifications.show({
          color: 'red',
          title: 'Publish failed',
          message,
        })
        return
      }
      const data: CompileResponse = await res.json()
      setContent(data.content)
      setVersion(data.version)
      setUpdatedAt(data.updatedAt)
      // Refresh the meter's data from the new compiled content — treat the
      // full content as a single body for token math. This matches the
      // server-side token count exactly.
      setBodies([data.content])
      notifications.show({
        color: 'green',
        title: 'Prompt published',
        message: `Version ${data.version}`,
      })
    } catch (err) {
      console.error('[PromptPreview] publish failed:', err)
      notifications.show({
        color: 'red',
        title: 'Publish failed',
        message: 'Network error — could not reach the server.',
      })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Stack gap="md">
      <PromptFullnessMeter bodies={bodies} />

      <Group gap="md" wrap="wrap">
        <Text
          variant="muted"
          style={{
            fontFamily: 'var(--mantine-font-family-monospace)',
            fontSize: 'var(--mantine-font-size-xs)',
          }}
        >
          Version: {version ?? '—'}
        </Text>
        <Text
          variant="muted"
          style={{
            fontFamily: 'var(--mantine-font-family-monospace)',
            fontSize: 'var(--mantine-font-size-xs)',
          }}
        >
          Last updated: {formatTimestamp(updatedAt)}
        </Text>
      </Group>

      <Textarea
        value={content}
        readOnly
        autosize
        minRows={8}
        maxRows={40}
        placeholder="No prompt published yet."
        styles={{
          input: {
            fontFamily: 'var(--mantine-font-family-monospace)',
            fontSize: 'var(--mantine-font-size-sm)',
            lineHeight: 1.6,
          },
        }}
      />

      <Group>
        <Button
          variant="filled"
          color="green"
          onClick={handlePublish}
          loading={publishing}
        >
          Compile & Publish
        </Button>
      </Group>
    </Stack>
  )
}
