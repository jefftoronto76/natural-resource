import { useState } from 'react'

export interface BlockEditFormBlock {
  id: string
  title: string
  body: string
}

export interface CheckIssue {
  description: string
  offendingText: string | null
}

interface CheckResult {
  ok: boolean
  issues: CheckIssue[]
}

export interface UseBlockEditFormCallbacks {
  onSave: (draft: { body: string }) => Promise<void>
  onSaveAnyway: (draft: { body: string }) => Promise<void>
}

export interface UseBlockEditFormReturn {
  draft: string
  setDraft: (value: string) => void
  issues: CheckIssue[]
  checking: boolean
  saving: boolean
  onSave: () => Promise<void>
  onSaveAnyway: () => Promise<void>
  onRemoveOffending: (offendingText: string) => void
}

async function runSafetyCheck(blockId: string, body: string): Promise<CheckResult> {
  console.log('[BlockEditForm] safety check dispatch', { blockId })
  try {
    const res = await fetch('/api/admin/prompt/compile/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    if (!res.ok) {
      console.error('[BlockEditForm] safety check HTTP error', { blockId, status: res.status })
      return { ok: true, issues: [] }
    }
    const data: CheckResult = await res.json()
    console.log('[BlockEditForm] safety check result', {
      blockId,
      ok: data.ok,
      issueCount: data.issues?.length ?? 0,
    })
    return {
      ok: data.ok === true,
      issues: Array.isArray(data.issues) ? data.issues : [],
    }
  } catch (err) {
    console.error('[BlockEditForm] safety check failed', { blockId, err })
    // Fail open — don't block the save flow on a check error.
    return { ok: true, issues: [] }
  }
}

/**
 * State machine for the block edit form. Owns the draft, the safety-
 * check flow, and the save / save-anyway / remove-offending handlers.
 * BlockEditForm.tsx is the thin shell around this hook; unit tests
 * target the hook directly so the form shell can stay presentational.
 *
 * Parent save callbacks come in via the `callbacks` argument; the
 * hook returns its own wrapped `onSave` / `onSaveAnyway` that combine
 * the safety check with the parent's save contract.
 */
export function useBlockEditForm(
  block: BlockEditFormBlock,
  callbacks: UseBlockEditFormCallbacks,
): UseBlockEditFormReturn {
  const [draft, setDraft] = useState(block.body)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [issues, setIssues] = useState<CheckIssue[]>([])

  async function onSave() {
    console.log('[BlockEditForm] save dispatch', { blockId: block.id, bodyLength: draft.length })
    setIssues([])
    setChecking(true)
    const result = await runSafetyCheck(block.id, draft)
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
      await callbacks.onSave({ body: draft })
      console.log('[BlockEditForm] save success', { blockId: block.id })
    } catch (err) {
      console.error('[BlockEditForm] save failed', { blockId: block.id, err })
    } finally {
      setSaving(false)
    }
  }

  async function onSaveAnyway() {
    console.log('[BlockEditForm] save anyway dispatch', {
      blockId: block.id,
      bodyLength: draft.length,
    })
    setSaving(true)
    try {
      await callbacks.onSaveAnyway({ body: draft })
      console.log('[BlockEditForm] save anyway success', { blockId: block.id })
      setIssues([])
    } catch (err) {
      console.error('[BlockEditForm] save anyway failed', { blockId: block.id, err })
    } finally {
      setSaving(false)
    }
  }

  function onRemoveOffending(offendingText: string) {
    console.log('[BlockEditForm] remove offending', {
      blockId: block.id,
      length: offendingText.length,
    })
    setDraft(prev => prev.replace(offendingText, ''))
    setIssues(prev => prev.filter(i => i.offendingText !== offendingText))
  }

  return {
    draft,
    setDraft,
    issues,
    checking,
    saving,
    onSave,
    onSaveAnyway,
    onRemoveOffending,
  }
}
