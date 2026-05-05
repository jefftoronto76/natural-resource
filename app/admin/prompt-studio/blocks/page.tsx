import { getAdminClient } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/get-auth-context'
import { Text } from '@/components/admin/primitives/Text'
import { BlocksTable, type BlockRow } from './BlocksTable'
import { PublishButton } from './PublishButton'

export const dynamic = 'force-dynamic'

export default async function BlocksPage() {
  let tenantId: string
  try {
    const authCtx = await getAuthContext()
    tenantId = authCtx.tenant_id
  } catch {
    return (
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <Text variant="title">Blocks</Text>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <Text variant="muted">Unable to load blocks.</Text>
        </div>
      </div>
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
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <Text variant="title">Blocks</Text>
        <PublishButton />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <BlocksTable rows={rows} />
      </div>
    </div>
  )
}
