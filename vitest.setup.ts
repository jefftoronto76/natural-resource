import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mantine reads matchMedia for responsive hooks. happy-dom ships a
// basic implementation; this mock guarantees the subscription API
// surface Mantine calls (addEventListener / removeEventListener).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mantine Drawer / Popover / etc. use ResizeObserver. happy-dom
// doesn't ship one. Minimal no-op mock unblocks rendering.
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
