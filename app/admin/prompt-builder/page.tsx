'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

import { Tooltip, Select, TextInput, Textarea, Accordion as MantineAccordion, ActionIcon, Group } from '@mantine/core'
import { Badge } from '@/components/admin/primitives/Badge'
import { Button } from '@/components/admin/primitives/Button'
import { Card } from '@/components/admin/primitives/Card'
import { Text } from '@/components/admin/primitives/Text'
import { useAdminUserId } from '@/context/admin-user'
import { readDataStream } from '@/lib/stream'

// ─── Types & constants ───────────────────────────────────────────────────────

type BlockType = 'guardrail' | 'knowledge' | 'prompt'

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
  const [type, setType] = useState<BlockType | ''>('')
  const [topicId, setTopicId] = useState<string>('')
  const [newTopicMode, setNewTopicMode] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [blockName, setBlockName] = useState('')
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setType('')
    setTopicId('')
    setNewTopicMode(false)
    setNewTopicName('')
    setBlockName('')
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
    if (type !== '') return true
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

  function handleTypeChange(value: string | null) {
    const newType = (value ?? '') as BlockType | ''
    setType(newType)
    setTopicId('')
    setNewTopicMode(false)
  }

  function handleTopicChange(value: string | null) {
    if (value === '__new__') {
      setNewTopicMode(true)
      setNewTopicName('')
    } else {
      setNewTopicMode(false)
      setTopicId(value ?? '')
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
      const contentType = file ? 'upload' : 'text'
      const raw = file ? file.name : content
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
    const raw = file ? file.name : content
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
          type: file ? 'upload' : 'text',
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
        { id: saved.id, type: type as BlockType, topicId, topicName, title: saved.title, content: saved.body },
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
        {/* Create block form — Accordion, collapsed by default */}
        {showForm && !chatMode && (
          <MantineAccordion
            defaultValue={undefined}
            variant="contained"
            radius="md"
          >
            <MantineAccordion.Item value="new-block">
              <MantineAccordion.Control>
                <Text variant="label">New block</Text>
              </MantineAccordion.Control>
              <MantineAccordion.Panel>
                <div className="flex flex-col gap-5">
                  {/* Type */}
                  <Select
                    label="Type"
                    placeholder="Select a type..."
                    data={TYPES}
                    value={type || null}
                    onChange={handleTypeChange}
                    allowDeselect={false}
                  />

                  {/* Topic — hidden until Type is selected */}
                  {type && (
                    <div className="flex flex-col gap-1.5">
                      {topicsLoading ? (
                        <Text variant="muted" className="text-xs">Loading topics...</Text>
                      ) : (
                        <Select
                          label="Topic"
                          placeholder="Select a topic..."
                          data={[
                            ...filteredTopics.map(t => ({ value: t.id, label: t.name })),
                            { value: '__new__', label: 'New topic...' },
                          ]}
                          value={newTopicMode ? '__new__' : (topicId || null)}
                          onChange={handleTopicChange}
                          allowDeselect={false}
                        />
                      )}

                      {newTopicMode && (
                        <div className="flex gap-2">
                          <TextInput
                            autoFocus
                            value={newTopicName}
                            onChange={e => setNewTopicName(e.currentTarget.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmNewTopic() }}
                            placeholder="Topic name..."
                            className="min-w-0 flex-1"
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
                  )}

                  {/* Block name — hidden until Topic is selected */}
                  {topicId && (
                    <TextInput
                      label="Block name"
                      value={blockName}
                      onChange={e => setBlockName(e.currentTarget.value)}
                      placeholder="e.g. Off-limit topics, Career summary..."
                    />
                  )}

                  {/* Composer input */}
                  <div className="flex flex-col gap-2">
                    <Text variant="muted">Content</Text>
                    <Group gap="xs" align="flex-end" wrap="nowrap">
                      {/* Upload button */}
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        aria-label="Upload file"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 3v10M3 8h10" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </ActionIcon>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={e => {
                          const f = e.target.files?.[0] ?? null
                          setFile(f)
                          e.target.value = ''
                        }}
                        style={{ display: 'none' }}
                      />

                      {/* Textarea */}
                      <Textarea
                        value={content}
                        onChange={e => setContent(e.currentTarget.value)}
                        placeholder="Type or paste content..."
                        autosize
                        minRows={1}
                        maxRows={8}
                        className="flex-1"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey && blockName.trim() && (content.trim() || file)) {
                            e.preventDefault()
                            handleCreate()
                          }
                        }}
                      />

                      {/* Send button */}
                      {(() => {
                        const isDisabled = isSubmitting || !ownerId || !blockName.trim() || !topicId || !(content.trim() || file)
                        const btn = (
                          <ActionIcon
                            variant="filled"
                            size="lg"
                            onClick={handleCreate}
                            disabled={isDisabled}
                            aria-label="Create block"
                            style={isDisabled ? { cursor: 'not-allowed' } : undefined}
                          >
                            <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 8h10M9 4l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </ActionIcon>
                        )
                        return isDisabled ? (
                          <Tooltip label="Block name and content are required" position="top">
                            <span>{btn}</span>
                          </Tooltip>
                        ) : btn
                      })()}
                    </Group>

                    {/* File attachment indicator */}
                    {file && (
                      <Group gap="xs">
                        <Text variant="muted" className="text-xs">
                          📎 {file.name}
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="xs"
                          onClick={() => setFile(null)}
                          aria-label="Remove file"
                        >
                          ✕
                        </ActionIcon>
                      </Group>
                    )}
                  </div>
                </div>
              </MantineAccordion.Panel>
            </MantineAccordion.Item>
          </MantineAccordion>
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
                <TextInput
                  value={chatInput}
                  onChange={e => setChatInput(e.currentTarget.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() } }}
                  placeholder="Type your reply..."
                  disabled={chatLoading}
                  className="min-w-0 flex-1"
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
                    <Textarea
                      value={editContent}
                      onChange={e => setEditContent(e.currentTarget.value)}
                      rows={4}
                      autosize
                      minRows={4}
                      styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
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
