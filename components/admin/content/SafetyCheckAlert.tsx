'use client'

import { Alert, Button, Stack } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'
import type { CheckIssue } from './useBlockEditForm'

export interface SafetyCheckAlertProps {
  issues: CheckIssue[]
  onRemoveOffending: (offendingText: string) => void
  disabled: boolean
}

/**
 * Presentational Alert for safety-check issues. Renders each issue's
 * description, the offending substring (monospace, yellow-tinted),
 * and a per-issue Remove button. Owns no state; the parent (via the
 * useBlockEditForm hook) owns `issues` and the remove handler.
 *
 * Returns null when there are no issues so the form doesn't need a
 * hasIssues conditional at the call site.
 */
export function SafetyCheckAlert({ issues, onRemoveOffending, disabled }: SafetyCheckAlertProps) {
  if (issues.length === 0) return null
  return (
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
                  onClick={() => onRemoveOffending(issue.offendingText!)}
                  disabled={disabled}
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
  )
}
