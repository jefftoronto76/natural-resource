import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { BlockEditForm } from './BlockEditForm'
import type { CheckIssue } from './useBlockEditForm'

const block = { id: 'b-1', title: 'Test block', body: 'initial body', order: 3 }

function mockSafetyCheck(response: { ok: boolean; issues: CheckIssue[] }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => response,
    } as Response),
  )
}

describe('BlockEditForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('clean save path — AC7(a): calls onSave with the current draft', async () => {
    const user = userEvent.setup()
    mockSafetyCheck({ ok: true, issues: [] })
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(
      <BlockEditForm
        block={block}
        onSave={onSave}
        onSaveAnyway={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /check & save/i }))

    expect(onSave).toHaveBeenCalledWith({ body: 'initial body', order: 3 })
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('safety warning → Save Anyway — AC7(b): shows Alert, Save Anyway calls onSaveAnyway', async () => {
    const user = userEvent.setup()
    mockSafetyCheck({
      ok: false,
      issues: [
        { description: 'Potentially harmful instruction', offendingText: 'bad phrase' },
      ],
    })
    const onSave = vi.fn()
    const onSaveAnyway = vi.fn().mockResolvedValue(undefined)

    render(
      <BlockEditForm
        block={block}
        onSave={onSave}
        onSaveAnyway={onSaveAnyway}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /check & save/i }))

    // Alert renders with title and issue description
    expect(await screen.findByText(/safety check flagged/i)).toBeInTheDocument()
    expect(screen.getByText(/potentially harmful instruction/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /save anyway/i }))

    expect(onSaveAnyway).toHaveBeenCalledWith({ body: 'initial body', order: 3 })
  })

  it('remove offending — AC7(c): strips text from textarea, removes issue from UI', async () => {
    const user = userEvent.setup()
    mockSafetyCheck({
      ok: false,
      issues: [{ description: 'Has forbidden phrase', offendingText: 'initial ' }],
    })

    render(
      <BlockEditForm
        block={block}
        onSave={vi.fn()}
        onSaveAnyway={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /check & save/i }))
    await screen.findByText(/safety check flagged/i)

    await user.click(screen.getByRole('button', { name: /^remove$/i }))

    // Textarea value updated to reflect the strip. Disambiguate from
    // the Order NumberInput (also `role="textbox"` after Step 12) via
    // the body Textarea's aria-label.
    expect(
      screen.getByRole('textbox', { name: /edit body for test block/i }),
    ).toHaveValue('body')
    // Issue was the only one — Alert disappears
    expect(screen.queryByText(/safety check flagged/i)).not.toBeInTheDocument()
  })

  it('cancel: calls onCancel without side effects', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <BlockEditForm
        block={block}
        onSave={vi.fn()}
        onSaveAnyway={vi.fn()}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('primary button label reflects state (idle → Check & Save)', () => {
    mockSafetyCheck({ ok: true, issues: [] })
    render(
      <BlockEditForm
        block={block}
        onSave={vi.fn()}
        onSaveAnyway={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /check & save/i })).toBeInTheDocument()
  })
})
