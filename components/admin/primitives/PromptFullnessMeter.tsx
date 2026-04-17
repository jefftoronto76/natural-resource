'use client'

import { Progress, Stack } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'

const TOKEN_LIMIT = 8000
const YELLOW_THRESHOLD = 5000

export interface PromptFullnessMeterProps {
  bodies: string[]
}

/**
 * Visual meter showing how full the compiled prompt is relative to an
 * 8000-token budget. Token count is approximated as character count
 * divided by 4. Takes an array of block body strings and sums their
 * lengths.
 *
 * Color thresholds:
 * - green:  < 5000 tokens
 * - yellow: 5000–8000 tokens
 * - red:    > 8000 tokens
 */
export function PromptFullnessMeter({ bodies }: PromptFullnessMeterProps) {
  const totalChars = bodies.reduce((sum, b) => sum + (b?.length ?? 0), 0)
  const tokens = Math.ceil(totalChars / 4)
  const percent = Math.min((tokens / TOKEN_LIMIT) * 100, 100)

  const color =
    tokens > TOKEN_LIMIT
      ? 'red'
      : tokens >= YELLOW_THRESHOLD
        ? 'yellow'
        : 'green'

  return (
    <Stack gap={6}>
      <Text
        variant="muted"
        style={{
          fontSize: 'var(--mantine-font-size-xs)',
          fontFamily: 'var(--mantine-font-family-monospace)',
        }}
      >
        {tokens.toLocaleString()} / {TOKEN_LIMIT.toLocaleString()} tokens used
      </Text>
      <Progress value={percent} color={color} size="sm" radius="sm" />
    </Stack>
  )
}
