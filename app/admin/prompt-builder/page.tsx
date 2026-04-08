'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

import { Select, TextInput, Textarea, Collapse, ActionIcon, Checkbox, Stack, Group, Badge, SimpleGrid } from '@mantine/core'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/admin/primitives/Button'
import { Card } from '@/components/admin/primitives/Card'
import { Text } from '@/components/admin/primitives/Text'
import { useAdminUserId } from '@/context/admin-user'
import { readDataStream } from '@/lib/stream'

// ─── Types & constants ───────────────────────────────────────────────────────

type BlockType = 'identity' | 'knowledge' | 'guardrail' | 'process' | 'escalation'

interface Topic {
  id: string
  name: string
  type: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface DraftBlock {
  title: string
  content: string
  suggestedType?: BlockType
  suggestedTopic?: string
}

const TYPES: { value: BlockType; label: string }[] = [
  { value: 'identity', label: 'Identity & Voice' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'guardrail', label: 'Guardrail' },
  { value: 'process', label: 'Process' },
  { value: 'escalation', label: 'Escalation' },
]

const VALID_TYPES = new Set<string>(TYPES.map(t => t.value))

const MAX_EXCHANGES = 10
const WARN_THRESHOLD = 8

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PromptBuilderPage() {
  const ownerId = useAdminUserId()
  const { user: clerkUser } = useUser()
  const isPlatformAdmin = (clerkUser?.publicMetadata as Record<string, unknown>)?.role === 'platform_admin'

  // Topics from Supabase
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [topicsLoading, setTopicsLoading] = useState(true)

  // Form state (metadata)
  const [type, setType] = useState<BlockType | ''>('')
  const [topicId, setTopicId] = useState<string>('')
  const [newTopicMode, setNewTopicMode] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [blockName, setBlockName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [metadataOpen, setMetadataOpen] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [draftBlock, setDraftBlock] = useState<DraftBlock | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDefault, setIsDefault] = useState(false)
  const [contentId, setContentId] = useState<string | null>(null)
  const [sessionStartIndex, setSessionStartIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Exchange counter — counts user messages in the current session only
  const exchangeCount = chatMessages.slice(sessionStartIndex).filter(m => m.role === 'user').length
  const isAtLimit = exchangeCount >= MAX_EXCHANGES

  // Derived
  const filteredTopics = allTopics.filter(t => t.type === type)
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

  useEffect(() => {
    if (filteredTopics.length > 0 && !filteredTopics.find(t => t.id === topicId)) {
      setTopicId(filteredTopics[0].id)
    }
  }, [type, filteredTopics, topicId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  function resetChat() {
    setChatMessages([])
    setChatInput('')
    setChatLoading(false)
    setDraftBlock(null)
    setBlockName('')
    setIsDefault(false)
    setSaveError(null)
    setContentId(null)
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
        console.error('[confirmNewTopic] insert failed:', await res.json())
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
        const draft: DraftBlock = { title: parsed.title, content: parsed.content }
        if (typeof parsed.type === 'string' && VALID_TYPES.has(parsed.type.toLowerCase())) {
          draft.suggestedType = parsed.type.toLowerCase() as BlockType
        }
        if (typeof parsed.topic === 'string' && parsed.topic.trim()) {
          draft.suggestedTopic = parsed.topic.trim()
        }
        return {
          displayText: text.slice(0, text.length - match[0].length).trim(),
          draft,
        }
      }
    } catch { /* not valid JSON yet */ }
    return { displayText: text, draft: null }
  }

  async function sendChatMessage(messages: ChatMessage[]) {
    setChatLoading(true)
    const placeholderMsg: ChatMessage = { role: 'assistant', content: '', timestamp: Date.now() }
    setChatMessages([...messages, placeholderMsg])

    try {
      const contentType = file ? 'upload' : 'text'
      const raw = file ? file.name : chatInput
      const topicName = selectedTopic?.name ?? ''

      const apiMessages = messages.map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/admin/blocks/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          topic: topicName,
          content_type: contentType,
          content: raw,
          messages: apiMessages,
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const finalText = await readDataStream(response, (accumulated) => {
        const { displayText } = parseDoneJson(accumulated)
        setChatMessages([...messages, { role: 'assistant', content: displayText, timestamp: placeholderMsg.timestamp }])
      })

      const { displayText, draft } = parseDoneJson(finalText)
      setChatMessages([...messages, { role: 'assistant', content: displayText, timestamp: placeholderMsg.timestamp }])
      if (draft) {
        setDraftBlock(draft)
        setBlockName(draft.title)
        if (draft.suggestedType) {
          setType(draft.suggestedType)
          // Find matching topic by name within the suggested type
          if (draft.suggestedTopic) {
            const matchingTopic = allTopics.find(
              t => t.type === draft.suggestedType && t.name.toLowerCase() === draft.suggestedTopic!.toLowerCase()
            )
            if (matchingTopic) {
              setTopicId(matchingTopic.id)
            } else {
              setNewTopicMode(true)
              setNewTopicName(draft.suggestedTopic)
            }
          }
        }
      }
    } catch (err) {
      console.error('[chat] request failed:', err)
      setChatMessages(messages)
    } finally {
      setChatLoading(false)
    }
  }

  async function handleSend() {
    const text = chatInput.trim()
    if (!text || chatLoading || isAtLimit) return

    setChatInput('')
    setDraftBlock(null)
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() }
    const updated = [...chatMessages, userMsg]
    await sendChatMessage(updated)
    textareaRef.current?.focus()
  }

  async function handleSaveBlock() {
    console.log('[handleSaveBlock]', { ownerId, draftBlock, type, topicId })
    if (!draftBlock || !ownerId) return

    const missing: string[] = []
    if (!type) missing.push('type')
    if (!topicId) missing.push('topic')
    if (!blockName.trim()) missing.push('block name')

    if (missing.length > 0) {
      setSaveError(`Missing required fields: ${missing.join(', ')}. Open block metadata to set them.`)
      return
    }

    setSaveError(null)
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/blocks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          topic_id: topicId,
          title: blockName.trim(),
          body: draftBlock.content,
          source_id: contentId,
          owner_id: ownerId,
          is_default: isDefault,
          messages: chatMessages.slice(sessionStartIndex).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setSaveError(data?.error ?? 'Failed to save block. Please try again.')
        return
      }

      // Reset draft and form state, but keep the message thread
      setDraftBlock(null)
      setBlockName('')
      setIsDefault(false)
      setSaveError(null)
      setContentId(null)
      setType('')
      setTopicId('')
      setNewTopicMode(false)
      setNewTopicName('')

      // Inject synthetic continuation message and advance session boundary
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Block saved! What would you like to build next?', timestamp: Date.now() }])
      setSessionStartIndex(chatMessages.length + 1)
      textareaRef.current?.focus()
    } catch (err) {
      console.error('[handleSaveBlock] request failed:', err)
      setSaveError('Network error — could not reach the server.')
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const hasMessages = chatMessages.length > 0

  /* Shared composer container — bordered box with textarea + button row */
  const composerContainer = (
    <div
      className="mx-auto w-full max-w-[800px]"
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: 'var(--mantine-radius-md)',
        boxShadow: hasMessages ? undefined : '0 2px 8px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Textarea — unstyled, no border */}
      <Textarea
        ref={textareaRef}
        value={chatInput}
        onChange={e => setChatInput(e.currentTarget.value)}
        placeholder={isAtLimit ? 'Exchange limit reached' : 'Type or paste content...'}
        autosize
        minRows={hasMessages ? 1 : 2}
        maxRows={4}
        disabled={isAtLimit}
        variant="unstyled"
        styles={{
          input: {
            padding: hasMessages ? '12px 16px' : '16px 20px',
            fontSize: '16px',
            lineHeight: 1.5,
          },
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
      />

      {/* Button row — inside container */}
      <Group
        justify="space-between"
        style={{ padding: hasMessages ? '4px 8px 8px' : '8px 12px 12px' }}
      >
        {/* Left: upload */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          aria-label="Upload file"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAtLimit}
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

        {/* Right: send */}
        <ActionIcon
          variant="filled"
          size="lg"
          onClick={handleSend}
          disabled={chatLoading || isAtLimit || !chatInput.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8h10M9 4l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ActionIcon>
      </Group>

      {/* File attachment indicator */}
      {file && (
        <Group gap="xs" px="sm" pb="xs" mt={-4}>
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
  )

  /* Shared metadata trigger + collapsible fields */
  const metadataSection = (
    <div className={hasMessages ? '' : 'w-full max-w-[800px] max-sm:max-w-full'}>
      <button
        type="button"
        onClick={() => setMetadataOpen(o => !o)}
        className="flex items-center gap-1 bg-transparent border-none cursor-pointer px-0 py-1"
        style={{
          color: 'var(--mantine-color-dimmed)',
          fontFamily: 'var(--mantine-font-family)',
          fontSize: '12px',
        }}
        aria-expanded={metadataOpen}
      >
        Block metadata
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 150ms ease',
            transform: metadataOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '10px',
          }}
        >
          ▾
        </span>
      </button>

      <Collapse in={metadataOpen}>
        <Stack gap="sm" pt="xs">
          {/* Row 1: Type + Topic side by side */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <Select
              label="Type"
              placeholder="Select a type..."
              data={TYPES}
              value={type || null}
              onChange={handleTypeChange}
              allowDeselect={false}
              size="sm"
            />

            {type && (
              <Stack gap={6}>
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
                    size="sm"
                  />
                )}

                {newTopicMode && (
                  <Group gap="xs" wrap="nowrap">
                    <TextInput
                      autoFocus
                      value={newTopicName}
                      onChange={e => setNewTopicName(e.currentTarget.value)}
                      onKeyDown={e => { if (e.key === 'Enter') confirmNewTopic() }}
                      placeholder="Topic name..."
                      style={{ flex: 1, minWidth: 0 }}
                      size="sm"
                    />
                    <Button size="sm" variant="primary" onClick={confirmNewTopic} disabled={isCreatingTopic}>
                      {isCreatingTopic ? '...' : 'Add'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelNewTopic} disabled={isCreatingTopic}>
                      Cancel
                    </Button>
                  </Group>
                )}
              </Stack>
            )}
          </SimpleGrid>

          {/* Row 2: Block name full width */}
          <TextInput
            label="Block name"
            value={blockName}
            onChange={e => setBlockName(e.currentTarget.value)}
            placeholder="e.g. Off-limit topics, Career summary..."
            size="sm"
          />
        </Stack>
      </Collapse>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <Text variant="title">Composer</Text>
      </div>

      {/* ── Empty state: golden ratio positioning ── */}
      {!hasMessages && (
        <div className="flex min-h-0 flex-1 flex-col items-center px-4 sm:px-6">
          {/* Top spacer — 38% of available height (golden ratio) */}
          <div style={{ flex: '0 0 38%' }} />

          <p
            className="select-none text-center"
            style={{
              fontFamily: 'var(--mantine-font-family-headings)',
              fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
              color: 'var(--mantine-color-gray-6)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              maxWidth: '400px',
              lineHeight: 1.4,
              marginBottom: '20px',
            }}
          >
            What would you like to add to your prompt?
          </p>
          {composerContainer}
          <div className="mt-2">
            {metadataSection}
          </div>

          {/* Bottom spacer — absorbs remaining space */}
          <div style={{ flex: '1 1 0%' }} />
        </div>
      )}

      {/* ── Active state: canvas with messages ── */}
      {hasMessages && (
        <>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
            {/* Exchange counter */}
            {exchangeCount > 0 && (
              <div className="sticky top-0 z-10 flex justify-end px-4 py-2 sm:px-6">
                <Badge
                  variant="outline"
                  color={exchangeCount >= MAX_EXCHANGES ? 'red' : exchangeCount >= WARN_THRESHOLD ? 'yellow' : 'gray'}
                  radius="xl"
                  size="sm"
                  style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}
                >
                  {exchangeCount} of {MAX_EXCHANGES} exchanges
                </Badge>
              </div>
            )}

            {/* Chat thread */}
            <div className="mx-auto flex w-full max-w-[800px] flex-col gap-4 px-4 py-4 sm:px-6">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'whitespace-pre-wrap text-white'
                          : 'text-gray-900 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1'
                      }`}
                      style={
                        msg.role === 'user'
                          ? { backgroundColor: 'var(--mantine-color-green-filled)' }
                          : { backgroundColor: 'var(--mantine-color-gray-0)' }
                      }
                    >
                      {msg.role === 'assistant' ? (
                        msg.content ? (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : chatLoading ? (
                          <span className="text-gray-400">Thinking...</span>
                        ) : null
                      ) : (
                        msg.content
                      )}
                    </div>
                    <span
                      className={`text-xs ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                      style={{ color: 'var(--mantine-color-gray-5)' }}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Block confirmation card */}
              {draftBlock && (
                <Card variant="outlined">
                  <Stack gap="sm">
                    <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Block ready
                    </Text>
                    <Text variant="muted" style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--mantine-font-size-sm)', lineHeight: 1.6 }}>
                      {draftBlock.content}
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                      <TextInput
                        label="Block name"
                        value={blockName}
                        onChange={e => setBlockName(e.currentTarget.value)}
                        placeholder="e.g. Curious Mindset"
                        size="sm"
                      />
                      <Select
                        label="Type"
                        placeholder="Select a type..."
                        data={TYPES}
                        value={type || null}
                        onChange={handleTypeChange}
                        allowDeselect={false}
                        size="sm"
                      />
                      <Stack gap={6}>
                        {type ? (
                          topicsLoading ? (
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
                              size="sm"
                            />
                          )
                        ) : (
                          <Select label="Topic" placeholder="Select a type first..." data={[]} disabled size="sm" />
                        )}
                        {newTopicMode && (
                          <Group gap="xs" wrap="nowrap">
                            <TextInput
                              autoFocus
                              value={newTopicName}
                              onChange={e => setNewTopicName(e.currentTarget.value)}
                              onKeyDown={e => { if (e.key === 'Enter') confirmNewTopic() }}
                              placeholder="Topic name..."
                              style={{ flex: 1, minWidth: 0 }}
                              size="sm"
                            />
                            <Button size="sm" variant="primary" onClick={confirmNewTopic} disabled={isCreatingTopic}>
                              {isCreatingTopic ? '...' : 'Add'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelNewTopic} disabled={isCreatingTopic}>
                              Cancel
                            </Button>
                          </Group>
                        )}
                      </Stack>
                    </SimpleGrid>
                    {isPlatformAdmin && (
                      <Checkbox
                        label="Mark as default block"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.currentTarget.checked)}
                        size="sm"
                      />
                    )}
                    {saveError && (
                      <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-sm)', color: 'var(--mantine-color-red-6)' }}>
                        {saveError}
                      </Text>
                    )}
                    <Group gap="xs">
                      <Button variant="primary" size="sm" onClick={handleSaveBlock} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save block'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setDraftBlock(null)
                        setSaveError(null)
                        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Got it — what would you like to change?', timestamp: Date.now() }])
                      }} disabled={isSaving}>
                        Keep refining
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              )}

              {/* Exchange limit message */}
              {isAtLimit && !draftBlock && (
                <Card variant="outlined" style={{ borderColor: 'var(--mantine-color-red-2)', backgroundColor: 'var(--mantine-color-red-0)' }}>
                  <Stack gap="xs">
                    <Text variant="label" style={{ color: 'var(--mantine-color-red-7)' }}>
                      Exchange limit reached
                    </Text>
                    <Text variant="muted" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
                      You&apos;ve reached the exchange limit for this session. Save your block or start a new chat.
                    </Text>
                    <Group gap="xs">
                      <Button variant="ghost" size="sm" onClick={resetChat}>
                        Start new chat
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Composer — pinned at bottom */}
          <div className="shrink-0 border-t border-gray-200 px-4 py-3 sm:px-6">
            {composerContainer}
            <div className="mt-2">
              {metadataSection}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
