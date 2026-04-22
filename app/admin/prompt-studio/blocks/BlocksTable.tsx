'use client'

import { useState, Fragment } from 'react'
import {
  Table,
  Box,
  Center,
  Group,
  Paper,
  Stack,
  Textarea,
  Modal,
  Button,
  Checkbox,
  Alert,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Text } from '@/components/admin/primitives/Text'
import { SegmentedTokenMeter } from '@/components/admin/content/SegmentedTokenMeter'
import { BulkActionsBar } from '@/components/admin/content/BulkActionsBar'
import { BlockRow as DesktopBlockRow } from '@/components/admin/content/BlockRow'
import { BlockCard } from '@/components/admin/content/BlockCard'
import type { BlockType } from '@/lib/blockTypes'
import { isOrdered } from '@/lib/blockOrder'

type BlockStatus = 'active' | 'disabled' | 'deleted'

interface CheckIssue {
  description: string
  offendingText: string | null
}

interface CheckResult {
  ok: boolean
  issues: CheckIssue[]
}

export interface BlockRow {
  id: string
  title: string
  type: string
  body: string
  status: BlockStatus
  is_default: boolean
  order: number | null
  created_at: string
  topics: { name: string } | null
}

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
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [issuesMap, setIssuesMap] = useState<Record<string, CheckIssue[]>>({})
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedCount = selectedIds.size
  const allSelected = items.length > 0 && selectedCount === items.length
  const someSelected = selectedCount > 0 && selectedCount < items.length

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

  async function patchBlock(
    id: string,
    updates: { status?: BlockStatus; body?: string; order?: number },
  ): Promise<boolean> {
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

  async function handleOrderBlur(
    id: string,
    oldValue: number | null,
    nextValue: number | null,
  ): Promise<boolean> {
    console.log('[BlocksTable] order blur:', { id, oldValue, nextValue })
    if (nextValue === null || !Number.isFinite(nextValue) || !Number.isInteger(nextValue)) {
      console.log('[BlocksTable] order blur skipped — invalid value:', { id, nextValue })
      return false
    }
    if (nextValue === oldValue) {
      console.log('[BlocksTable] order blur skipped — no change:', { id, value: nextValue })
      return true
    }

    const current = items.find(b => b.id === id)
    if (!current) {
      console.error('[BlocksTable] order blur — block not found in state:', { id })
      return false
    }

    // Only run the uniqueness check when the user is setting a meaningful
    // ordinal. 0 and null are "unset" (see src/lib/blockOrder.ts) and
    // multiple blocks of the same type can legitimately share them.
    const conflict = isOrdered(nextValue)
      ? items.find(
          b => b.id !== id && b.type === current.type && b.order === nextValue,
        )
      : null
    console.log('[BlocksTable] order duplicate check:', {
      id,
      type: current.type,
      nextValue,
      hasConflict: Boolean(conflict),
      conflictTitle: conflict?.title ?? null,
      conflictId: conflict?.id ?? null,
    })
    if (conflict) {
      notifications.show({
        color: 'red',
        title: 'Duplicate order number',
        message: `Order number already used by ${conflict.title} in this type. Please choose a different number.`,
      })
      return false
    }

    console.log('[BlocksTable] order PATCH dispatch:', { id, oldValue, newValue: nextValue })
    const ok = await patchBlock(id, { order: nextValue })
    if (ok) {
      console.log('[BlocksTable] order PATCH success:', { id, oldValue, newValue: nextValue })
      setItems(prev => prev.map(b => (b.id === id ? { ...b, order: nextValue } : b)))
      return true
    }
    console.error('[BlocksTable] order PATCH failure:', { id, oldValue, newValue: nextValue })
    return false
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
    const id = editingId
    setEditingId(null)
    setEditBody('')
    if (id) {
      setIssuesMap(prev => {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  async function runSafetyCheck(id: string, body: string): Promise<CheckResult> {
    console.log('[BlocksTable] safety check dispatch:', { id })
    try {
      const res = await fetch('/api/admin/prompt/compile/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      if (!res.ok) {
        console.error('[BlocksTable] safety check HTTP error:', res.status)
        return { ok: true, issues: [] }
      }
      const data: CheckResult = await res.json()
      console.log('[BlocksTable] safety check result:', {
        id,
        ok: data.ok,
        issueCount: data.issues?.length ?? 0,
      })
      return {
        ok: data.ok === true,
        issues: Array.isArray(data.issues) ? data.issues : [],
      }
    } catch (err) {
      console.error('[BlocksTable] safety check failed:', err)
      // Fail open — don't block the save flow on a check error.
      return { ok: true, issues: [] }
    }
  }

  async function handleCheckAndSave(id: string) {
    console.log('[BlocksTable] check & save start:', { id })
    // Clear stale issues from any previous check before re-running
    setIssuesMap(prev => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    setCheckingId(id)
    const result = await runSafetyCheck(id, editBody)
    setCheckingId(null)

    if (!result.ok && result.issues.length > 0) {
      console.log('[BlocksTable] check flagged issues, keeping edit row open:', { id, count: result.issues.length })
      setIssuesMap(prev => ({ ...prev, [id]: result.issues }))
      return
    }

    // Clean — proceed to PATCH and close the row.
    console.log('[BlocksTable] check clean, dispatching PATCH:', { id })
    setSavingId(id)
    const ok = await patchBlock(id, { body: editBody })
    if (ok) {
      console.log('[BlocksTable] save success, closing edit row:', { id })
      setItems(prev => prev.map(b => (b.id === id ? { ...b, body: editBody } : b)))
      setEditingId(null)
      setEditBody('')
    } else {
      console.error('[BlocksTable] save failed:', { id })
    }
    setSavingId(null)
  }

  async function handleSaveAnyway(id: string) {
    console.log('[BlocksTable] save anyway (bypass check):', { id })
    setSavingId(id)
    const ok = await patchBlock(id, { body: editBody })
    if (ok) {
      console.log('[BlocksTable] save anyway success, closing edit row:', { id })
      setItems(prev => prev.map(b => (b.id === id ? { ...b, body: editBody } : b)))
      setEditingId(null)
      setEditBody('')
      setIssuesMap(prev => {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      })
    } else {
      console.error('[BlocksTable] save anyway failed:', { id })
    }
    setSavingId(null)
  }

  function handleRemoveOffending(id: string, offendingText: string) {
    console.log('[BlocksTable] remove offending text:', { id, length: offendingText.length })
    setEditBody(prev => prev.replace(offendingText, ''))
    // Drop this issue and any duplicates referencing the same offendingText.
    setIssuesMap(prev => {
      const current = prev[id]
      if (!current) return prev
      const filtered = current.filter(i => i.offendingText !== offendingText)
      if (filtered.length === 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: filtered }
    })
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

  const activeMeterBlocks = items
    .filter(b => b.status === 'active')
    .map(b => ({
      id: b.id,
      title: b.title,
      type: b.type as BlockType,
      body: b.body ?? '',
    }))

  return (
    <>
      {/* Segmented token meter — one segment per active block, colored by type */}
      <Box mb="md">
        <SegmentedTokenMeter blocks={activeMeterBlocks} />
      </Box>

      {items.length === 0 ? (
        <Center h={200}>
          <Text variant="muted">No blocks yet.</Text>
        </Center>
      ) : null}

      {items.length > 0 && <>
      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          disabled={bulkInFlight}
          onEnable={() => handleBulkStatusChange('active')}
          onDisable={() => handleBulkStatusChange('disabled')}
          onDelete={() => setBulkDeleteOpen(true)}
          onClear={() => setSelectedIds(new Set())}
        />
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
              <Table.Th style={{ width: 28 }} aria-hidden />
              <Table.Th>Title</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Topic</Table.Th>
              <Table.Th style={{ width: 90 }}>Order</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((block) => {
              const isEditing = editingId === block.id
              const isSaving = savingId === block.id
              const isChecking = checkingId === block.id
              const issues = issuesMap[block.id] ?? []
              const hasIssues = issues.length > 0
              return (
                <Fragment key={block.id}>
                  <DesktopBlockRow
                    block={{
                      ...block,
                      type: block.type as BlockType,
                    }}
                    selected={selectedIds.has(block.id)}
                    isSaving={isSaving}
                    isExpanded={expandedIds.has(block.id)}
                    onToggleSelect={toggleSelect}
                    onToggleStatus={handleStatusChange}
                    onOrderCommit={handleOrderBlur}
                    onEdit={id => handleEdit(id, block.body)}
                    onDelete={setDeleteTargetId}
                    onToggleExpand={toggleExpand}
                  />
                  {isEditing && (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Stack gap="sm" p="sm">
                          <Textarea
                            value={editBody}
                            onChange={e => setEditBody(e.currentTarget.value)}
                            autosize
                            minRows={4}
                            maxRows={12}
                            size="sm"
                            disabled={isChecking || isSaving}
                          />
                          {hasIssues && (
                            <Alert
                              color="yellow"
                              variant="light"
                              radius="sm"
                              title="Safety check flagged this block"
                            >
                              <Stack gap="xs">
                                {issues.map((issue, i) => (
                                  <Stack key={i} gap={4}>
                                    <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
                                      {issue.description}
                                    </Text>
                                    {issue.offendingText && (
                                      <Stack gap={4}>
                                        <Text
                                          variant="muted"
                                          style={{
                                            fontFamily: 'var(--mantine-font-family-monospace)',
                                            fontSize: 'var(--mantine-font-size-xs)',
                                            backgroundColor: 'var(--mantine-color-yellow-0)',
                                            padding: '2px 6px',
                                            borderRadius: 'var(--mantine-radius-sm)',
                                            wordBreak: 'break-word',
                                          }}
                                        >
                                          {issue.offendingText}
                                        </Text>
                                        <Button
                                          variant="subtle"
                                          color="yellow"
                                          size="xs"
                                          onClick={() => handleRemoveOffending(block.id, issue.offendingText!)}
                                          disabled={isChecking || isSaving}
                                          style={{ alignSelf: 'flex-start' }}
                                        >
                                          Remove
                                        </Button>
                                      </Stack>
                                    )}
                                  </Stack>
                                ))}
                              </Stack>
                            </Alert>
                          )}
                          <Group gap="xs">
                            <Button
                              variant="filled"
                              color="green"
                              size="xs"
                              onClick={() => handleCheckAndSave(block.id)}
                              loading={isChecking || isSaving}
                            >
                              {isChecking ? 'Checking...' : isSaving ? 'Saving...' : 'Check & Save'}
                            </Button>
                            {hasIssues && (
                              <Button
                                variant="default"
                                color="yellow"
                                size="xs"
                                onClick={() => handleSaveAnyway(block.id)}
                                disabled={isChecking}
                                loading={isSaving}
                              >
                                Save Anyway
                              </Button>
                            )}
                            <Button
                              variant="subtle"
                              color="gray"
                              size="xs"
                              onClick={handleCancelEdit}
                              disabled={isChecking || isSaving}
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
          const isChecking = checkingId === block.id
          const issues = issuesMap[block.id] ?? []
          const hasIssues = issues.length > 0
          return (
            <Fragment key={block.id}>
              <BlockCard
                block={{
                  ...block,
                  type: block.type as BlockType,
                }}
                selected={selectedIds.has(block.id)}
                isSaving={isSaving}
                onToggleSelect={toggleSelect}
                onToggleStatus={handleStatusChange}
                onOrderCommit={handleOrderBlur}
                onOpenEdit={id => handleEdit(id, block.body)}
                onDelete={setDeleteTargetId}
              />
              {isEditing && (
                <Paper p="md" withBorder radius="sm">
                  <Stack gap="sm">
                    <Textarea
                      value={editBody}
                      onChange={e => setEditBody(e.currentTarget.value)}
                      autosize
                      minRows={4}
                      maxRows={12}
                      size="sm"
                      disabled={isChecking || isSaving}
                    />
                    {hasIssues && (
                      <Alert
                        color="yellow"
                        variant="light"
                        radius="sm"
                        title="Safety check flagged this block"
                      >
                        <Stack gap="xs">
                          {issues.map((issue, i) => (
                            <Stack key={i} gap={4}>
                              <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
                                {issue.description}
                              </Text>
                              {issue.offendingText && (
                                <Stack gap={4}>
                                  <Text
                                    variant="muted"
                                    style={{
                                      fontFamily: 'var(--mantine-font-family-monospace)',
                                      fontSize: 'var(--mantine-font-size-xs)',
                                      backgroundColor: 'var(--mantine-color-yellow-0)',
                                      padding: '2px 6px',
                                      borderRadius: 'var(--mantine-radius-sm)',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {issue.offendingText}
                                  </Text>
                                  <Button
                                    variant="subtle"
                                    color="yellow"
                                    size="xs"
                                    onClick={() => handleRemoveOffending(block.id, issue.offendingText!)}
                                    disabled={isChecking || isSaving}
                                    style={{ alignSelf: 'flex-start' }}
                                  >
                                    Remove
                                  </Button>
                                </Stack>
                              )}
                            </Stack>
                          ))}
                        </Stack>
                      </Alert>
                    )}
                    <Group gap="xs">
                      <Button
                        variant="filled"
                        color="green"
                        size="xs"
                        onClick={() => handleCheckAndSave(block.id)}
                        loading={isChecking || isSaving}
                      >
                        {isChecking ? 'Checking...' : isSaving ? 'Saving...' : 'Check & Save'}
                      </Button>
                      {hasIssues && (
                        <Button
                          variant="default"
                          color="yellow"
                          size="xs"
                          onClick={() => handleSaveAnyway(block.id)}
                          disabled={isChecking}
                          loading={isSaving}
                        >
                          Save Anyway
                        </Button>
                      )}
                      <Button
                        variant="subtle"
                        color="gray"
                        size="xs"
                        onClick={handleCancelEdit}
                        disabled={isChecking || isSaving}
                      >
                        Cancel
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              )}
            </Fragment>
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
