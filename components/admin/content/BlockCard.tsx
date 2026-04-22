'use client'

import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react'
import {
  ActionIcon,
  Badge,
  Checkbox,
  Group,
  NumberInput,
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
import type { BlockRowBlock } from './BlockRow'

export type BlockCardBlock = BlockRowBlock

export interface BlockCardProps {
  block: BlockCardBlock
  selected: boolean
  isSaving?: boolean
  onToggleSelect: (blockId: string) => void
  onToggleStatus: (blockId: string, nextStatus: 'active' | 'disabled') => void
  onOrderCommit: (
    blockId: string,
    oldValue: number | null,
    nextValue: number | null,
  ) => Promise<boolean>
  onOpenEdit: (blockId: string) => void
  onDelete: (blockId: string) => void
}

/**
 * Mobile card for a single block. Own shape — not a mobile-ified row.
 * Information hierarchy:
 *   Primary   — checkbox · type badge · title · status Switch
 *   Secondary — topic · type meta
 *   Dedicated — Order control (label + NumberInput), error stacked
 *               below the control (not inline-right)
 *   Actions   — Delete icon (Edit is implicit via tap-body)
 *
 * Tap anywhere that's not an interactive control opens the edit
 * sheet. All interactive zones (checkbox, switch, order, delete)
 * stopPropagation to prevent the tap-body handler from firing.
 *
 * No inline preview — Step 11's Fragment+sibling pattern doesn't
 * work in a card layout, so preview is dropped entirely on mobile
 * per the Step 12 constraints. Tapping the card routes to the edit
 * sheet which has the full body.
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
  onOrderCommit,
  onOpenEdit,
  onDelete,
}: BlockCardProps) {
  const [localOrder, setLocalOrder] = useState<string | number>(
    block.order ?? '',
  )

  useEffect(() => {
    setLocalOrder(block.order ?? '')
  }, [block.order])

  async function handleOrderBlur() {
    const parsed =
      typeof localOrder === 'number'
        ? localOrder
        : localOrder === '' || localOrder === '-'
          ? null
          : Number(localOrder)
    const next = parsed === null || Number.isNaN(parsed) ? null : parsed

    const ok = await onOrderCommit(block.id, block.order, next)
    if (ok) {
      console.log('[BlockCard] order commit success', {
        blockId: block.id,
        from: block.order,
        to: next,
      })
    } else {
      console.log('[BlockCard] order commit rejected', {
        blockId: block.id,
        attempted: next,
        from: block.order,
      })
      setLocalOrder(block.order ?? '')
    }
  }

  function handleOrderChange(v: string | number) {
    setLocalOrder(v)
  }

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

        {/* Secondary meta */}
        <Text variant="muted">{block.topics?.name ?? '—'}</Text>

        {/* Dedicated order control — stacked layout, error below */}
        <Stack gap={4} onClick={stop}>
          <Text variant="label">Order</Text>
          <NumberInput
            value={localOrder}
            onChange={handleOrderChange}
            onBlur={handleOrderBlur}
            hideControls
            allowDecimal={false}
            size="sm"
            w={100}
            aria-label="Order"
          />
        </Stack>

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
