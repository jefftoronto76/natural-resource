import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { BlockCard, type BlockCardBlock } from './BlockCard'

const block: BlockCardBlock = {
  id: 'b-1',
  title: 'Test block title',
  type: 'guardrail',
  body: 'body text',
  status: 'active',
  order: 3,
  updated_at: '2026-04-22T12:00:00.000Z',
  topics: { name: 'Voice & tone' },
  author: null,
}

function renderCard(overrides: Partial<React.ComponentProps<typeof BlockCard>> = {}) {
  return render(
    <BlockCard
      block={block}
      selected={false}
      maxVisibleTokens={500}
      onToggleSelect={vi.fn()}
      onToggleStatus={vi.fn()}
      onOpenEdit={vi.fn()}
      onDelete={vi.fn()}
      {...overrides}
    />,
  )
}

describe('BlockCard', () => {
  it('renders title, type badge, order prefix, token count, and status label', () => {
    renderCard()
    expect(screen.getByText('Test block title')).toBeInTheDocument()
    expect(screen.getByText(/GUARDRAIL \(1st\)/)).toBeInTheDocument()
    // Order=3 → "03" prefix rendered ahead of the title in the same paragraph.
    expect(screen.getByText('03')).toBeInTheDocument()
    // body='body text' → 9 chars → ceil(9/4) = 3 tokens (Step 13).
    expect(screen.getByText('3 tokens')).toBeInTheDocument()
    // status='active' → "Active" label next to the Switch (Step 15).
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('tapping the card body calls onOpenEdit', async () => {
    const user = userEvent.setup()
    const onOpenEdit = vi.fn()
    renderCard({ onOpenEdit })
    // The card itself has role="button" with aria-label "Edit {title}"
    await user.click(screen.getByRole('button', { name: /edit test block title/i }))
    expect(onOpenEdit).toHaveBeenCalledWith('b-1')
  })

  it('tapping the Switch does NOT bubble to onOpenEdit', async () => {
    const user = userEvent.setup()
    const onOpenEdit = vi.fn()
    const onToggleStatus = vi.fn()
    renderCard({ onOpenEdit, onToggleStatus })
    // Switch's aria-label matches "Disable Test block title" when active
    await user.click(screen.getByRole('switch', { name: /disable test block title/i }))
    expect(onToggleStatus).toHaveBeenCalledWith('b-1', 'disabled')
    expect(onOpenEdit).not.toHaveBeenCalled()
  })

  it('tapping the Delete icon does NOT bubble to onOpenEdit', async () => {
    const user = userEvent.setup()
    const onOpenEdit = vi.fn()
    const onDelete = vi.fn()
    renderCard({ onOpenEdit, onDelete })
    await user.click(screen.getByRole('button', { name: /delete block/i }))
    expect(onDelete).toHaveBeenCalledWith('b-1')
    expect(onOpenEdit).not.toHaveBeenCalled()
  })

  it('tapping the Checkbox does NOT bubble to onOpenEdit', async () => {
    const user = userEvent.setup()
    const onOpenEdit = vi.fn()
    const onToggleSelect = vi.fn()
    renderCard({ onOpenEdit, onToggleSelect })
    await user.click(screen.getByRole('checkbox', { name: /select test block title/i }))
    expect(onToggleSelect).toHaveBeenCalledWith('b-1')
    expect(onOpenEdit).not.toHaveBeenCalled()
  })

})
