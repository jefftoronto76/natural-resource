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
} from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { Text } from '@/components/admin/primitives/Text'

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

  if (!items.length) {
    return (
      <Center h={200}>
        <Text variant="muted">No blocks yet.</Text>
      </Center>
    )
  }

  return (
    <>
      {/* Desktop: Table */}
      <Box visibleFrom="md">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
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
                      <Text variant="label">{block.title}</Text>
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
                      <Table.Td colSpan={5}>
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
                <Badge
                  variant="light"
                  color={TYPE_COLORS[block.type] ?? 'gray'}
                  size="sm"
                  radius="sm"
                >
                  {TYPE_LABELS[block.type] ?? block.type}
                </Badge>
                <Badge
                  variant="light"
                  color={block.status === 'active' ? 'green' : 'gray'}
                  size="sm"
                  radius="sm"
                >
                  {block.status === 'active' ? 'Active' : 'Disabled'}
                </Badge>
              </Group>
              <Text variant="label" style={{ marginTop: 4 }}>{block.title}</Text>
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
    </>
  )
}
