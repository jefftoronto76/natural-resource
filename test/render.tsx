import {
  render as rtlRender,
  screen,
  within,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  cleanup,
  act,
  renderHook,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { adminTheme } from '@/components/admin/theme/mantine-theme'
import type { ReactElement, ReactNode } from 'react'

function Wrapper({ children }: { children: ReactNode }) {
  return <MantineProvider theme={adminTheme}>{children}</MantineProvider>
}

/**
 * Wrapper around @testing-library/react's render that mounts the tree
 * inside the admin MantineProvider. All component tests should import
 * from this file instead of @testing-library/react directly so
 * Mantine components render with the real theme.
 *
 * Re-exports the testing-library surface explicitly (not via
 * `export *`) so `render` here unambiguously refers to this custom
 * render, not the one testing-library ships.
 */
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

export {
  screen,
  within,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  cleanup,
  act,
  renderHook,
  userEvent,
}
export type { RenderOptions, RenderResult }
