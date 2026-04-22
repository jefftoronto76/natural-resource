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
  topics: { name: 'Voice & tone' },
}

function renderCard(overrides: Partial<React.ComponentProps<typeof BlockCard>> = {}) {
  return render(
    <BlockCard
      block={block}
      selected={false}
      onToggleSelect={vi.fn()}
      onToggleStatus={vi.fn()}
      onOrderCommit={vi.fn().mockResolvedValue(true)}
      onOpenEdit={vi.fn()}
      onDelete={vi.fn()}
      {...overrides}
    />,
  )
}

describe('BlockCard', () => {
  it('renders title, type badge, topic, and order value', () => {
    renderCard()
    expect(screen.getByText('Test block title')).toBeInTheDocument()
    expect(screen.getByText(/GUARDRAIL \(1st\)/)).toBeInTheDocument()
    expect(screen.getByText('Voice & tone')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Order' })).toHaveValue('3')
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

  it('order commit success: calls onOrderCommit with from/to values on blur', async () => {
    const user = userEvent.setup()
    const onOrderCommit = vi.fn().mockResolvedValue(true)
    renderCard({ onOrderCommit })

    const input = screen.getByRole('textbox', { name: 'Order' })
    await user.clear(input)
    await user.type(input, '7')
    await user.tab()

    expect(onOrderCommit).toHaveBeenCalledWith('b-1', 3, 7)
  })

  it('order error: displays when orderError prop set', () => {
    renderCard({ orderError: 'Order already used by Another Block in this type.' })
    expect(
      screen.getByText(/order already used by another block/i),
    ).toBeInTheDocument()
  })

  it('order error: persists while prop set, clears when prop clears', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <BlockCard
        block={block}
        selected={false}
        orderError="Order already used"
        onToggleSelect={vi.fn()}
        onToggleStatus={vi.fn()}
        onOrderCommit={vi.fn().mockResolvedValue(true)}
        onOpenEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText(/order already used/i)).toBeInTheDocument()

    // User types — error keeps showing. No dismiss-on-type.
    const input = screen.getByRole('textbox', { name: 'Order' })
    await user.type(input, '9')

    expect(screen.getByText(/order already used/i)).toBeInTheDocument()

    // Parent clears orderError (e.g. on successful commit) → error disappears.
    rerender(
      <BlockCard
        block={block}
        selected={false}
        orderError={undefined}
        onToggleSelect={vi.fn()}
        onToggleStatus={vi.fn()}
        onOrderCommit={vi.fn().mockResolvedValue(true)}
        onOpenEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.queryByText(/order already used/i)).not.toBeInTheDocument()

    // Parent sets a fresh orderError → it displays.
    rerender(
      <BlockCard
        block={block}
        selected={false}
        orderError="New conflict"
        onToggleSelect={vi.fn()}
        onToggleStatus={vi.fn()}
        onOrderCommit={vi.fn().mockResolvedValue(true)}
        onOpenEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText(/new conflict/i)).toBeInTheDocument()
  })
})
