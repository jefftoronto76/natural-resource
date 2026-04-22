/**
 * Predicate for "this block has a meaningful, user-placed ordinal."
 *
 * The `blocks.order` column is a nullable integer. Both `null` and `0`
 * represent "unordered / default" — new blocks insert with null, and 0
 * is accepted as an equivalent sentinel for historical reasons. Any
 * positive integer is treated as an explicit placement.
 *
 * Consumers:
 * - /api/admin/prompt/compile/route.ts uses this to partition blocks
 *   into "ordered" (sorted ascending by value) and "unordered" (sorted
 *   by title ascending at the end of each type bucket).
 * - The Blocks admin page uses this to gate the per-type duplicate-
 *   order check so multiple blocks of the same type can coexist at
 *   0 / null without firing a false conflict.
 */
export function isOrdered(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
