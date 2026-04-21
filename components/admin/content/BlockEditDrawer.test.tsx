import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { BlockEditDrawer } from './BlockEditDrawer'

describe('BlockEditDrawer', () => {
  it('renders children when opened', () => {
    render(
      <BlockEditDrawer opened onClose={vi.fn()}>
        <div>drawer body content</div>
      </BlockEditDrawer>,
    )
    expect(screen.getByText('drawer body content')).toBeInTheDocument()
  })

  it('does not render children when closed', () => {
    render(
      <BlockEditDrawer opened={false} onClose={vi.fn()}>
        <div>drawer body content</div>
      </BlockEditDrawer>,
    )
    expect(screen.queryByText('drawer body content')).not.toBeInTheDocument()
  })

  it('fires onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <BlockEditDrawer opened onClose={onClose} title="Edit block">
        <div>drawer body</div>
      </BlockEditDrawer>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
