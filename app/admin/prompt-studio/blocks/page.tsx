import { getAdminClient } from '@/lib/supabase-admin'
import { Text } from '@/components/admin/primitives/Text'
import { BlocksTable, type BlockRow } from './BlocksTable'

export const dynamic = 'force-dynamic'

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
        <BlocksTable rows={rows} />
      </div>
    </div>
  )
}
