'use client'

import {
  Button,
  Group,
  SegmentedControl,
  Text,
  TextInput,
} from '@mantine/core'
import {
  IconChevronsDown,
  IconChevronsUp,
  IconSearch,
} from '@tabler/icons-react'
import {
  BLOCK_TYPES,
  TYPE_COMPILE_ORDER,
  TYPE_LABELS,
  type BlockType,
} from '@/lib/blockTypes'
import type {
  StatusFilter,
  TypeFilter,
} from './useBlocksFilters'

export interface BlocksToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  typeFilter: TypeFilter
  onTypeFilterChange: (value: TypeFilter) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (value: StatusFilter) => void
  allExpanded: boolean
  onToggleExpandAll: () => void
  filteredCount: number
  totalCount: number
}

// Type filter options — derived from BLOCK_TYPES sorted by compile
// order so the toolbar UI matches the ordinal suffix on the row
// badges (GUARDRAIL 1st, IDENTITY 2nd, …). Single source of truth:
// TYPE_COMPILE_ORDER in @/lib/blockTypes.
const ORDERED_TYPES: BlockType[] = [...BLOCK_TYPES].sort(
  (a, b) => TYPE_COMPILE_ORDER[a] - TYPE_COMPILE_ORDER[b],
)

const TYPE_FILTER_DATA: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  ...ORDERED_TYPES.map(t => ({ value: t, label: TYPE_LABELS[t] })),
]

const STATUS_FILTER_DATA: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
]

/**
 * Desktop/tablet filter toolbar for the Blocks admin page.
 *
 * Pure presentational — owns no state, no fetches, no business logic.
 * Reads everything from props, fires callbacks. Mobile gets its own
 * filter UX via MobileBlocksView (PR 4); this component is intended
 * to render inside a <Box visibleFrom="md">.
 *
 * Observability: logs the three discrete user transactions (type
 * filter change, status filter change, expand-all toggle). Query
 * changes are NOT logged — per-keystroke console spam.
 */
export function BlocksToolbar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  allExpanded,
  onToggleExpandAll,
  filteredCount,
  totalCount,
}: BlocksToolbarProps) {
  function handleTypeChange(value: string) {
    const narrowed = value as TypeFilter
    console.log('[BlocksToolbar] type filter', { value: narrowed })
    onTypeFilterChange(narrowed)
  }

  function handleStatusChange(value: string) {
    const narrowed = value as StatusFilter
    console.log('[BlocksToolbar] status filter', { value: narrowed })
    onStatusFilterChange(narrowed)
  }

  function handleExpandToggle() {
    console.log('[BlocksToolbar] expand-all toggle', { allExpanded })
    onToggleExpandAll()
  }

  return (
    <Group justify="space-between" wrap="wrap" gap="sm" align="center">
      <TextInput
        value={query}
        onChange={e => onQueryChange(e.currentTarget.value)}
        placeholder="Search title or body"
        leftSection={<IconSearch size={14} />}
        size="sm"
        w={280}
        aria-label="Search blocks"
      />
      <Group gap="sm" wrap="wrap">
        <SegmentedControl
          data={TYPE_FILTER_DATA as { value: string; label: string }[]}
          value={typeFilter}
          onChange={handleTypeChange}
          size="xs"
          aria-label="Filter by type"
        />
        <SegmentedControl
          data={STATUS_FILTER_DATA as { value: string; label: string }[]}
          value={statusFilter}
          onChange={handleStatusChange}
          size="xs"
          aria-label="Filter by status"
        />
      </Group>
      <Group gap="sm" wrap="nowrap" align="center">
        <Text size="sm" c="dimmed" aria-live="polite">
          {filteredCount} / {totalCount}
        </Text>
        <Text size="sm" c="dimmed" aria-hidden>
          ·
        </Text>
        <Button
          variant="subtle"
          size="xs"
          onClick={handleExpandToggle}
          leftSection={
            allExpanded ? (
              <IconChevronsUp size={14} />
            ) : (
              <IconChevronsDown size={14} />
            )
          }
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </Button>
      </Group>
    </Group>
  )
}
