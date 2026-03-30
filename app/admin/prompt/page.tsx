import { getAdminClient } from '@/lib/supabase-admin'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/sage-prompt'
import { PromptEditor } from '@/components/PromptEditor'

export const dynamic = 'force-dynamic'

export default async function PromptPage() {
  const supabase = getAdminClient()

  const { data } = await supabase
    .from('master_prompt')
    .select('content, version')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  const initialPrompt = data?.content ?? DEFAULT_SYSTEM_PROMPT
  const initialVersion = data?.version ?? 0

  return <PromptEditor initialPrompt={initialPrompt} initialVersion={initialVersion} />
}
