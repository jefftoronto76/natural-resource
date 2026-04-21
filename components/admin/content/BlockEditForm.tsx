'use client'

import { Button, Group, Stack, Textarea } from '@mantine/core'
import { SafetyCheckAlert } from './SafetyCheckAlert'
import {
  useBlockEditForm,
  type BlockEditFormBlock,
} from './useBlockEditForm'

export type { BlockEditFormBlock }

export interface BlockEditFormProps {
  block: BlockEditFormBlock
  onSave: (draft: { body: string }) => Promise<void>
  onSaveAnyway: (draft: { body: string }) => Promise<void>
  onCancel: () => void
}

/**
 * Thin presentational shell around the useBlockEditForm hook. All
 * state, safety-check orchestration, and save/cancel logging lives in
 * the hook; this component wires hook return values into Mantine
 * inputs and buttons. Passed as a child to BlockEditDrawer / Sheet —
 * the shells don't know about state, this form doesn't know about
 * Drawer chrome.
 *
 * Cancel is handled directly here (not via the hook) because it needs
 * no state — just a log + parent callback.
 */
export function BlockEditForm({ block, onSave, onSaveAnyway, onCancel }: BlockEditFormProps) {
  const {
    draft,
    setDraft,
    issues,
    checking,
    saving,
    onSave: handleSave,
    onSaveAnyway: handleSaveAnyway,
    onRemoveOffending,
  } = useBlockEditForm(block, { onSave, onSaveAnyway })

  const busy = checking || saving
  const hasIssues = issues.length > 0

  function handleCancel() {
    console.log('[BlockEditForm] cancel', { blockId: block.id })
    onCancel()
  }

  return (
    <Stack gap="sm">
      <Textarea
        value={draft}
        onChange={e => setDraft(e.currentTarget.value)}
        autosize
        minRows={6}
        maxRows={20}
        size="sm"
        disabled={busy}
        aria-label={`Edit body for ${block.title}`}
      />
      <SafetyCheckAlert
        issues={issues}
        onRemoveOffending={onRemoveOffending}
        disabled={busy}
      />
      <Group gap="xs">
        <Button
          variant="filled"
          color="green"
          size="sm"
          onClick={handleSave}
          loading={busy}
        >
          {checking ? 'Checking...' : saving ? 'Saving...' : 'Check & Save'}
        </Button>
        {hasIssues && (
          <Button
            variant="default"
            color="yellow"
            size="sm"
            onClick={handleSaveAnyway}
            disabled={checking}
            loading={saving}
          >
            Save Anyway
          </Button>
        )}
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          onClick={handleCancel}
          disabled={busy}
        >
          Cancel
        </Button>
      </Group>
    </Stack>
  )
}
