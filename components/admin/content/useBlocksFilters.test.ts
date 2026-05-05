import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBlocksFilters } from './useBlocksFilters'

// Hoisted mock state — vi.hoisted runs before vi.mock factories so the
// mock can capture references that survive across tests. beforeEach
// resets the contents.
const navState = vi.hoisted(() => ({
  pathname: '/admin/prompt-studio/blocks',
  searchParams: new URLSearchParams(),
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navState.replace }),
  usePathname: () => navState.pathname,
  useSearchParams: () => navState.searchParams,
}))

describe('useBlocksFilters', () => {
  beforeEach(() => {
    navState.searchParams = new URLSearchParams()
    navState.replace.mockReset()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('1. defaults when URL is empty', () => {
    const { result } = renderHook(() => useBlocksFilters())
    expect(result.current.query).toBe('')
    expect(result.current.typeFilter).toBe('all')
    expect(result.current.statusFilter).toBe('all')
  })

  it('2. reads initial state from URL', () => {
    navState.searchParams = new URLSearchParams(
      'q=hello&type=guardrail&status=disabled',
    )
    const { result } = renderHook(() => useBlocksFilters())
    expect(result.current.query).toBe('hello')
    expect(result.current.typeFilter).toBe('guardrail')
    expect(result.current.statusFilter).toBe('disabled')
  })

  it('3. setQuery updates local state synchronously', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useBlocksFilters())
    act(() => result.current.setQuery('foo'))
    expect(result.current.query).toBe('foo')
  })

  it('4. setQuery writes URL after 200ms debounce', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useBlocksFilters())

    act(() => result.current.setQuery('foo'))
    expect(navState.replace).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(navState.replace).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(navState.replace).toHaveBeenCalledWith(
      '/admin/prompt-studio/blocks?q=foo',
      { scroll: false },
    )
  })

  it('5. setTypeFilter writes URL immediately (no debounce)', () => {
    const { result } = renderHook(() => useBlocksFilters())
    act(() => result.current.setTypeFilter('guardrail'))
    expect(navState.replace).toHaveBeenCalledWith(
      '/admin/prompt-studio/blocks?type=guardrail',
      { scroll: false },
    )
  })

  it('6. setting type to "all" removes the param', () => {
    navState.searchParams = new URLSearchParams('q=hello&type=guardrail')
    const { result } = renderHook(() => useBlocksFilters())
    act(() => result.current.setTypeFilter('all'))
    expect(navState.replace).toHaveBeenCalledWith(
      '/admin/prompt-studio/blocks?q=hello',
      { scroll: false },
    )
  })

  it('7. setQuery to empty string removes ?q= after debounce', () => {
    vi.useFakeTimers()
    navState.searchParams = new URLSearchParams('q=hello&type=guardrail')
    const { result } = renderHook(() => useBlocksFilters())

    act(() => result.current.setQuery(''))
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(navState.replace).toHaveBeenCalledWith(
      '/admin/prompt-studio/blocks?type=guardrail',
      { scroll: false },
    )
  })
})
