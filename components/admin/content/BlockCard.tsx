'use client'

import { type KeyboardEvent, type MouseEvent } from 'react'
import {
  ActionIcon,
  Badge,
  Checkbox,
  Group,
  Paper,
  Stack,
  Switch,
} from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { Text } from '@/components/admin/primitives/Text'
import {
  TYPE_COLORS,
  formatTypeBadgeLabel,
} from '@/lib/blockTypes'
import { orderPrefix } from '@/lib/blockOrder'
import type { BlockRowBlock } from './BlockRow'

export type BlockCardBlock = BlockRowBlock

export interface BlockCardProps {
  block: BlockCardBlock
  selected: boolean
  isSaving?: boolean
  onToggleSelect: (blockId: string) => void
  onToggleStatus: (blockId: string, nextStatus: 'active' | 'disabled') => void
  onOpenEdit: (blockId: string) => void
  onDelete: (blockId: string) => void
}

/**
 * Mobile card for a single block. Own shape — not a mobile-ified row.
 * Information hierarchy:
 *   Primary  — checkbox · type badge · order-prefix + title · status Switch
 *   Actions  — Delete icon (Edit is implicit via tap-body)
 *
 * The "01" / "02" prefix on the title is monospace, muted, zero-padded
 * to 2 digits — same convention as the desktop row. Unordered blocks
 * (order = null / 0) render an empty 2ch gutter so titles stay
 * vertically aligned across the card stack.
 *
 * Tap anywhere that's not an interactive control opens the edit
 * sheet. All interactive zones (checkbox, switch, delete) stopPropagation
 * to prevent the tap-body handler from firing.
 *
 * No inline preview — Step 11's Fragment+sibling pattern doesn't
 * work in a card layout, so preview is dropped entirely on mobile.
 * Tapping the card routes to the edit sheet which has the full body
 * and (Step 12) the editable Order field.
 *
 * Checkbox wrapper uses padding + negative margin to guarantee a
 * 44px tap target around Mantine's ~24px Checkbox without affecting
 * visual layout.
 */
export function BlockCard({
  block,
  selected,
  isSaving = false,
  onToggleSelect,
  onToggleStatus,
  onOpenEdit,
  onDelete,
}: BlockCardProps) {
  function handleStatusToggle(checked: boolean) {
    const nextStatus = checked ? 'active' : 'disabled'
    console.log('[BlockCard] status toggle', {
      blockId: block.id,
      to: nextStatus,
    })
    onToggleStatus(block.id, nextStatus)
  }

  function handleTapBody() {
    console.log('[BlockCard] tap to open edit', { blockId: block.id })
    onOpenEdit(block.id)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTapBody()
    }
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation()
    console.log('[BlockCard] delete', { blockId: block.id })
    onDelete(block.id)
  }

  function stop(e: MouseEvent) {
    e.stopPropagation()
  }

  return (
    <Paper
      p="md"
      withBorder
      radius="sm"
      onClick={handleTapBody}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${block.title}`}
      style={{ cursor: 'pointer' }}
    >
      <Stack gap="sm">
        {/* Primary row */}
        <Group justify="space-between" wrap="nowrap" align="center">
          <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <div
              onClick={stop}
              style={{
                padding: 10,
                margin: -10,
                display: 'inline-flex',
              }}
            >
              <Checkbox
                checked={selected}
                onChange={() => onToggleSelect(block.id)}
                disabled={isSaving}
                size="md"
                aria-label={`Select ${block.title}`}
              />
            </div>
            <Badge
              variant="light"
              color={TYPE_COLORS[block.type]}
              size="sm"
              radius="sm"
            >
              {formatTypeBadgeLabel(block.type)}
            </Badge>
            <Text
              variant="label"
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                aria-hidden
                style={{
                  fontFamily: 'var(--mantine-font-family-monospace)',
                  fontSize: 'var(--mantine-font-size-xs)',
                  color: 'var(--mantine-color-dimmed)',
                  display: 'inline-block',
                  width: '2ch',
                  marginRight: 8,
                  flexShrink: 0,
                }}
              >
                {orderPrefix(block.order)}
              </span>
              {block.title}
            </Text>
          </Group>
          <div onClick={stop} style={{ display: 'inline-flex' }}>
            <Switch
              checked={block.status === 'active'}
              onChange={e => handleStatusToggle(e.currentTarget.checked)}
              color="green"
              size="md"
              disabled={isSaving}
              aria-label={`${
                block.status === 'active' ? 'Disable' : 'Enable'
              } ${block.title}`}
            />
          </div>
        </Group>

        {/* Actions */}
        <Group justify="flex-end">
          <ActionIcon
            variant="subtle"
            color="red"
            size="lg"
            onClick={handleDelete}
            disabled={isSaving}
            aria-label="Delete block"
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  )
}
