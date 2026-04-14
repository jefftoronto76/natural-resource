'use client'

import { useState, Fragment } from 'react'
import {
  Table,
  Badge,
  Box,
  Center,
  Group,
  Paper,
  Stack,
  Select,
  ActionIcon,
  Textarea,
  Modal,
  Button,
  Checkbox,
} from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { Text } from '@/components/admin/primitives/Text'
import { PromptFullnessMeter } from '@/components/admin/primitives/PromptFullnessMeter'

const TYPE_COLORS: Record<string, string> = {
  identity: 'violet',
  knowledge: 'blue',
  guardrail: 'red',
  process: 'orange',
  escalation: 'yellow',
}

const TYPE_LABELS: Record<string, string> = {
  identity: 'Identity & Voice',
  knowledge: 'Knowledge',
  guardrail: 'Guardrail',
  process: 'Process',
  escalation: 'Escalation',
}

type BlockStatus = 'active' | 'disabled' | 'deleted'

export interface BlockRow {
  id: string
  title: string
  type: string
  body: string
  status: BlockStatus
  is_default: boolean
  created_at: string
  topics: { name: string } | null
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
]

export function BlocksTable({ rows }: { rows: BlockRow[] }) {
  const [items, setItems] = useState<BlockRow[]>(rows)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkInFlight, setBulkInFlight] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const selectedCount = selectedIds.size
  const allSelected = items.length > 0 && selectedCount === items.length
  const someSelected = selectedCount > 0 && selectedCount < items.length

  // Order number within type group — sequential per type in current render order.
  // Walks items in place so disable/delete mutations renumber gaps automatically.
  const orderMap = new Map<string, number>()
  {
    const counters = new Map<string, number>()
    for (const b of items) {
      const next = (counters.get(b.type) ?? 0) + 1
      counters.set(b.type, next)
      orderMap.set(b.id, next)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(b => b.id)))
    }
  }

  async function handleBulkStatusChange(value: string | null) {
    if (value !== 'active' && value !== 'disabled') return
    const ids = Array.from(selectedIds)
    console.log('[BlocksTable] bulk status change:', { count: ids.length, status: value })
    setBulkInFlight(true)
    const succeeded: string[] = []
    for (const id of ids) {
      console.log('[BlocksTable] bulk PATCH dispatch:', { id, status: value })
      const ok = await patchBlock(id, { status: value })
      if (ok) {
        console.log('[BlocksTable] bulk PATCH success:', { id, status: value })
        succeeded.push(id)
      } else {
        console.error('[BlocksTable] bulk PATCH failure:', { id, status: value })
      }
    }
    if (succeeded.length > 0) {
      const updatedSet = new Set(succeeded)
      setItems(prev => prev.map(b => (updatedSet.has(b.id) ? { ...b, status: value } : b)))
    }
    setSelectedIds(new Set())
    setBulkInFlight(false)
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds)
    console.log('[BlocksTable] bulk delete:', { count: ids.length })
    setBulkInFlight(true)
    const succeeded: string[] = []
    for (const id of ids) {
      console.log('[BlocksTable] bulk DELETE dispatch:', { id })
      const ok = await patchBlock(id, { status: 'deleted' })
      if (ok) {
        console.log('[BlocksTable] bulk DELETE success:', { id })
        succeeded.push(id)
      } else {
        console.error('[BlocksTable] bulk DELETE failure:', { id })
      }
    }
    if (succeeded.length > 0) {
      const removedSet = new Set(succeeded)
      setItems(prev => prev.filter(b => !removedSet.has(b.id)))
    }
    setSelectedIds(new Set())
    setBulkInFlight(false)
    setBulkDeleteOpen(false)
  }

  async function patchBlock(id: string, updates: { status?: BlockStatus; body?: string }): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      return res.ok
    } catch (err) {
      console.error('[BlocksTable] patch failed:', err)
      return false
    }
  }

  async function handleStatusChange(id: string, value: string | null) {
    if (value !== 'active' && value !== 'disabled') return
    setSavingId(id)
    const ok = await patchBlock(id, { status: value })
    if (ok) {
      setItems(prev => prev.map(b => (b.id === id ? { ...b, status: value } : b)))
    }
    setSavingId(null)
  }

  function handleEdit(id: string, currentBody: string) {
    setEditingId(id)
    setEditBody(currentBody)
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditBody('')
  }

  async function handleSaveEdit(id: string) {
    setSavingId(id)
    const ok = await patchBlock(id, { body: editBody })
    if (ok) {
      setItems(prev => prev.map(b => (b.id === id ? { ...b, body: editBody } : b)))
      setEditingId(null)
      setEditBody('')
    }
    setSavingId(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    setDeleting(true)
    const ok = await patchBlock(deleteTargetId, { status: 'deleted' })
    if (ok) {
      setItems(prev => prev.filter(b => b.id !== deleteTargetId))
    }
    setDeleting(false)
    setDeleteTargetId(null)
  }

  const activeBodies = items
    .filter(b => b.status === 'active')
    .map(b => b.body ?? '')

  return (
    <>
      {/* Prompt fullness meter — always visible */}
      <Box mb="md">
        <PromptFullnessMeter bodies={activeBodies} />
      </Box>

      {items.length === 0 ? (
        <Center h={200}>
          <Text variant="muted">No blocks yet.</Text>
        </Center>
      ) : null}

      {items.length > 0 && <>
      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <Paper
          p="sm"
          mb="md"
          radius="sm"
          withBorder
          style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}
        >
          <Group gap="sm" wrap="nowrap">
            <Text variant="label" style={{ flex: 1, minWidth: 0 }}>
              {selectedCount} selected
            </Text>
            <Select
              data={STATUS_OPTIONS}
              placeholder="Set status..."
              value={null}
              onChange={handleBulkStatusChange}
              size="xs"
              allowDeselect={false}
              disabled={bulkInFlight}
              style={{ width: 140 }}
              aria-label="Bulk status"
            />
            <ActionIcon
              variant="subtle"
              color="red"
              size="md"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkInFlight}
              aria-label="Delete selected"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Paper>
      )}

      {/* Desktop: Table */}
      <Box visibleFrom="md">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleSelectAll}
                  disabled={bulkInFlight}
                  aria-label="Select all blocks"
                />
              </Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Topic</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((block) => {
              const isEditing = editingId === block.id
              const isSaving = savingId === block.id
              return (
                <Fragment key={block.id}>
                  <Table.Tr>
                    <Table.Td>
                      <Checkbox
                        checked={selectedIds.has(block.id)}
                        onChange={() => toggleSelect(block.id)}
                        disabled={bulkInFlight}
                        aria-label={`Select ${block.title}`}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Text
                          variant="muted"
                          style={{
                            fontFamily: 'var(--mantine-font-family-monospace)',
                            fontSize: 'var(--mantine-font-size-xs)',
                          }}
                        >
                          #{orderMap.get(block.id) ?? ''}
                        </Text>
                        <Text variant="label">{block.title}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={TYPE_COLORS[block.type] ?? 'gray'}
                        size="sm"
                        radius="sm"
                      >
                        {TYPE_LABELS[block.type] ?? block.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text variant="muted">{block.topics?.name ?? '—'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={block.status === 'active' ? 'green' : 'gray'}
                        size="sm"
                        radius="sm"
                      >
                        {block.status === 'active' ? 'Active' : 'Disabled'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Select
                          data={STATUS_OPTIONS}
                          value={block.status}
                          onChange={v => handleStatusChange(block.id, v)}
                          size="xs"
                          allowDeselect={false}
                          disabled={isSaving}
                          style={{ width: 110 }}
                          aria-label="Status"
                        />
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="md"
                          onClick={() => handleEdit(block.id, block.body)}
                          disabled={isEditing || isSaving}
                          aria-label="Edit block"
                        >
                          <IconPencil size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="md"
                          onClick={() => setDeleteTargetId(block.id)}
                          disabled={isSaving}
                          aria-label="Delete block"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                  {isEditing && (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Stack gap="sm" p="sm">
                          <Textarea
                            value={editBody}
                            onChange={e => setEditBody(e.currentTarget.value)}
                            autosize
                            minRows={4}
                            maxRows={12}
                            size="sm"
                          />
                          <Group gap="xs">
                            <Button
                              variant="filled"
                              color="green"
                              size="xs"
                              onClick={() => handleSaveEdit(block.id)}
                              loading={isSaving}
                            >
                              Save
                            </Button>
                            <Button
                              variant="subtle"
                              color="gray"
                              size="xs"
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </Group>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Fragment>
              )
            })}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Mobile: Card stack */}
      <Stack gap="sm" hiddenFrom="md">
        {items.map((block) => {
          const isEditing = editingId === block.id
          const isSaving = savingId === block.id
          return (
            <Paper key={block.id} p="md" withBorder radius="sm">
              <Group justify="space-between" mb={4} wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <Checkbox
                    checked={selectedIds.has(block.id)}
                    onChange={() => toggleSelect(block.id)}
                    disabled={bulkInFlight}
                    aria-label={`Select ${block.title}`}
                    size="sm"
                  />
                  <Badge
                    variant="light"
                    color={TYPE_COLORS[block.type] ?? 'gray'}
                    size="sm"
                    radius="sm"
                  >
                    {TYPE_LABELS[block.type] ?? block.type}
                  </Badge>
                </Group>
                <Badge
                  variant="light"
                  color={block.status === 'active' ? 'green' : 'gray'}
                  size="sm"
                  radius="sm"
                >
                  {block.status === 'active' ? 'Active' : 'Disabled'}
                </Badge>
              </Group>
              <Group gap="xs" wrap="nowrap" style={{ marginTop: 4 }}>
                <Text
                  variant="muted"
                  style={{
                    fontFamily: 'var(--mantine-font-family-monospace)',
                    fontSize: 'var(--mantine-font-size-xs)',
                  }}
                >
                  #{orderMap.get(block.id) ?? ''}
                </Text>
                <Text variant="label">{block.title}</Text>
              </Group>
              <Text variant="muted">{block.topics?.name ?? '—'}</Text>
              {isEditing ? (
                <Stack gap="sm" mt="sm">
                  <Textarea
                    value={editBody}
                    onChange={e => setEditBody(e.currentTarget.value)}
                    autosize
                    minRows={4}
                    maxRows={12}
                    size="sm"
                  />
                  <Group gap="xs">
                    <Button
                      variant="filled"
                      color="green"
                      size="xs"
                      onClick={() => handleSaveEdit(block.id)}
                      loading={isSaving}
                    >
                      Save
                    </Button>
                    <Button
                      variant="subtle"
                      color="gray"
                      size="xs"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </Group>
                </Stack>
              ) : (
                <Group gap="xs" mt="sm" wrap="nowrap">
                  <Select
                    data={STATUS_OPTIONS}
                    value={block.status}
                    onChange={v => handleStatusChange(block.id, v)}
                    size="xs"
                    allowDeselect={false}
                    disabled={isSaving}
                    style={{ flex: 1, minWidth: 0 }}
                    aria-label="Status"
                  />
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="md"
                    onClick={() => handleEdit(block.id, block.body)}
                    disabled={isSaving}
                    aria-label="Edit block"
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="md"
                    onClick={() => setDeleteTargetId(block.id)}
                    disabled={isSaving}
                    aria-label="Delete block"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              )}
            </Paper>
          )
        })}
      </Stack>
      </>}

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteTargetId !== null}
        onClose={() => { if (!deleting) setDeleteTargetId(null) }}
        title="Delete block?"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text variant="muted">
            This block will be permanently removed from your prompt.
          </Text>
          <Group gap="xs" justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setDeleteTargetId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              color="red"
              size="sm"
              onClick={handleConfirmDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Bulk delete confirmation modal */}
      <Modal
        opened={bulkDeleteOpen}
        onClose={() => { if (!bulkInFlight) setBulkDeleteOpen(false) }}
        title={`Delete ${selectedCount} block${selectedCount === 1 ? '' : 's'}?`}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text variant="muted">
            Delete {selectedCount} block{selectedCount === 1 ? '' : 's'}? This cannot be undone.
          </Text>
          <Group gap="xs" justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={bulkInFlight}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              color="red"
              size="sm"
              onClick={handleBulkDelete}
              loading={bulkInFlight}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
