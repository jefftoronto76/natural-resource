import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { BlockEditSheet } from './BlockEditSheet'

describe('BlockEditSheet', () => {
  it('renders children when opened', () => {
    render(
      <BlockEditSheet opened onClose={vi.fn()}>
        <div>sheet body content</div>
      </BlockEditSheet>,
    )
    expect(screen.getByText('sheet body content')).toBeInTheDocument()
  })

  it('does not render children when closed', () => {
    render(
      <BlockEditSheet opened={false} onClose={vi.fn()}>
        <div>sheet body content</div>
      </BlockEditSheet>,
    )
    expect(screen.queryByText('sheet body content')).not.toBeInTheDocument()
  })

  it('fires onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <BlockEditSheet opened onClose={onClose} title="Edit block">
        <div>sheet body</div>
      </BlockEditSheet>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render a Close button (no X in header)', () => {
    render(
      <BlockEditSheet opened onClose={vi.fn()} title="Edit block">
        <div>sheet body</div>
      </BlockEditSheet>,
    )
    // Pins the mobile chrome decision: no Drawer.CloseButton is
    // rendered in the compound API, so no X appears. Dismissal is via
    // scrim tap or Escape key only (grabber is visual-only per the
    // Step 4 corrective commit).
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })
})
