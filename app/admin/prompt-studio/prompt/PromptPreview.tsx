'use client'

import { Stack, Textarea, Group, Alert } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'
import { PromptFullnessMeter } from '@/components/admin/primitives/PromptFullnessMeter'

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
  return (
    <Stack gap="md">
      <Alert color="gray" variant="light" radius="sm">
        <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
          This is your active prompt. To make changes, edit blocks in the Composer.
        </Text>
      </Alert>

      <PromptFullnessMeter bodies={initialBodies} />

      <Group gap="md" wrap="wrap">
        <Text
          variant="muted"
          style={{
            fontFamily: 'var(--mantine-font-family-monospace)',
            fontSize: 'var(--mantine-font-size-xs)',
          }}
        >
          Version: {initialVersion ?? '—'}
        </Text>
        <Text
          variant="muted"
          style={{
            fontFamily: 'var(--mantine-font-family-monospace)',
            fontSize: 'var(--mantine-font-size-xs)',
          }}
        >
          Last updated: {formatTimestamp(initialUpdatedAt)}
        </Text>
      </Group>

      <Textarea
        value={initialContent}
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
    </Stack>
  )
}
