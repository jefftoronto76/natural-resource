import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBlockEditForm, type CheckIssue } from './useBlockEditForm'

const block = { id: 'b-1', title: 'Test block', body: 'initial body' }

function mockFetchOnce(response: { ok: boolean; issues: CheckIssue[] }, httpOk = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: httpOk,
      status: httpOk ? 200 : 500,
      json: async () => response,
    } as Response),
  )
}

describe('useBlockEditForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('initializes draft from block.body and idle flags', () => {
    const { result } = renderHook(() =>
      useBlockEditForm(block, { onSave: vi.fn(), onSaveAnyway: vi.fn() }),
    )
    expect(result.current.draft).toBe('initial body')
    expect(result.current.checking).toBe(false)
    expect(result.current.saving).toBe(false)
    expect(result.current.issues).toEqual([])
  })

  it('setDraft updates the draft value', () => {
    const { result } = renderHook(() =>
      useBlockEditForm(block, { onSave: vi.fn(), onSaveAnyway: vi.fn() }),
    )
    act(() => result.current.setDraft('next body'))
    expect(result.current.draft).toBe('next body')
  })

  it('clean save: runs safety check, then calls parent onSave with draft', async () => {
    mockFetchOnce({ ok: true, issues: [] })
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useBlockEditForm(block, { onSave, onSaveAnyway: vi.fn() }),
    )

    await act(() => result.current.onSave())

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/prompt/compile/check',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ body: 'initial body' }),
      }),
    )
    expect(onSave).toHaveBeenCalledWith({ body: 'initial body' })
    expect(result.current.issues).toEqual([])
    expect(result.current.checking).toBe(false)
    expect(result.current.saving).toBe(false)
  })

  it('blocked save: issues returned — sets issues, does NOT call parent onSave', async () => {
    const issues: CheckIssue[] = [
      { description: 'Potentially harmful instruction', offendingText: 'bad phrase' },
    ]
    mockFetchOnce({ ok: false, issues })
    const onSave = vi.fn()
    const { result } = renderHook(() =>
      useBlockEditForm(block, { onSave, onSaveAnyway: vi.fn() }),
    )

    await act(() => result.current.onSave())

    expect(onSave).not.toHaveBeenCalled()
    expect(result.current.issues).toEqual(issues)
    expect(result.current.saving).toBe(false)
  })

  it('onSaveAnyway: calls parent callback and clears issues on success', async () => {
    const issues: CheckIssue[] = [{ description: 'bad', offendingText: 'bad phrase' }]
    mockFetchOnce({ ok: false, issues })
    const onSaveAnyway = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useBlockEditForm(block, { onSave: vi.fn(), onSaveAnyway }),
    )

    // Populate issues first via a blocked save
    await act(() => result.current.onSave())
    expect(result.current.issues).toHaveLength(1)

    await act(() => result.current.onSaveAnyway())

    expect(onSaveAnyway).toHaveBeenCalledWith({ body: 'initial body' })
    await waitFor(() => expect(result.current.issues).toEqual([]))
  })

  it('onRemoveOffending: strips text from draft and filters that issue', async () => {
    const issues: CheckIssue[] = [
      { description: 'bad 1', offendingText: 'remove me' },
      { description: 'bad 2', offendingText: 'keep me' },
    ]
    mockFetchOnce({ ok: false, issues })
    const { result } = renderHook(() =>
      useBlockEditForm(
        { id: 'b-1', title: 'Test', body: 'prefix remove me suffix' },
        { onSave: vi.fn(), onSaveAnyway: vi.fn() },
      ),
    )

    await act(() => result.current.onSave())
    expect(result.current.issues).toHaveLength(2)

    act(() => result.current.onRemoveOffending('remove me'))

    expect(result.current.draft).toBe('prefix  suffix')
    expect(result.current.issues).toHaveLength(1)
    expect(result.current.issues[0].offendingText).toBe('keep me')
  })

  it('safety check HTTP error: fails open (issues empty, parent onSave runs)', async () => {
    mockFetchOnce({ ok: false, issues: [] }, /* httpOk */ false)
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useBlockEditForm(block, { onSave, onSaveAnyway: vi.fn() }),
    )

    await act(() => result.current.onSave())

    expect(onSave).toHaveBeenCalledWith({ body: 'initial body' })
    expect(result.current.issues).toEqual([])
  })
})
