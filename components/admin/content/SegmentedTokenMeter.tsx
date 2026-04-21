'use client'

import { useEffect, useRef } from 'react'
import { Group, Progress, Stack, Tooltip } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'
import { TYPE_COLORS, TYPE_LABELS, type BlockType } from './blockTypes'

const TOKEN_LIMIT = 8000
const YELLOW_THRESHOLD = 5000
const CHARS_PER_TOKEN = 4

export interface SegmentedTokenMeterBlock {
  id: string
  title: string
  type: BlockType
  body: string
}

export interface SegmentedTokenMeterProps {
  blocks: SegmentedTokenMeterBlock[]
}

function tokensFor(body: string): number {
  return Math.ceil((body?.length ?? 0) / CHARS_PER_TOKEN)
}

/**
 * Stacked progress meter with one segment per active block, colored by
 * block type. Hovering a segment shows "{title} · {tokens} tokens".
 * Over-budget (> TOKEN_LIMIT) recolors every segment red; between
 * YELLOW_THRESHOLD and TOKEN_LIMIT, segments stay their per-type color
 * but the total label turns yellow as a heads-up.
 */
export function SegmentedTokenMeter({ blocks }: SegmentedTokenMeterProps) {
  const segments = blocks.map(b => ({
    id: b.id,
    title: b.title,
    type: b.type,
    tokens: tokensFor(b.body ?? ''),
  }))
  const totalTokens = segments.reduce((sum, s) => sum + s.tokens, 0)
  const overBudget = totalTokens > TOKEN_LIMIT
  const warning = !overBudget && totalTokens >= YELLOW_THRESHOLD

  // Observability — log over-budget state transitions so we can see in
  // the console when the meter flips between normal / warning / red.
  const prevStateRef = useRef<'ok' | 'warning' | 'over'>('ok')
  useEffect(() => {
    const nextState: 'ok' | 'warning' | 'over' = overBudget
      ? 'over'
      : warning
        ? 'warning'
        : 'ok'
    if (nextState !== prevStateRef.current) {
      console.log('[SegmentedTokenMeter] budget state change', {
        from: prevStateRef.current,
        to: nextState,
        totalTokens,
        limit: TOKEN_LIMIT,
      })
      prevStateRef.current = nextState
    }
  }, [overBudget, warning, totalTokens])

  const labelColor = overBudget
    ? 'var(--mantine-color-red-7)'
    : warning
      ? 'var(--mantine-color-yellow-8)'
      : undefined

  return (
    <Stack gap={6}>
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Text
          variant="muted"
          style={{
            fontSize: 'var(--mantine-font-size-xs)',
            fontFamily: 'var(--mantine-font-family-monospace)',
            color: labelColor,
          }}
        >
          {totalTokens.toLocaleString()} / {TOKEN_LIMIT.toLocaleString()} tokens used
        </Text>
      </Group>
      <Progress.Root size="sm" radius="sm">
        {segments.map(seg => {
          const value = Math.min((seg.tokens / TOKEN_LIMIT) * 100, 100)
          const color = overBudget ? 'red' : TYPE_COLORS[seg.type]
          return (
            <Tooltip
              key={seg.id}
              label={`${seg.title} · ${seg.tokens.toLocaleString()} tokens · ${TYPE_LABELS[seg.type]}`}
              withArrow
              openDelay={150}
            >
              <Progress.Section value={value} color={color} aria-label={seg.title} />
            </Tooltip>
          )
        })}
      </Progress.Root>
    </Stack>
  )
}
