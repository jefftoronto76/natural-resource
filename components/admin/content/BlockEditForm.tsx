'use client'

import { useState } from 'react'
import { Alert, Button, Group, Stack, Textarea } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'

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

interface CheckIssue {
  description: string
  offendingText: string | null
}

interface CheckResult {
  ok: boolean
  issues: CheckIssue[]
}

/**
 * The single source of truth for block edit logic. Owns the Textarea,
 * the draft state, the safety-check flow, and the Save / Save Anyway /
 * Remove-offending / Cancel actions. Passed as a child to both
 * BlockEditDrawer (desktop) and BlockEditSheet (mobile) so the form
 * never duplicates between shells.
 *
 * Safety check runs on Save, hitting /api/admin/prompt/compile/check.
 * If the check flags issues, an Alert renders with each issue's
 * description, the offending text substring (monospace), and a per-
 * issue "Remove" button that strips that substring from the draft.
 * A "Save Anyway" button appears to bypass. The check fails open —
 * network / parsing errors resolve as clean so a broken checker
 * never blocks saves.
 */
export function BlockEditForm({ block, onSave, onSaveAnyway, onCancel }: BlockEditFormProps) {
  const [draft, setDraft] = useState(block.body)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [issues, setIssues] = useState<CheckIssue[]>([])

  const hasIssues = issues.length > 0
  const busy = checking || saving

  async function runSafetyCheck(body: string): Promise<CheckResult> {
    console.log('[BlockEditForm] safety check dispatch', { blockId: block.id })
    try {
      const res = await fetch('/api/admin/prompt/compile/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      if (!res.ok) {
        console.error('[BlockEditForm] safety check HTTP error', { status: res.status })
        return { ok: true, issues: [] }
      }
      const data: CheckResult = await res.json()
      console.log('[BlockEditForm] safety check result', {
        blockId: block.id,
        ok: data.ok,
        issueCount: data.issues?.length ?? 0,
      })
      return {
        ok: data.ok === true,
        issues: Array.isArray(data.issues) ? data.issues : [],
      }
    } catch (err) {
      console.error('[BlockEditForm] safety check failed', { blockId: block.id, err })
      // Fail open — don't block the save flow on a check error.
      return { ok: true, issues: [] }
    }
  }

  async function handleSave() {
    console.log('[BlockEditForm] save dispatch', { blockId: block.id, bodyLength: draft.length })
    setIssues([])
    setChecking(true)
    const result = await runSafetyCheck(draft)
    setChecking(false)

    if (!result.ok && result.issues.length > 0) {
      console.log('[BlockEditForm] save blocked by safety check', {
        blockId: block.id,
        count: result.issues.length,
      })
      setIssues(result.issues)
      return
    }

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

  async function handleSaveAnyway() {
    console.log('[BlockEditForm] save anyway dispatch', {
      blockId: block.id,
      bodyLength: draft.length,
    })
    setSaving(true)
    try {
      await onSaveAnyway({ body: draft })
      console.log('[BlockEditForm] save anyway success', { blockId: block.id })
      setIssues([])
    } catch (err) {
      console.error('[BlockEditForm] save anyway failed', { blockId: block.id, err })
    } finally {
      setSaving(false)
    }
  }

  function handleRemoveOffending(offendingText: string) {
    console.log('[BlockEditForm] remove offending', {
      blockId: block.id,
      length: offendingText.length,
    })
    setDraft(prev => prev.replace(offendingText, ''))
    setIssues(prev => prev.filter(i => i.offendingText !== offendingText))
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
        disabled={busy}
        aria-label={`Edit body for ${block.title}`}
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
                      onClick={() => handleRemoveOffending(issue.offendingText!)}
                      disabled={busy}
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
