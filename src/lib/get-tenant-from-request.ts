import { getAdminClient } from './supabase-admin'

/**
 * Extracts the root domain from a Host header value, stripping subdomains.
 *
 * Examples:
 * - "app.jefflougheed.ca"     → "jefflougheed.ca"
 * - "www.jefflougheed.ca"     → "jefflougheed.ca"
 * - "jefflougheed.ca"         → "jefflougheed.ca"
 * - "jefflougheed.ca:3000"    → "jefflougheed.ca"
 * - "localhost"               → null (treated as dev)
 * - "localhost:3000"          → null
 * - "127.0.0.1"               → null
 *
 * For ccTLD-style hosts like "example.co.uk" this simple approach returns
 * "co.uk" which is wrong. For the current scope (all tenants use *.ca or
 * *.com) the last-two-parts rule is sufficient. Revisit with the PSL if a
 * tenant ever registers a multi-part ccTLD.
 */
function extractRootDomain(host: string | null): string | null {
  if (!host) return null

  // Strip port if present
  const withoutPort = host.split(':')[0].trim().toLowerCase()
  if (!withoutPort) return null

  // Local/dev hosts
  if (
    withoutPort === 'localhost' ||
    withoutPort.endsWith('.localhost') ||
    withoutPort === '127.0.0.1' ||
    withoutPort === '0.0.0.0' ||
    withoutPort.endsWith('.local')
  ) {
    return null
  }

  const parts = withoutPort.split('.')
  if (parts.length < 2) return null
  return parts.slice(-2).join('.')
}

/**
 * Resolves the tenant_id for an incoming public request based on its Host
 * header. Used by anonymous endpoints (e.g. the Sage public chat) where
 * there is no Clerk session to fall back on.
 *
 * Returns null if the host cannot be mapped — the caller should handle the
 * fallback (e.g. DEFAULT_SYSTEM_PROMPT).
 */
export async function getTenantFromRequest(req: Request): Promise<string | null> {
  const host = req.headers.get('host')
  const rootDomain = extractRootDomain(host)
  console.log('[getTenantFromRequest] host:', host, 'rootDomain:', rootDomain)

  if (!rootDomain) {
    console.log('[getTenantFromRequest] no resolvable root domain — returning null')
    return null
  }

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('domain', rootDomain)
    .maybeSingle()

  if (error) {
    console.error('[getTenantFromRequest] tenants lookup failed:', error.message)
    return null
  }

  if (!data) {
    console.log('[getTenantFromRequest] no tenant matched domain:', rootDomain)
    return null
  }

  console.log('[getTenantFromRequest] resolved tenant_id:', data.id)
  return data.id as string
}
