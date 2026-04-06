'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

import { Badge } from '@/components/admin/primitives/Badge'
import { Button } from '@/components/admin/primitives/Button'
import { Card } from '@/components/admin/primitives/Card'
import { Text } from '@/components/admin/primitives/Text'
import { tokens } from '@/components/admin/theme/tokens'
import { useAdminUserId } from '@/context/admin-user'
import { readDataStream } from '@/lib/stream'

// ─── Types & constants ───────────────────────────────────────────────────────

type BlockType = 'guardrail' | 'knowledge' | 'prompt'
type ContentMode = 'upload' | 'link' | 'create'

interface Topic {
  id: string
  name: string
  type: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface DraftBlock {
  title: string
  content: string
}

const TYPES: { value: BlockType; label: string }[] = [
  { value: 'guardrail', label: 'Guardrail' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'prompt', label: 'Prompt' },
]

const TYPE_BADGE_VARIANT: Record<BlockType, 'default' | 'success' | 'warning'> = {
  guardrail: 'warning',
  knowledge: 'success',
  prompt: 'default',
}

interface Block {
  id?: string
  type: BlockType
  topicId: string
  topicName: string
  title: string
  content: string
}

// ─── Shared styles (token-based, used on native elements) ────────────────────

const L = tokens.themes.light

const selectTokens = {
  '--select-bg': L.color.surface.canvas,
  '--select-border': L.color.border.subtle,
  '--select-text': L.color.text.primary,
  '--select-font': tokens.typography.role.body.md.fontFamily,
  '--select-size': tokens.typography.role.body.md.fontSize,
  '--select-radius': tokens.radius.md,
} as React.CSSProperties

const inputTokens = {
  '--input-bg': L.color.surface.canvas,
  '--input-border': L.color.border.subtle,
  '--input-text': L.color.text.primary,
  '--input-muted': L.color.text.muted,
  '--input-font': tokens.typography.role.body.md.fontFamily,
  '--input-size': tokens.typography.role.body.md.fontSize,
  '--input-radius': tokens.radius.md,
} as React.CSSProperties

// Mantine filled buttons use the theme's primary green (#2d6a4f) by default.
// No additional style override needed — accentButtonStyle was a bridge for the
// old hand-rolled Button's CSS variable API, now dead.

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PromptBuilderPage() {
  const ownerId = useAdminUserId()

  const [showForm, setShowForm] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [contentId, setContentId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Topics from Supabase
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [topicsLoading, setTopicsLoading] = useState(true)

  // Form state
  const [type, setType] = useState<BlockType>('guardrail')
  const [topicId, setTopicId] = useState<string>('')
  const [newTopicMode, setNewTopicMode] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [blockName, setBlockName] = useState('')
  const [contentMode, setContentMode] = useState<ContentMode>('create')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)

  // Chat state
  const [chatMode, setChatMode] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [draftBlock, setDraftBlock] = useState<DraftBlock | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  // Derived: topics filtered by current type
  const filteredTopics = allTopics.filter(t => t.type === type)

  // Selected topic object (for display name)
  const selectedTopic = allTopics.find(t => t.id === topicId)

  // Fetch topics on mount
  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/topics')
      if (!res.ok) return
      const data: Topic[] = await res.json()
      setAllTopics(data)
    } catch (err) {
      console.error('[fetchTopics] failed:', err)
    } finally {
      setTopicsLoading(false)
    }
  }, [])

  useEffect(() => { fetchTopics() }, [fetchTopics])

  // When type changes or topics load, auto-select first topic for that type
  useEffect(() => {
    if (filteredTopics.length > 0 && !filteredTopics.find(t => t.id === topicId)) {
      setTopicId(filteredTopics[0].id)
    }
  }, [type, filteredTopics, topicId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  function resetForm() {
    setType('guardrail')
    setTopicId('')
    setNewTopicMode(false)
    setNewTopicName('')
    setBlockName('')
    setContentMode('create')
    setContent('')
    setFile(null)
    setContentId(null)
    setChatMode(false)
    setChatMessages([])
    setChatInput('')
    setChatLoading(false)
    setDraftBlock(null)
  }

  function formHasData(): boolean {
    if (type !== 'guardrail') return true
    if (blockName.trim().length > 0) return true
    if (content.trim().length > 0) return true
    if (file !== null) return true
    return false
  }

  function handleCancel() {
    if (chatMode || formHasData()) {
      setShowDiscardModal(true)
    } else {
      resetForm()
      setShowForm(false)
    }
  }

  function confirmDiscard() {
    setShowDiscardModal(false)
    resetForm()
    setShowForm(false)
  }

  function handleTypeChange(newType: BlockType) {
    setType(newType)
    setNewTopicMode(false)
    // topicId will be auto-selected by the useEffect above
  }

  function handleTopicChange(value: string) {
    if (value === '__new__') {
      setNewTopicMode(true)
      setNewTopicName('')
    } else {
      setNewTopicMode(false)
      setTopicId(value)
    }
  }

  function cancelNewTopic() {
    setNewTopicMode(false)
    setNewTopicName('')
  }

  async function confirmNewTopic() {
    const name = newTopicName.trim()
    if (!name) return

    setIsCreatingTopic(true)

    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('[confirmNewTopic] insert failed:', err)
        return
      }

      const newTopic: Topic = await res.json()
      setAllTopics(prev => [...prev, newTopic])
      setTopicId(newTopic.id)
      setNewTopicMode(false)
      setNewTopicName('')
    } catch (err) {
      console.error('[confirmNewTopic] request failed:', err)
    } finally {
      setIsCreatingTopic(false)
    }
  }

  function parseDoneJson(text: string): { displayText: string; draft: DraftBlock | null } {
    const match = text.match(/\n?\{[\s\S]*?"done"\s*:\s*true[\s\S]*?\}\s*$/)
    if (!match) return { displayText: text, draft: null }
    try {
      const parsed = JSON.parse(match[0].trim())
      if (parsed.done && parsed.title && parsed.content) {
        return {
          displayText: text.slice(0, text.length - match[0].length).trim(),
          draft: { title: parsed.title, content: parsed.content },
        }
      }
    } catch { /* not valid JSON yet */ }
    return { displayText: text, draft: null }
  }

  async function sendChatMessage(messages: ChatMessage[]) {
    setChatLoading(true)
    setChatMessages([...messages, { role: 'assistant', content: '' }])

    try {
      const contentType = contentMode === 'upload' ? 'upload' : contentMode === 'link' ? 'url' : 'text'
      const raw = contentMode === 'upload' ? file?.name ?? '' : content
      const topicName = selectedTopic?.name ?? ''

      const response = await fetch('/api/admin/blocks/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          topic: topicName,
          content_type: contentType,
          content: raw,
          messages,
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const finalText = await readDataStream(response, (accumulated) => {
        const { displayText } = parseDoneJson(accumulated)
        setChatMessages([...messages, { role: 'assistant', content: displayText || accumulated }])
      })

      const { displayText, draft } = parseDoneJson(finalText)
      setChatMessages([...messages, { role: 'assistant', content: displayText || finalText }])
      if (draft) setDraftBlock(draft)
    } catch (err) {
      console.error('[chat] request failed:', err)
      setChatMessages(messages)
    } finally {
      setChatLoading(false)
    }
  }

  async function handleCreate() {
    const raw = contentMode === 'upload' ? file?.name ?? '' : content
    if (!raw.trim() || !ownerId || !blockName.trim() || !topicId) return

    setIsSubmitting(true)

    try {
      const topicName = selectedTopic?.name ?? ''
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'e07334a0-2afd-4544-898b-edb124d2dd33',
          owner_id: ownerId,
          name: topicName,
          type: contentMode === 'upload' ? 'upload' : contentMode === 'link' ? 'url' : 'text',
          raw,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('[handleCreate] content insert failed:', err)
        return
      }

      const record = await res.json()
      setContentId(record.id)

      // Transition to chat
      setChatMode(true)
      const initialMessage: ChatMessage = {
        role: 'user',
        content: `Here's my raw content for a "${blockName}" block:\n\n${raw}`,
      }
      await sendChatMessage([initialMessage])
    } catch (err) {
      console.error('[handleCreate] request failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleChatSend() {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    setChatInput('')
    setDraftBlock(null)
    const updated = [...chatMessages, { role: 'user' as const, content: text }]
    await sendChatMessage(updated)
  }

  async function handleSaveBlock() {
    if (!draftBlock || !ownerId || !contentId || !topicId) return

    setIsSaving(true)

    try {
      const res = await fetch('/api/admin/blocks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          topic_id: topicId,
          title: draftBlock.title,
          body: draftBlock.content,
          source_id: contentId,
          owner_id: ownerId,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('[handleSaveBlock] save failed:', err)
        return
      }

      const saved = await res.json()
      const topicName = selectedTopic?.name ?? ''
      setBlocks(prev => [
        ...prev,
        { id: saved.id, type, topicId, topicName, title: saved.title, content: saved.body },
      ])
      resetForm()
      setShowForm(false)
    } catch (err) {
      console.error('[handleSaveBlock] request failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  function startEdit(index: number) {
    setEditingIndex(index)
    setEditContent(blocks[index].content)
  }

  function cancelEdit() {
    setEditingIndex(null)
    setEditContent('')
  }

  function saveEdit(index: number) {
    const block = blocks[index]
    const updated = { ...block, content: editContent }
    console.log('Block update:', { id: block.id, title: block.title, body: editContent })
    setBlocks(prev => prev.map((b, i) => i === index ? updated : b))
    setEditingIndex(null)
    setEditContent('')
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Discard confirmation modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card variant="outlined" className="flex w-full max-w-sm flex-col gap-4">
            <Text variant="label">You have unsaved changes. Are you sure you want to cancel?</Text>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDiscardModal(false)}>
                Keep editing
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDiscard}>
                Discard and cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <Text variant="title">Prompt Builder</Text>
        <Button
          variant={showForm ? 'ghost' : 'primary'}
          size="sm"
          onClick={() => {
            if (showForm) {
              handleCancel()
            } else {
              setShowForm(true)
            }
          }}
        >
          {showForm ? 'Cancel' : 'Create new block'}
        </Button>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {/* Create block form */}
        {showForm && !chatMode && (
          <Card variant="outlined" className="flex flex-col gap-5">
            <Text variant="label">New block</Text>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <Text variant="muted">Type</Text>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as BlockType)}
                className="h-9 w-full rounded-[var(--select-radius)] border border-[var(--select-border)] bg-[var(--select-bg)] px-3 text-[length:var(--select-size)] text-[var(--select-text)] outline-none"
                style={selectTokens}
              >
                {TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div className="flex flex-col gap-1.5">
              <Text variant="muted">Topic</Text>
              {topicsLoading ? (
                <Text variant="muted" className="text-xs">Loading topics...</Text>
              ) : (
                <select
                  value={newTopicMode ? '__new__' : topicId}
                  onChange={e => handleTopicChange(e.target.value)}
                  className="h-9 w-full rounded-[var(--select-radius)] border border-[var(--select-border)] bg-[var(--select-bg)] px-3 text-[length:var(--select-size)] text-[var(--select-text)] outline-none"
                  style={selectTokens}
                >
                  {filteredTopics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  <option value="__new__">New topic...</option>
                </select>
              )}

              {newTopicMode && (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newTopicName}
                    onChange={e => setNewTopicName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmNewTopic() }}
                    placeholder="Topic name..."
                    className="h-9 min-w-0 flex-1 rounded-[var(--input-radius)] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[length:var(--input-size)] text-[var(--input-text)] placeholder:text-[var(--input-muted)] outline-none"
                    style={inputTokens}
                  />
                  <Button size="sm" variant="primary" onClick={confirmNewTopic} disabled={isCreatingTopic}>
                    {isCreatingTopic ? '...' : 'Add'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelNewTopic} disabled={isCreatingTopic}>
                    Cancel
                  </Button>
                </div>
              )}

              <Text variant="muted" className="text-xs">
                AI will fill this in if you&apos;re not sure
              </Text>
            </div>

            {/* Block name */}
            <div className="flex flex-col gap-1.5">
              <Text variant="muted">Block name</Text>
              <input
                value={blockName}
                onChange={e => setBlockName(e.target.value)}
                placeholder="e.g. Off-limit topics, Career summary..."
                className="h-9 w-full rounded-[var(--input-radius)] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[length:var(--input-size)] text-[var(--input-text)] placeholder:text-[var(--input-muted)] outline-none"
                style={inputTokens}
              />
            </div>

            {/* Content mode */}
            <div className="flex flex-col gap-2">
              <Text variant="muted">Content</Text>
              <div className="grid grid-cols-3 gap-2">
                {(['upload', 'link', 'create'] as const).map(mode => (
                  <Button
                    key={mode}
                    variant={contentMode === mode ? 'primary' : 'ghost'}
                    color={contentMode === mode ? undefined : 'gray'}
                    size="sm"
                    onClick={() => {
                      setContentMode(mode)
                      setContent('')
                      setFile(null)
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>

              {contentMode === 'upload' && (
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                />
              )}

              {contentMode === 'link' && (
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="https://..."
                  className="h-9 w-full rounded-[var(--input-radius)] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[length:var(--input-size)] text-[var(--input-text)] placeholder:text-[var(--input-muted)] outline-none"
                  style={inputTokens}
                />
              )}

              {contentMode === 'create' && (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Type or paste content..."
                  rows={6}
                  className="w-full resize-y rounded-[var(--input-radius)] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-[length:var(--input-size)] text-[var(--input-text)] leading-relaxed placeholder:text-[var(--input-muted)] outline-none"
                  style={inputTokens}
                />
              )}
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              size="md"
                           onClick={handleCreate}
              disabled={isSubmitting || !ownerId || !blockName.trim() || !topicId || !(content.trim() || file)}
            >
              {isSubmitting ? 'Saving...' : 'Create Block'}
            </Button>
          </Card>
        )}

        {/* Chat interface */}
        {showForm && chatMode && (
          <Card variant="outlined" className="flex flex-col gap-0 p-0">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <Text variant="label">Refining block</Text>
                <Text variant="muted" className="text-xs">
                  {TYPES.find(t => t.value === type)?.label} &middot; {selectedTopic?.name ?? ''} &middot; {blockName}
                </Text>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>

            {/* Messages */}
            <div className="flex max-h-96 flex-col gap-3 overflow-y-auto p-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.content ? (
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed sm:max-w-[75%] ${
                        msg.role === 'user'
                          ? 'whitespace-pre-wrap bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-900 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  ) : chatLoading ? (
                    <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-400">
                      Thinking...
                    </div>
                  ) : null}
                </div>
              ))}

              {/* Draft block card */}
              {draftBlock && (
                <Card variant="outlined" className="flex flex-col gap-3">
                  <Text variant="muted" className="text-xs font-semibold uppercase tracking-wider">
                    Block ready
                  </Text>
                  <Text variant="label">{draftBlock.title}</Text>
                  <Text variant="muted" className="whitespace-pre-wrap text-sm leading-relaxed">
                    {draftBlock.content}
                  </Text>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleSaveBlock} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save block'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDraftBlock(null)} disabled={isSaving}>
                      Keep refining
                    </Button>
                  </div>
                </Card>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            {!draftBlock && (
              <div className="flex gap-2 border-t border-gray-200 px-4 py-3">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() } }}
                  placeholder="Type your reply..."
                  disabled={chatLoading}
                  className="h-9 min-w-0 flex-1 rounded-[var(--input-radius)] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[length:var(--input-size)] text-[var(--input-text)] placeholder:text-[var(--input-muted)] outline-none disabled:opacity-50"
                  style={inputTokens}
                />
                <Button
                  variant="primary"
                  size="sm"
                                   onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  Send
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Block list */}
        {blocks.length === 0 ? (
          <Text variant="muted" className="py-8 text-center">
            No blocks yet. Create your first block above.
          </Text>
        ) : (
          <div className="flex flex-col gap-2">
            {blocks.map((block, i) => (
              <Card key={i} variant="outlined" className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={TYPE_BADGE_VARIANT[block.type]} size="sm">
                      {block.type}
                    </Badge>
                    <Text variant="muted" className="shrink-0">{block.topicName}</Text>
                  </div>
                  <Text variant="label" className="min-w-0 truncate sm:flex-1">
                    {block.title}
                  </Text>
                  {editingIndex !== i && (
                    <Button variant="ghost" size="sm" onClick={() => startEdit(i)} className="shrink-0">
                      Edit
                    </Button>
                  )}
                </div>
                {editingIndex === i && (
                  <div className="flex flex-col gap-2 border-t border-gray-200 pt-2">
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full resize-y rounded-[var(--input-radius)] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-[length:var(--input-size)] text-[var(--input-text)] leading-relaxed placeholder:text-[var(--input-muted)] outline-none"
                      style={inputTokens}
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => saveEdit(i)}>
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
