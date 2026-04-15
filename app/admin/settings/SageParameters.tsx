'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button, Group, Paper, Skeleton, Stack, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Text } from '@/components/admin/primitives/Text'

interface SageParameter {
  id: string
  tenant_id: string
  key: string
  value: string
  label: string | null
  updated_at: string
}

interface PatchPayload {
  key: string
  value: string
  label: string
}

function slugifyKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'string'
  ) {
    return (body as { error: string }).error
  }
  return fallback
}

export function SageParameters() {
  const [parameters, setParameters] = useState<SageParameter[]>([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newValue, setNewValue] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchParameters = useCallback(async () => {
    console.log('[SageParameters] fetching parameters')
    try {
      const res = await fetch('/api/admin/sage-parameters')
      if (!res.ok) {
        console.error('[SageParameters] fetch failed:', res.status)
        notifications.show({
          color: 'red',
          title: 'Failed to load parameters',
          message: 'Could not load Sage parameters.',
        })
        return
      }
      const data: SageParameter[] = await res.json()
      console.log('[SageParameters] fetched parameters:', data.length)
      setParameters(data)
      const nextDrafts: Record<string, string> = {}
      for (const p of data) {
        nextDrafts[p.key] = p.value
      }
      setDrafts(nextDrafts)
    } catch (err) {
      console.error('[SageParameters] fetch request failed:', err)
      notifications.show({
        color: 'red',
        title: 'Network error',
        message: 'Could not reach the server.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchParameters()
  }, [fetchParameters])

  async function patchParameter(payload: PatchPayload): Promise<SageParameter> {
    console.log('[SageParameters] PATCH dispatch:', payload.key)
    const res = await fetch('/api/admin/sage-parameters', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body: unknown = await res.json().catch(() => null)
      const message = extractErrorMessage(body, 'Failed to save parameter.')
      console.error('[SageParameters] PATCH failed:', message)
      throw new Error(message)
    }
    const data: SageParameter = await res.json()
    console.log('[SageParameters] PATCH success:', data.key)
    return data
  }

  async function handleSave(param: SageParameter) {
    const value = drafts[param.key] ?? ''
    setSavingKey(param.key)
    try {
      const saved = await patchParameter({
        key: param.key,
        value,
        label: param.label ?? '',
      })
      setParameters(prev => prev.map(p => (p.key === saved.key ? saved : p)))
      setDrafts(prev => ({ ...prev, [saved.key]: saved.value }))
      notifications.show({
        color: 'green',
        title: 'Parameter saved',
        message: param.label ?? param.key,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save parameter.'
      notifications.show({
        color: 'red',
        title: 'Save failed',
        message,
      })
    } finally {
      setSavingKey(null)
    }
  }

  async function handleAdd() {
    const label = newLabel.trim()
    const value = newValue.trim()
    if (!label) {
      notifications.show({
        color: 'red',
        title: 'Label required',
        message: 'Enter a label for the new parameter.',
      })
      return
    }
    const key = slugifyKey(label)
    if (!key) {
      notifications.show({
        color: 'red',
        title: 'Invalid label',
        message: 'Label must contain at least one letter or number.',
      })
      return
    }
    console.log('[SageParameters] add dispatch, derived key:', key)
    setAdding(true)
    try {
      const saved = await patchParameter({ key, value, label })
      setParameters(prev => {
        const filtered = prev.filter(p => p.key !== saved.key)
        return [...filtered, saved].sort((a, b) => a.key.localeCompare(b.key))
      })
      setDrafts(prev => ({ ...prev, [saved.key]: saved.value }))
      setNewLabel('')
      setNewValue('')
      notifications.show({
        color: 'green',
        title: 'Parameter saved',
        message: label,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save parameter.'
      notifications.show({
        color: 'red',
        title: 'Add failed',
        message,
      })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Paper radius="sm" p="md" withBorder style={{ backgroundColor: 'transparent' }}>
      <Stack gap="md">
        {loading ? (
          <Stack gap="xs">
            <Skeleton height={40} radius="sm" />
            <Skeleton height={40} radius="sm" />
          </Stack>
        ) : parameters.length === 0 ? (
          <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
            No parameters saved yet. Add one below to get started.
          </Text>
        ) : (
          <Stack gap="sm">
            {parameters.map(param => {
              const draftValue = drafts[param.key] ?? ''
              const dirty = draftValue !== param.value
              const saving = savingKey === param.key
              return (
                <Group key={param.id} gap="xs" align="flex-end" wrap="wrap">
                  <TextInput
                    label={param.label && param.label.length > 0 ? param.label : param.key}
                    value={draftValue}
                    onChange={e =>
                      setDrafts(prev => ({ ...prev, [param.key]: e.currentTarget.value }))
                    }
                    size="sm"
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <Button
                    variant="filled"
                    color="green"
                    size="sm"
                    onClick={() => handleSave(param)}
                    disabled={!dirty || saving}
                    loading={saving}
                  >
                    Save
                  </Button>
                </Group>
              )
            })}
          </Stack>
        )}

        <Stack
          gap="sm"
          pt="sm"
          style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
        >
          <Text variant="label" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
            Add parameter
          </Text>
          <Stack gap="xs">
            <TextInput
              label="Label"
              value={newLabel}
              onChange={e => setNewLabel(e.currentTarget.value)}
              placeholder="e.g. Booking link"
              size="sm"
            />
            <TextInput
              label="Value"
              value={newValue}
              onChange={e => setNewValue(e.currentTarget.value)}
              placeholder="e.g. https://cal.com/your-handle"
              size="sm"
            />
            <Group gap="xs">
              <Button
                variant="filled"
                color="green"
                size="sm"
                onClick={handleAdd}
                loading={adding}
                disabled={newLabel.trim().length === 0}
              >
                Add
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}
