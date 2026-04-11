'use client'

import { Table, Badge, Box, Center, Group, Paper, Stack } from '@mantine/core'
import { Text } from '@/components/admin/primitives/Text'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatSize(raw: string | null): string {
  if (!raw) return '—'
  const len = raw.length
  if (len < 1000) return `${len} chars`
  return `${(len / 1000).toFixed(1)}k chars`
}

export interface AssetRow {
  id: string
  name: string
  raw: string | null
  storage_path: string | null
  created_at: string
}

export function AssetsTable({ rows }: { rows: AssetRow[] }) {
  if (!rows.length) {
    return (
      <Center h={200}>
        <Text variant="muted">No assets yet.</Text>
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
              <Table.Th>File name</Table.Th>
              <Table.Th>Date uploaded</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((asset) => (
              <Table.Tr key={asset.id}>
                <Table.Td>
                  <Text variant="label">{asset.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)', fontSize: 'var(--mantine-font-size-xs)' }}>
                    {formatDate(asset.created_at)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
                    {formatSize(asset.raw)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={asset.storage_path ? 'green' : 'gray'}
                    size="sm"
                    radius="sm"
                  >
                    {asset.storage_path ? 'Stored' : 'Text only'}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Mobile: Card stack */}
      <Stack gap="sm" hiddenFrom="md">
        {rows.map((asset) => (
          <Paper key={asset.id} p="md" withBorder radius="sm">
            <Group justify="space-between" mb={4}>
              <Text variant="label">{asset.name}</Text>
              <Badge
                variant="light"
                color={asset.storage_path ? 'green' : 'gray'}
                size="sm"
                radius="sm"
              >
                {asset.storage_path ? 'Stored' : 'Text only'}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
                {formatSize(asset.raw)}
              </Text>
              <Text variant="muted" style={{ fontFamily: 'var(--mantine-font-family-monospace)', fontSize: 'var(--mantine-font-size-xs)' }}>
                {formatDate(asset.created_at)}
              </Text>
            </Group>
          </Paper>
        ))}
      </Stack>
    </>
  )
}
