import { auth } from '@clerk/nextjs/server'
import { getAdminClient } from './supabase-admin'

export interface AuthContext {
  owner_id: string
  tenant_id: string
}

/**
 * Resolves the current Clerk user to their Supabase owner_id and tenant_id.
 * Throws if the user is not authenticated or has no tenant assignment.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const { userId: clerkId } = await auth()
  console.log('[getAuthContext] clerk userId:', clerkId)
  if (!clerkId) {
    throw new Error('Unauthorized')
  }

  const supabase = getAdminClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single()

  if (userError || !user) {
    throw new Error('User not found')
  }

  const { data: tenantUser, error: tenantError } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (tenantError || !tenantUser) {
    throw new Error('Tenant not found')
  }

  return {
    owner_id: user.id,
    tenant_id: tenantUser.tenant_id,
  }
}
