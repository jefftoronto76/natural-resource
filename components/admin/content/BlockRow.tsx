'use client'

import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
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
} from '@/lib/blockTypes'
import { orderPrefix } from '@/lib/blockOrder'

const PREVIEW_LINE_LIMIT = 8
const COLUMN_COUNT = 6 // checkbox · chevron · title · type · status · actions

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
  updated_at: string
  topics: { name: string } | null
  author: { name: string } | null
}

export interface BlockRowProps {
  block: BlockRowBlock
  selected: boolean
  isSaving?: boolean
  isExpanded?: boolean
  onToggleSelect: (blockId: string) => void
  onToggleStatus: (blockId: string, nextStatus: 'active' | 'disabled') => void
  onEdit: (blockId: string) => void
  onDelete: (blockId: string) => void
  onToggleExpand?: (blockId: string) => void
}

/**
 * Desktop-only table row for a single block. Owns no API calls — all
 * mutations dispatch via callbacks.
 *
 * Title cell carries an order-prefix span ("01", "02", …) for ordered
 * blocks; unordered blocks reserve the gutter via a 2ch-wide empty
 * span so titles stay vertically aligned across the table.
 *
 * Order edit lives in the drawer/sheet form (Step 12 of PR 2) — there
 * is no inline NumberInput on the row anymore. Feedback for rejected
 * commits (duplicate order in the same type) is surfaced by the
 * parent via a Mantine notification, raised from the form's save
 * path.
 */
export function BlockRow({
  block,
  selected,
  isSaving = false,
  isExpanded = false,
  onToggleSelect,
  onToggleStatus,
  onEdit,
  onDelete,
  onToggleExpand,
}: BlockRowProps) {
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
        <Text variant="label">
          <span
            aria-hidden
            style={{
              fontFamily: 'var(--mantine-font-family-monospace)',
              fontSize: 'var(--mantine-font-size-xs)',
              color: 'var(--mantine-color-dimmed)',
              display: 'inline-block',
              width: '2ch',
              marginRight: 8,
            }}
          >
            {orderPrefix(block.order)}
          </span>
          {block.title}
        </Text>
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
