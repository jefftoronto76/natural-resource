import { getAdminClient } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/get-auth-context'
import { Text } from '@/components/admin/primitives/Text'
import { PromptFullnessMeter } from '@/components/admin/primitives/PromptFullnessMeter'

export const dynamic = 'force-dynamic'

export default async function PromptStudioPromptPage() {
  let bodies: string[] = []
  try {
    const authCtx = await getAuthContext()
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('blocks')
      .select('body')
      .eq('tenant_id', authCtx.tenant_id)
      .eq('status', 'active')

    if (error) {
      console.error('[prompt] blocks fetch error:', error.message)
    } else {
      bodies = (data ?? []).map(b => b.body ?? '')
    }
  } catch (err) {
    console.error('[prompt] auth failed:', err instanceof Error ? err.message : err)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <Text variant="title">Prompt</Text>
      </div>
      <div className="p-4 sm:p-6">
        <PromptFullnessMeter bodies={bodies} />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <Text variant="muted">Coming soon.</Text>
      </div>
    </div>
  )
}
