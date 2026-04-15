'use client'

import { useState } from 'react'
import { Button } from '@mantine/core'
import { notifications } from '@mantine/notifications'

interface CompileResponse {
  success: boolean
  version: number
  tokenCount: number
  content: string
  updatedAt: string
}

export function PublishButton() {
  const [publishing, setPublishing] = useState(false)

  async function handlePublish() {
    console.log('[PublishButton] compile triggered')
    setPublishing(true)
    try {
      const res = await fetch('/api/admin/prompt/compile', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error ?? 'Compile failed'
        console.error('[PublishButton] compile failed:', message)
        notifications.show({
          color: 'red',
          title: 'Publish failed',
          message,
        })
        return
      }
      const data: CompileResponse = await res.json()
      console.log('[PublishButton] publish success:', { version: data.version, tokenCount: data.tokenCount })
      notifications.show({
        color: 'green',
        title: 'Prompt published',
        message: `Version ${data.version}`,
      })
    } catch (err) {
      console.error('[PublishButton] publish failed:', err)
      notifications.show({
        color: 'red',
        title: 'Publish failed',
        message: 'Network error — could not reach the server.',
      })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Button
      variant="filled"
      color="green"
      size="sm"
      onClick={handlePublish}
      loading={publishing}
    >
      Compile & Publish
    </Button>
  )
}
