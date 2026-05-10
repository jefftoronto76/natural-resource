'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Table, Badge, Box, Center, Group, Paper, Stack } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'
import type { SessionStatus } from '@/lib/deriveSessionStatus'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const STATUS_COLORS: Record<SessionStatus, string> = {
  in_progress: 'green',
  active: 'yellow',
  abandoned: 'gray',
}

export interface ChatSession {
  id: string
  visitor_name: string | null
  messages: unknown[] | null
  status: string | null
  updated_at: string | null
  created_at: string
  derived_status: SessionStatus
}

export function InboundChatsTable({ rows }: { rows: ChatSession[] }) {
  const router = useRouter()

  if (!rows.length) {
    return (
      <Center h={200}>
        <Text variant="muted">No sessions yet.</Text>
      </Center>
    )
  }

  return (
    <>
      {/* Desktop: Table */}
      <Box visibleFrom="md">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Visitor</Table.Th>
              <Table.Th>Messages</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Last Active</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((session) => {
              const messageCount = Array.isArray(session.messages) ? session.messages.length : 0
              const status = session.derived_status
              return (
                <Table.Tr
                  key={session.id}
                  onClick={() => router.push(`/admin/sessions/${session.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td>
                    <Text variant="label" style={{ fontStyle: session.visitor_name ? 'normal' : 'italic' }}>
                      {session.visitor_name ?? 'Anonymous'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
                      {messageCount}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={STATUS_COLORS[status]}
                      size="sm"
                      radius="sm"
                    >
                      {status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)', fontSize: 'var(--mantine-font-size-xs)' }}>
                      {formatDate(session.updated_at ?? session.created_at)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Mobile: Card stack */}
      <Stack gap="sm" hiddenFrom="md">
        {rows.map((session) => {
          const messageCount = Array.isArray(session.messages) ? session.messages.length : 0
          const status = session.derived_status
          return (
            <Link
              key={session.id}
              href={`/admin/sessions/${session.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Paper p="md" withBorder radius="sm">
                <Group justify="space-between" mb={4}>
                  <Text variant="label" style={{ fontStyle: session.visitor_name ? 'normal' : 'italic' }}>
                    {session.visitor_name ?? 'Anonymous'}
                  </Text>
                  <Badge
                    variant="light"
                    color={STATUS_COLORS[status]}
                    size="sm"
                    radius="sm"
                  >
                    {status}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
                    {messageCount} messages
                  </Text>
                  <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)', fontSize: 'var(--mantine-font-size-xs)' }}>
                    {formatDate(session.updated_at ?? session.created_at)}
                  </Text>
                </Group>
              </Paper>
            </Link>
          )
        })}
      </Stack>
    </>
  )
}
