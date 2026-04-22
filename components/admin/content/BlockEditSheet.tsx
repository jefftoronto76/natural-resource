'use client'

import type { ReactNode } from 'react'
import { Drawer } from '@mantine/core'

export interface BlockEditSheetProps {
  opened: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/**
 * Mobile edit shell for a single block. Bottom sheet at 86% viewport
 * height with a grabber handle at the top. Renders {children} and
 * nothing else — all edit logic lives in BlockEditForm, which this
 * shell must not know about.
 *
 * Mirrors BlockEditDrawer's prop contract so the parent can pick
 * either at the md breakpoint without changing the payload. Chrome
 * differs per form factor (grabber vs close button) but the prop
 * surface is identical.
 *
 * Uses Mantine's compound Drawer API so the grabber can sit above
 * the title (grabber → title → body). See INTEGRATION AC6.
 *
 * Dismissal behavior:
 * - Scrim tap fires onClose via Drawer.Overlay (Mantine default).
 * - Esc key fires onClose via Drawer.Root (closeOnEscape default true).
 * - The grabber is a visual affordance only — NOT drag-to-dismiss.
 *   Implementing drag gesture handling is deferred to Phase 2.
 *
 * No Drawer.CloseButton is rendered, so no X appears in the header —
 * the compound API equivalent of withCloseButton={false}.
 */
export function BlockEditSheet({ opened, onClose, title, children }: BlockEditSheetProps) {
  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="86%"
      radius="md"
      trapFocus
      returnFocus
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <div
          aria-hidden
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'var(--mantine-color-gray-4)',
            }}
          />
        </div>
        {title && (
          <Drawer.Header>
            <Drawer.Title>{title}</Drawer.Title>
          </Drawer.Header>
        )}
        <Drawer.Body p="md">{children}</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  )
}
