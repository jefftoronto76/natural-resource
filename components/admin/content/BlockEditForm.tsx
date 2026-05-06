'use client'

import { useState } from 'react'
import { Button, Group, Select, Stack, Textarea, TextInput } from '@mantine/core'
import { SafetyCheckAlert } from './SafetyCheckAlert'
import {
  useBlockEditForm,
  type BlockEditFormBlock,
} from './useBlockEditForm'
import {
  BLOCK_TYPES,
  TYPE_COMPILE_ORDER,
  TYPE_LABELS,
  type BlockType,
} from '@/lib/blockTypes'

export type { BlockEditFormBlock }

export interface Topic {
  id: string
  name: string
  type: string
}

export interface NewBlockDraft {
  body: string
  title: string
  type: BlockType
  topic_id: string
}

type EditModeProps = {
  mode?: 'edit'
  block: BlockEditFormBlock
  topics?: undefined
  onSave: (draft: { body: string }) => Promise<void>
  onSaveAnyway: (draft: { body: string }) => Promise<void>
  onCancel: () => void
}

type NewModeProps = {
  mode: 'new'
  block?: undefined
  topics: Topic[]
  onSave: (draft: NewBlockDraft) => Promise<void>
  onSaveAnyway: (draft: NewBlockDraft) => Promise<void>
  onCancel: () => void
}

export type BlockEditFormProps = EditModeProps | NewModeProps

// Type Select options — sorted by compile order so the dropdown matches
// the order convention used elsewhere in the admin (badges, meter).
const TYPE_SELECT_DATA = [...BLOCK_TYPES]
  .sort((a, b) => TYPE_COMPILE_ORDER[a] - TYPE_COMPILE_ORDER[b])
  .map(t => ({ value: t, label: TYPE_LABELS[t] }))

interface FieldErrors {
  title?: string
  type?: string
  topic_id?: string
  body?: string
}

/**
 * Block edit/create form. Two modes via a discriminated union prop:
 *
 * - mode='edit' (default): existing-row editing. Renders only the body
 *   Textarea; metadata stays as-is on the row. Save callback signature
 *   is { body: string }. Backward-compatible with all Phase 1 / PR 1
 *   callers — `mode` may be omitted entirely.
 *
 * - mode='new': new-block creation. Renders title/type/topic selects
 *   above the body Textarea. All four fields required client-side
 *   before the safety check runs. Save callback signature widens to
 *   NewBlockDraft.
 *
 * The hook (useBlockEditForm) only owns body + safety-check + saving
 * state. New-mode metadata (title/type/topic_id) lives as local state
 * here, and is bridged into the hook's narrower onSave callbacks so
 * the safety-check flow is shared between modes.
 *
 * Cancel is handled directly (no hook state) — same as before.
 */
export function BlockEditForm(props: BlockEditFormProps) {
  const isNew = props.mode === 'new'

  // 'new' mode local state — unused in edit mode but always declared
  // for hook order stability.
  const [title, setTitle] = useState('')
  const [type, setType] = useState<BlockType | ''>('')
  const [topicId, setTopicId] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Bridge the parent's wider new-mode callback through to the hook's
  // narrower body-only signature, adding title/type/topic_id from
  // local state at dispatch time.
  const hookCallbacks = isNew
    ? {
        onSave: async ({ body }: { body: string }) => {
          await (props as NewModeProps).onSave({
            body,
            title,
            type: type as BlockType,
            topic_id: topicId,
          })
        },
        onSaveAnyway: async ({ body }: { body: string }) => {
          await (props as NewModeProps).onSaveAnyway({
            body,
            title,
            type: type as BlockType,
            topic_id: topicId,
          })
        },
      }
    : {
        onSave: (props as EditModeProps).onSave,
        onSaveAnyway: (props as EditModeProps).onSaveAnyway,
      }

  const hookBlock = isNew ? null : (props as EditModeProps).block

  const {
    draft,
    setDraft,
    issues,
    checking,
    saving,
    onSave: hookOnSave,
    onSaveAnyway: hookOnSaveAnyway,
    onRemoveOffending,
  } = useBlockEditForm(hookBlock, hookCallbacks)

  const busy = checking || saving
  const hasIssues = issues.length > 0

  function validateNewMode(): boolean {
    if (!isNew) return true
    const errors: FieldErrors = {}
    if (!title.trim()) errors.title = 'Title is required'
    if (!type) errors.type = 'Type is required'
    if (!topicId) errors.topic_id = 'Topic is required'
    if (!draft.trim()) errors.body = 'Body is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!validateNewMode()) return
    await hookOnSave()
  }

  async function handleSubmitAnyway() {
    if (!validateNewMode()) return
    await hookOnSaveAnyway()
  }

  function handleCancel() {
    console.log('[BlockEditForm] cancel', {
      mode: isNew ? 'new' : 'edit',
      blockId: hookBlock?.id ?? 'new',
    })
    props.onCancel()
  }

  // Field setters that clear their own error on edit (responsive feedback).
  function handleTitleChange(value: string) {
    setTitle(value)
    if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: undefined })
  }
  function handleTypeChange(value: string | null) {
    setType((value ?? '') as BlockType | '')
    if (fieldErrors.type) setFieldErrors({ ...fieldErrors, type: undefined })
  }
  function handleTopicChange(value: string | null) {
    setTopicId(value ?? '')
    if (fieldErrors.topic_id) setFieldErrors({ ...fieldErrors, topic_id: undefined })
  }
  function handleBodyChange(value: string) {
    setDraft(value)
    if (fieldErrors.body) setFieldErrors({ ...fieldErrors, body: undefined })
  }

  const submitLabel = isNew ? 'Create block' : 'Check & Save'
  const savingLabel = isNew ? 'Creating...' : 'Saving...'

  return (
    <Stack gap="sm">
      {isNew && (
        <>
          <TextInput
            label="Title"
            placeholder="A short, descriptive title"
            required
            value={title}
            onChange={e => handleTitleChange(e.currentTarget.value)}
            error={fieldErrors.title}
            disabled={busy}
          />
          <Select
            label="Type"
            placeholder="Select a type"
            required
            data={TYPE_SELECT_DATA}
            value={type || null}
            onChange={handleTypeChange}
            error={fieldErrors.type}
            disabled={busy}
          />
          <Select
            label="Topic"
            placeholder="Select a topic"
            required
            data={(props as NewModeProps).topics.map(t => ({
              value: t.id,
              label: t.name,
            }))}
            value={topicId || null}
            onChange={handleTopicChange}
            error={fieldErrors.topic_id}
            disabled={busy}
            searchable
          />
        </>
      )}
      <Textarea
        label={isNew ? 'Body' : undefined}
        value={draft}
        onChange={e => handleBodyChange(e.currentTarget.value)}
        autosize
        minRows={6}
        maxRows={20}
        size="sm"
        disabled={busy}
        required={isNew}
        error={isNew ? fieldErrors.body : undefined}
        aria-label={
          isNew
            ? 'New block body'
            : `Edit body for ${(props as EditModeProps).block.title}`
        }
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
          onClick={handleSubmit}
          loading={busy}
        >
          {checking ? 'Checking...' : saving ? savingLabel : submitLabel}
        </Button>
        {hasIssues && (
          <Button
            variant="default"
            color="yellow"
            size="sm"
            onClick={handleSubmitAnyway}
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
