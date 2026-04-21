'use client'

import { useState } from 'react'
import { Button, Group, Stack, Textarea } from '@mantine/core'

export interface BlockEditFormBlock {
  id: string
  title: string
  body: string
}

export interface BlockEditFormProps {
  block: BlockEditFormBlock
  onSave: (draft: { body: string }) => Promise<void>
  onSaveAnyway: (draft: { body: string }) => Promise<void>
  onCancel: () => void
}

/**
 * The single source of truth for block edit logic. Owns the Textarea,
 * the draft state, and the Save/Cancel actions. Passed as a child to
 * both BlockEditDrawer (desktop) and BlockEditSheet (mobile) so the
 * form never duplicates between shells.
 *
 * Step 5 of 19: skeleton only — clean-path save and cancel. The
 * safety-check flow (Alert, Save Anyway, Remove-offending) lands in
 * Step 6 as a delta to this file. onSaveAnyway is in the prop
 * contract but unused until Step 6.
 */
export function BlockEditForm({ block, onSave, onCancel }: BlockEditFormProps) {
  const [draft, setDraft] = useState(block.body)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    console.log('[BlockEditForm] save dispatch', { blockId: block.id, bodyLength: draft.length })
    setSaving(true)
    try {
      await onSave({ body: draft })
      console.log('[BlockEditForm] save success', { blockId: block.id })
    } catch (err) {
      console.error('[BlockEditForm] save failed', { blockId: block.id, err })
    } finally {
      setSaving(false)
    }
  }

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
        disabled={saving}
        aria-label={`Edit body for ${block.title}`}
      />
      <Group gap="xs">
        <Button
          variant="filled"
          color="green"
          size="sm"
          onClick={handleSave}
          loading={saving}
        >
          Save
        </Button>
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </Group>
    </Stack>
  )
}
