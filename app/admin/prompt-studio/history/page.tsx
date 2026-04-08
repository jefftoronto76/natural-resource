import { getAdminClient } from '@/lib/supabase-admin'
import { Table, Badge, Stack, Loader, Center } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'green',
  active: 'blue',
  flagged: 'yellow',
}

interface SessionRow {
  id: string
  created_at: string
  status: string | null
  message_count: number | null
  block_id: string | null
  messages: { role: string; content: string }[] | null
  blocks: { title: string } | null
}

export default async function HistoryPage() {
  const supabase = getAdminClient()

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('id, created_at, status, message_count, block_id, messages, blocks(title)')
    .eq('session_type', 'composer')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[history] fetch error:', error.message)
  }

  const rows = (sessions as SessionRow[] | null) ?? []

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <Text variant="title">History</Text>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {!rows.length ? (
          <Center h={200}>
            <Text variant="muted">No composer sessions yet.</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Block</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Exchanges</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((session) => {
                const blockName = session.blocks?.title ?? session.block_id ?? '—'
                const exchanges = session.message_count ?? (Array.isArray(session.messages) ? session.messages.length : 0)
                const status = session.status ?? 'active'

                return (
                  <Table.Tr key={session.id}>
                    <Table.Td>
                      <Text variant="label">{blockName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)', fontSize: 'var(--mantine-font-size-xs)' }}>
                        {formatDate(session.created_at)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
                        {exchanges}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={STATUS_COLORS[status] ?? 'gray'}
                        size="sm"
                        radius="sm"
                      >
                        {status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        )}
      </div>
    </div>
  )
}
