import { getAdminClient } from '@/lib/supabase-admin'
import { Table, Badge, Center } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'

export const dynamic = 'force-dynamic'

const TYPE_COLORS: Record<string, string> = {
  identity: 'violet',
  knowledge: 'blue',
  guardrail: 'red',
  process: 'orange',
  escalation: 'yellow',
}

const TYPE_LABELS: Record<string, string> = {
  identity: 'Identity & Voice',
  knowledge: 'Knowledge',
  guardrail: 'Guardrail',
  process: 'Process',
  escalation: 'Escalation',
}

interface BlockRow {
  id: string
  title: string
  type: string
  is_default: boolean
  created_at: string
  topics: { name: string } | null
}

export default async function BlocksPage() {
  const supabase = getAdminClient()

  const { data: blocks, error } = await supabase
    .from('blocks')
    .select('id, title, type, is_default, created_at, topics(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[blocks] fetch error:', error.message)
  }

  const rows = (blocks as BlockRow[] | null) ?? []

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <Text variant="title">Blocks</Text>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {!rows.length ? (
          <Center h={200}>
            <Text variant="muted">No blocks yet.</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Topic</Table.Th>
                <Table.Th>Default</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((block) => (
                <Table.Tr key={block.id}>
                  <Table.Td>
                    <Text variant="label">{block.title}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={TYPE_COLORS[block.type] ?? 'gray'}
                      size="sm"
                      radius="sm"
                    >
                      {TYPE_LABELS[block.type] ?? block.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text variant="muted">{block.topics?.name ?? '—'}</Text>
                  </Table.Td>
                  <Table.Td>
                    {block.is_default && (
                      <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
                        ✓
                      </Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </div>
    </div>
  )
}
