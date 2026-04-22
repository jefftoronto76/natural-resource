'use client'

import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Stack,
  Switch,
  Table,
} from '@mantine/core'
import { IconChevronRight, IconPencil, IconTrash } from '@tabler/icons-react'
import { Text } from '@/components/admin/primitives/Text'
import {
  TYPE_COLORS,
  formatTypeBadgeLabel,
  type BlockType,
} from './blockTypes'

const PREVIEW_LINE_LIMIT = 8
const COLUMN_COUNT = 8 // checkbox · chevron · title · type · topic · order · status · actions

function BlockPreviewRow({
  body,
  onViewFull,
}: {
  body: string
  onViewFull: () => void
}) {
  const lines = body.split('\n')
  const preview = lines.slice(0, PREVIEW_LINE_LIMIT).join('\n')
  const hasMore = lines.length > PREVIEW_LINE_LIMIT

  return (
    <Stack gap="xs" p="sm">
      {body ? (
        <pre
          style={{
            fontFamily: 'var(--mantine-font-family-monospace)',
            fontSize: 'var(--mantine-font-size-xs)',
            color: 'var(--mantine-color-dark-7)',
            backgroundColor: 'var(--mantine-color-gray-0)',
            padding: 'var(--mantine-spacing-sm)',
            borderRadius: 'var(--mantine-radius-sm)',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {preview}
          {hasMore && '\n…'}
        </pre>
      ) : (
        <Text variant="muted">(empty)</Text>
      )}
      <Button
        variant="subtle"
        color="gray"
        size="xs"
        onClick={onViewFull}
        style={{ alignSelf: 'flex-start' }}
      >
        View full
      </Button>
    </Stack>
  )
}

export interface BlockRowBlock {
  id: string
  title: string
  type: BlockType
  body: string
  status: 'active' | 'disabled' | 'deleted'
  order: number | null
  topics: { name: string } | null
}

export interface BlockRowProps {
  block: BlockRowBlock
  selected: boolean
  isSaving?: boolean
  isExpanded?: boolean
  onToggleSelect: (blockId: string) => void
  onToggleStatus: (blockId: string, nextStatus: 'active' | 'disabled') => void
  onOrderCommit: (
    blockId: string,
    oldValue: number | null,
    nextValue: number | null,
  ) => Promise<boolean>
  onEdit: (blockId: string) => void
  onDelete: (blockId: string) => void
  onToggleExpand?: (blockId: string) => void
}

/**
 * Desktop-only table row for a single block. Owns no API calls — all
 * mutations dispatch via callbacks. The NumberInput uses local state
 * so invalid-but-rejected values can revert cleanly. Feedback for
 * rejected commits (e.g. duplicate order) is surfaced by the parent
 * via a toast, not an inline error on this row — matches today's
 * main behavior.
 *
 * No drag handle — Phase 1 ordering is NumberInput-only per D1.
 *
 * Step 10: skeleton — no inline preview yet. The expand chevron is a
 * placeholder; body preview lands in Step 11 alongside an expanded
 * sibling row rendered by the parent.
 */
export function BlockRow({
  block,
  selected,
  isSaving = false,
  isExpanded = false,
  onToggleSelect,
  onToggleStatus,
  onOrderCommit,
  onEdit,
  onDelete,
  onToggleExpand,
}: BlockRowProps) {
  const [localOrder, setLocalOrder] = useState<string | number>(
    block.order ?? '',
  )

  // Server value changed (commit succeeded, external update) — sync
  // local input state.
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
    const next =
      parsed === null || Number.isNaN(parsed) ? null : parsed

    const ok = await onOrderCommit(block.id, block.order, next)
    if (ok) {
      console.log('[BlockRow] order commit success', {
        blockId: block.id,
        from: block.order,
        to: next,
      })
    } else {
      console.log('[BlockRow] order commit rejected', {
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
    console.log('[BlockRow] status toggle', {
      blockId: block.id,
      to: nextStatus,
    })
    onToggleStatus(block.id, nextStatus)
  }

  function handleEdit() {
    console.log('[BlockRow] edit', { blockId: block.id })
    onEdit(block.id)
  }

  function handleDelete() {
    console.log('[BlockRow] delete', { blockId: block.id })
    onDelete(block.id)
  }

  return (
    <>
    <Table.Tr>
      <Table.Td>
        <Checkbox
          checked={selected}
          onChange={() => onToggleSelect(block.id)}
          disabled={isSaving}
          aria-label={`Select ${block.title}`}
        />
      </Table.Td>
      <Table.Td style={{ width: 28 }}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => onToggleExpand?.(block.id)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <IconChevronRight
            size={14}
            style={{
              transform: isExpanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 120ms ease',
            }}
          />
        </ActionIcon>
      </Table.Td>
      <Table.Td>
        <Text variant="label">{block.title}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={TYPE_COLORS[block.type]}
          size="sm"
          radius="sm"
        >
          {formatTypeBadgeLabel(block.type)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text variant="muted">{block.topics?.name ?? '—'}</Text>
      </Table.Td>
      <Table.Td style={{ width: 90 }}>
        <NumberInput
          value={localOrder}
          onChange={handleOrderChange}
          onBlur={handleOrderBlur}
          hideControls
          allowDecimal={false}
          w={70}
          size="xs"
          aria-label="Order"
        />
      </Table.Td>
      <Table.Td>
        <Switch
          checked={block.status === 'active'}
          onChange={e => handleStatusToggle(e.currentTarget.checked)}
          color="green"
          disabled={isSaving}
          aria-label={`${
            block.status === 'active' ? 'Disable' : 'Enable'
          } ${block.title}`}
        />
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            onClick={handleEdit}
            disabled={isSaving}
            aria-label="Edit block"
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="md"
            onClick={handleDelete}
            disabled={isSaving}
            aria-label="Delete block"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
    {isExpanded && (
      <Table.Tr>
        <Table.Td colSpan={COLUMN_COUNT}>
          <BlockPreviewRow body={block.body} onViewFull={handleEdit} />
        </Table.Td>
      </Table.Tr>
    )}
    </>
  )
}
