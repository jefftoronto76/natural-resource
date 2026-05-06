import type { CSSProperties } from 'react'
import { getAdminClient } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/get-auth-context'
import { Box, Button, Center, Flex, Stack, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { Text } from '@/components/admin/primitives/Text'
import { BlocksTable, type BlockRow } from './BlocksTable'
import { PublishButton } from './PublishButton'

export const dynamic = 'force-dynamic'

// Inline-style supplements for layout primitives Mantine v7 doesn't
// expose as props on Flex/Stack/Box. Hoisted for readability and
// reuse between the auth-fail and main render branches.
//
// Long-term: AppShell handles flex-1 + overflow-auto naturally; revisit
// in a separate refactor session.
const HEADER_FRAME_STYLE: CSSProperties = {
  flexShrink: 0,
  borderBottom: '1px solid var(--mantine-color-gray-2)',
}

const SCROLL_AREA_STYLE: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
}

const FALLBACK_CONTENT_STYLE: CSSProperties = {
  flex: 1,
}

export default async function BlocksPage() {
  let tenantId: string
  try {
    const authCtx = await getAuthContext()
    tenantId = authCtx.tenant_id
  } catch {
    return (
      <Stack h="100%" gap={0}>
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          gap="sm"
          px={{ base: 16, sm: 24 }}
          py={{ base: 12, sm: 16 }}
          style={HEADER_FRAME_STYLE}
        >
          <Title order={1} fz="lg" fw={600}>
            Blocks
          </Title>
        </Flex>
        <Center p="md" style={FALLBACK_CONTENT_STYLE}>
          <Text variant="muted">Unable to load blocks.</Text>
        </Center>
      </Stack>
    )
  }

  const supabase = getAdminClient()

  const { data: blocks, error } = await supabase
    .from('blocks')
    .select('id, title, type, body, status, is_default, order, created_at, updated_at, topics(name), author:users!blocks_updated_by_fkey(name)')
    .eq('tenant_id', tenantId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[blocks] fetch error:', error.message)
  }

  const rows = (blocks as BlockRow[] | null) ?? []

  return (
    <Stack h="100%" gap={0}>
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        gap="md"
        px={{ base: 16, sm: 24 }}
        py={{ base: 12, sm: 16 }}
        style={HEADER_FRAME_STYLE}
      >
        <Stack gap={4}>
          <Title order={1} fz="lg" fw={600}>
            Blocks
          </Title>
          <Text variant="muted">
            Reusable prompt chunks — compiled into Sage&apos;s system prompt.
          </Text>
        </Stack>

        {/* Step 7 will replace this disabled placeholder with <NewBlockButton />. */}
        <Flex direction={{ base: 'column', sm: 'row' }} gap="sm" align="flex-start">
          <Button
            variant="default"
            disabled
            leftSection={<IconPlus size={14} />}
          >
            New block
          </Button>
          <PublishButton />
        </Flex>
      </Flex>

      <Box style={SCROLL_AREA_STYLE} p={{ base: 'md', sm: 'lg' }}>
        <BlocksTable rows={rows} />
      </Box>
    </Stack>
  )
}
