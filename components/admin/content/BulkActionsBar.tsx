'use client'

import { Button, Group, Paper } from '@mantine/core'
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react'
import { Text } from '@/components/admin/primitives/Text'

export interface BulkActionsBarProps {
  selectedCount: number
  disabled?: boolean
  onEnable: () => void
  onDisable: () => void
  onDelete: () => void
  onClear: () => void
}

/**
 * Sticky toolbar that appears above the block list when one or more
 * rows are selected. Surfaces four user transactions: Enable, Disable,
 * Delete (labeled with icon — discoverability over density), and
 * Clear. Delete is expected to open the parent's bulk-delete
 * confirmation modal rather than PATCH directly; the bar just
 * dispatches.
 *
 * Caller owns the selection state and actual API calls. This bar is
 * a transaction surface — logs dispatches, lets the parent do the
 * work.
 */
export function BulkActionsBar({
  selectedCount,
  disabled = false,
  onEnable,
  onDisable,
  onDelete,
  onClear,
}: BulkActionsBarProps) {
  function handleEnable() {
    console.log('[BulkActionsBar] enable', { count: selectedCount })
    onEnable()
  }

  function handleDisable() {
    console.log('[BulkActionsBar] disable', { count: selectedCount })
    onDisable()
  }

  function handleDelete() {
    console.log('[BulkActionsBar] delete', { count: selectedCount })
    onDelete()
  }

  function handleClear() {
    console.log('[BulkActionsBar] clear', { count: selectedCount })
    onClear()
  }

  return (
    <Paper
      p="sm"
      mb="md"
      radius="sm"
      withBorder
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <Text variant="label" style={{ flex: 1, minWidth: 0 }}>
          {selectedCount} selected
        </Text>
        <Button
          variant="light"
          color="green"
          size="sm"
          leftSection={<IconCheck size={16} />}
          onClick={handleEnable}
          disabled={disabled}
        >
          Enable
        </Button>
        <Button
          variant="light"
          color="gray"
          size="sm"
          leftSection={<IconX size={16} />}
          onClick={handleDisable}
          disabled={disabled}
        >
          Disable
        </Button>
        <Button
          variant="light"
          color="red"
          size="sm"
          leftSection={<IconTrash size={16} />}
          onClick={handleDelete}
          disabled={disabled}
        >
          Delete
        </Button>
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
        >
          Clear
        </Button>
      </Group>
    </Paper>
  )
}
