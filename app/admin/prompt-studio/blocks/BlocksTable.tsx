'use client'

import { Table, Badge, Box, Center, Group, Paper, Stack } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'

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

export interface BlockRow {
  id: string
  title: string
  type: string
  is_default: boolean
  created_at: string
  topics: { name: string } | null
}

export function BlocksTable({ rows }: { rows: BlockRow[] }) {
  if (!rows.length) {
    return (
      <Center h={200}>
        <Text variant="muted">No blocks yet.</Text>
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
      </Box>

      {/* Mobile: Card stack */}
      <Stack gap="sm" hiddenFrom="md">
        {rows.map((block) => (
          <Paper key={block.id} p="md" withBorder radius="sm">
            <Group justify="space-between" mb={4}>
              <Badge
                variant="light"
                color={TYPE_COLORS[block.type] ?? 'gray'}
                size="sm"
                radius="sm"
              >
                {TYPE_LABELS[block.type] ?? block.type}
              </Badge>
              {block.is_default && (
                <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
                  ✓ Default
                </Text>
              )}
            </Group>
            <Text variant="label" style={{ marginTop: 4 }}>{block.title}</Text>
            <Text variant="muted">{block.topics?.name ?? '—'}</Text>
          </Paper>
        ))}
      </Stack>
    </>
  )
}
