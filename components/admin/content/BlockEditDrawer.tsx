'use client'

import type { ReactNode } from 'react'
import { Drawer } from '@mantine/core'

export interface BlockEditDrawerProps {
  opened: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/**
 * Desktop/tablet edit shell for a single block. Right-side drawer,
 * large size. Renders {children} and nothing else — all edit logic
 * lives in BlockEditForm, which this shell must not know about.
 *
 * If you find yourself adding a handler, a fetch, or a state hook
 * here, stop and lift it into BlockEditForm instead. See INTEGRATION
 * AC6.
 */
export function BlockEditDrawer({ opened, onClose, title, children }: BlockEditDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={title}
      padding="md"
      trapFocus
      returnFocus
    >
      {children}
    </Drawer>
  )
}
