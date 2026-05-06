'use client'

import { useState } from 'react'
import {
  Table,
  Box,
  Center,
  Group,
  Stack,
  Modal,
  Button,
  Checkbox,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Text } from '@/components/admin/primitives/Text'
import { SegmentedTokenMeter } from '@/components/admin/content/SegmentedTokenMeter'
import { BulkActionsBar } from '@/components/admin/content/BulkActionsBar'
import { BlockRow as DesktopBlockRow } from '@/components/admin/content/BlockRow'
import { BlockCard } from '@/components/admin/content/BlockCard'
import { BlockEditDrawer } from '@/components/admin/content/BlockEditDrawer'
import { BlockEditSheet } from '@/components/admin/content/BlockEditSheet'
import { BlockEditForm } from '@/components/admin/content/BlockEditForm'
import { BlocksToolbar } from '@/components/admin/content/BlocksToolbar'
import { useBlocksFilters } from '@/components/admin/content/useBlocksFilters'
import type { BlockType } from '@/lib/blockTypes'
import { isOrdered } from '@/lib/blockOrder'

type BlockStatus = 'active' | 'disabled' | 'deleted'

export interface BlockRow {
  id: string
  title: string
  type: string
  body: string
  status: BlockStatus
  is_default: boolean
  order: number | null
  created_at: string
  updated_at: string
  topics: { name: string } | null
  author: { name: string } | null
}

export function BlocksTable({ rows }: { rows: BlockRow[] }) {
  const [items, setItems] = useState<BlockRow[]>(rows)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkInFlight, setBulkInFlight] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // URL-synced filter state — query/type/status come from ?q=, ?type=,
  // ?status=. Filtering below uses these values; the toolbar consumes
  // them for controlled inputs.
  const {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
  } = useBlocksFilters()

  // useMediaQuery returns undefined on first render (SSR) and true/false
  // after mount. Treat undefined as "not mobile" so the drawer is the
  // first-paint default. Mobile visitors see a brief flash of the drawer
  // before it swaps to the sheet on hydration — acceptable trade.
  const isMobile = useMediaQuery('(max-width: 48em)') ?? false
  const EditContainer = isMobile ? BlockEditSheet : BlockEditDrawer

  const editingBlock = editingId
    ? items.find(b => b.id === editingId) ?? null
    : null

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedCount = selectedIds.size

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // allSelected / someSelected / toggleSelectAll are defined below,
  // after `filtered` is derived — select-all is scoped to the
  // currently-visible (filtered) set, not the full items list.

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

  function handleEdit(id: string) {
    setEditingId(id)
  }

  function handleCancelEdit() {
    setEditingId(null)
  }

  // Shared PATCH logic for both save paths from BlockEditForm's hook.
  // Throws on failure so the hook's try/catch logs it as a failure
  // rather than a silent success (useBlockEditForm awaits this callback
  // and treats a resolved promise as "saved ok").
  async function persistBody(body: string): Promise<void> {
    if (!editingId) return
    console.log('[BlocksTable] body PATCH dispatch:', { id: editingId })
    const ok = await patchBlock(editingId, { body })
    if (!ok) {
      console.error('[BlocksTable] body PATCH failed:', { id: editingId })
      throw new Error('Save failed')
    }
    console.log('[BlocksTable] body PATCH success:', { id: editingId })
    setItems(prev => prev.map(b => (b.id === editingId ? { ...b, body } : b)))
    setEditingId(null)
  }

  async function handleFormSave({ body }: { body: string }) {
    await persistBody(body)
  }

  async function handleFormSaveAnyway({ body }: { body: string }) {
    await persistBody(body)
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

  // View-level filter. Runs synchronously on every render — `query` is
  // local to useBlocksFilters (instant keystroke feedback), and the
  // three filter guards short-circuit in cheapest-first order. The
  // meter above is intentionally NOT filtered; it measures reality,
  // not the current view.
  const filtered = items.filter(b => {
    if (typeFilter !== 'all' && b.type !== typeFilter) return false
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      const hay = `${b.title} ${b.body ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  // Select-all is scoped to the currently-visible (filtered) set.
  // Bulk actions still operate on all selectedIds — so selections
  // made outside the current filter persist when filters change.
  const filteredSelectedCount = filtered.reduce(
    (n, b) => (selectedIds.has(b.id) ? n + 1 : n),
    0,
  )
  const allSelected =
    filtered.length > 0 && filteredSelectedCount === filtered.length
  const someSelected =
    filteredSelectedCount > 0 && filteredSelectedCount < filtered.length

  function toggleSelectAll() {
    console.log('[BlocksTable] toggle select-all (filtered)', {
      filteredCount: filtered.length,
      filteredSelectedCount,
    })
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (filteredSelectedCount > 0) {
        // Any visible selection → clear ALL visible (both full and partial).
        for (const b of filtered) next.delete(b.id)
      } else {
        // None visible selected → select all visible.
        for (const b of filtered) next.add(b.id)
      }
      return next
    })
  }

  // Expand-all / Collapse-all operates on the currently-filtered set.
  // "Expand all" in a filter context means "expand everything I can
  // see." Collapse wipes the expanded set entirely (no point keeping
  // hidden rows expanded).
  const allExpanded =
    filtered.length > 0 && filtered.every(b => expandedIds.has(b.id))

  function handleExpandAll() {
    console.log('[BlocksTable] expand all', { count: filtered.length })
    setExpandedIds(new Set(filtered.map(b => b.id)))
  }

  function handleCollapseAll() {
    console.log('[BlocksTable] collapse all')
    setExpandedIds(new Set())
  }

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

      {items.length > 0 && (
        <>
          {/* Filter toolbar — visible at all viewports. The original PR 1
              design gated this with visibleFrom="md" pending a separate
              mobile filter UX (overlay + chip row) planned for the
              originally-scoped PR 4. That PR 4 was cancelled when the
              redesign rescoped to page rework, so the gate is removed.
              Step 9 of the rework swaps the SegmentedControls for
              Chip.Group, which wraps cleanly at narrow viewports. */}
          <Box mb="md">
            <BlocksToolbar
              query={query}
              onQueryChange={setQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              allExpanded={allExpanded}
              onToggleExpandAll={
                allExpanded ? handleCollapseAll : handleExpandAll
              }
              filteredCount={filtered.length}
              totalCount={items.length}
            />
          </Box>

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
                  <Table.Th style={{ width: 90 }}>Order</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map(block => (
                  <DesktopBlockRow
                    key={block.id}
                    block={{ ...block, type: block.type as BlockType }}
                    selected={selectedIds.has(block.id)}
                    isSaving={savingId === block.id}
                    isExpanded={expandedIds.has(block.id)}
                    onToggleSelect={toggleSelect}
                    onToggleStatus={handleStatusChange}
                    onOrderCommit={handleOrderBlur}
                    onEdit={handleEdit}
                    onDelete={setDeleteTargetId}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Box>

          {/* Mobile: Card stack */}
          <Stack gap="sm" hiddenFrom="md">
            {filtered.map(block => (
              <BlockCard
                key={block.id}
                block={{ ...block, type: block.type as BlockType }}
                selected={selectedIds.has(block.id)}
                isSaving={savingId === block.id}
                onToggleSelect={toggleSelect}
                onToggleStatus={handleStatusChange}
                onOrderCommit={handleOrderBlur}
                onOpenEdit={handleEdit}
                onDelete={setDeleteTargetId}
              />
            ))}
          </Stack>
        </>
      )}

      {/* Edit surface — Drawer on desktop (≥ md), bottom Sheet on mobile (< md).
          Both render <BlockEditForm> as their only child; form owns all
          save/safety-check state via useBlockEditForm. */}
      <EditContainer
        opened={editingBlock !== null}
        onClose={handleCancelEdit}
        title={editingBlock ? `Edit: ${editingBlock.title}` : undefined}
      >
        {editingBlock && (
          <BlockEditForm
            block={{
              id: editingBlock.id,
              title: editingBlock.title,
              body: editingBlock.body,
            }}
            onSave={handleFormSave}
            onSaveAnyway={handleFormSaveAnyway}
            onCancel={handleCancelEdit}
          />
        )}
      </EditContainer>

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
