'use client'

import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { useSageStore } from '../lib/store'
import { streamSageResponse } from '../lib/sage'
import { parseBookingCards } from './sage/parseBookingCards'
import { SageReply } from './sage/SageReply'
import { useSageParameters } from './sage/useSageParameters'

const PROMPT_CHIPS: string[] = [
  // TODO(jeff): finalize prompt chip copy
  'Prompt chip 1',
  'Prompt chip 2',
  'Prompt chip 3',
  'Prompt chip 4',
]

function detectModeFromLocation(): 'question' | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  const hashQueryStart = hash.indexOf('?')
  const hashParams =
    hashQueryStart >= 0 ? new URLSearchParams(hash.slice(hashQueryStart + 1)) : null
  const searchParams = new URLSearchParams(window.location.search)
  const value = hashParams?.get('mode') ?? searchParams.get('mode')
  return value === 'question' ? 'question' : null
}

export function Hero() {
  const {
    messages,
    isStreaming,
    sessionId,
    mode,
    addMessage,
    updateLastMessage,
    setStreaming,
    setSessionId,
    setMode,
    setComposerRef,
  } = useSageStore()

  const [input, setInput] = useState('')
  const [isError, setIsError] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const retryMsgsRef = useRef<typeof messages>([])
  const retrySessionIdRef = useRef<string | null>(null)

  const sageParameters = useSageParameters()

  // Register the composer textarea so the store can focus it from anywhere
  // (Nav, Work CTA, #chat final-CTA, ?mode=question URL detection).
  useEffect(() => {
    setComposerRef(textareaRef)
    return () => setComposerRef(null)
  }, [setComposerRef])

  // Bootstrap question mode from the URL on first mount, then focus the
  // composer. Replaces the overlay-era expand('question') effect that lived
  // in Chat.tsx.
  useEffect(() => {
    if (detectModeFromLocation() === 'question') {
      setMode('question')
      requestAnimationFrame(() => {
        setTimeout(() => textareaRef.current?.focus({ preventScroll: false }), 60)
      })
    }
  }, [setMode])

  const engaged = messages.length > 0

  // Scroll the latest message into view on append. Length-only deps so
  // streaming token updates don't fight the user reading prior messages.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (messages.length === 0) return
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'end' })
    })
  }, [messages.length])

  const send = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    setIsError(false)
    const userMsg = { role: 'user' as const, content: text }
    const msgsToSend = [...messages, { ...userMsg, id: `${Date.now()}`, timestamp: Date.now() }]
    addMessage(userMsg)
    setInput('')
    setStreaming(true)
    addMessage({ role: 'assistant', content: '' })

    let activeSessionId = sessionId
    if (!activeSessionId) {
      try {
        const res = await fetch('/api/sessions', { method: 'POST' })
        const data = await res.json()
        console.log('[Hero] POST /api/sessions status:', res.status, '| response:', JSON.stringify(data))
        if (data.id) {
          activeSessionId = data.id
          setSessionId(data.id)
        }
      } catch (err) {
        console.error('[Hero] POST /api/sessions failed:', err)
      }
    }

    retryMsgsRef.current = msgsToSend
    retrySessionIdRef.current = activeSessionId

    try {
      await streamSageResponse(msgsToSend, (chunk: string) => {
        updateLastMessage(chunk)
      }, { mode, sessionId: activeSessionId })
    } catch (error) {
      updateLastMessage('')
      setIsError(true)
      setStreaming(false)
      return
    }
    setStreaming(false)

    if (activeSessionId) {
      const { messages: finalMessages, visitorName } = useSageStore.getState()
      fetch(`/api/sessions/${activeSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: finalMessages, visitorName }),
      })
        .then((r) => r.json().then((d) => console.log('[Hero] PATCH /api/sessions status:', r.status, '| response:', JSON.stringify(d))))
        .catch((err) => console.error('[Hero] PATCH /api/sessions failed:', err))
    }
  }

  const retryLastSend = async () => {
    if (isStreaming) return
    setIsError(false)
    setStreaming(true)
    updateLastMessage('')

    try {
      await streamSageResponse(retryMsgsRef.current, (chunk: string) => {
        updateLastMessage(chunk)
      }, { mode, sessionId: retrySessionIdRef.current })
    } catch (error) {
      updateLastMessage('')
      setIsError(true)
      setStreaming(false)
      return
    }
    setStreaming(false)

    const activeSessionId = retrySessionIdRef.current
    if (activeSessionId) {
      const { messages: finalMessages, visitorName } = useSageStore.getState()
      fetch(`/api/sessions/${activeSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: finalMessages, visitorName }),
      })
        .then((r) => r.json().then((d) => console.log('[Hero] PATCH /api/sessions status:', r.status, '| response:', JSON.stringify(d))))
        .catch((err) => console.error('[Hero] PATCH /api/sessions failed:', err))
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleChip = (chip: string) => {
    setInput(chip)
    textareaRef.current?.focus({ preventScroll: false })
  }

  return (
    <section
      id="hero"
      data-screen-label="Hero"
      className="stage"
      data-engaged={engaged ? 'true' : 'false'}
    >
      <div className="stage-frame">
        <p className="hero-eyebrow">
          Performance-Driven, <span className="hilite">Heart-Led</span>
        </p>

        <h1 className="hero-headline">
          Better close rates.<br />
          Deeper relationships.<br />
          <em style={{ fontStyle: 'italic', color: 'rgb(var(--color-accent))' }}>Revenue growth, made easier.</em>
        </h1>

        <p className="hero-lede">
          Hi, I&apos;m Jeff.<br />
          I work hands-on with vertical market software companies — and the people running them — as an executive coach and fractional operator.
        </p>

        <div className="hero-conversation" role="log" aria-live="polite">
          {messages.length === 0 && (
            <div className="sage-animate max-w-[680px] border-l-2 border-accent/35 pl-4 [animation:sage-slide-up_0.28s_ease-out_both]">
              <p className="mb-3 font-display font-normal leading-[1.15] tracking-[-0.01em] text-[color:var(--color-text-primary)] text-[clamp(22px,3vw,30px)]">
                {mode === 'question' ? (
                  <>Ask me anything about <em className="italic">Jeff&apos;s work</em>.</>
                ) : (
                  <>Hi, I&apos;m Sage. <em className="italic">What brings you here?</em></>
                )}
              </p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'assistant' && !msg.content) return null
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <p className="sage-visitor-msg sage-animate max-w-[560px] whitespace-pre-wrap text-right font-display text-[18px] italic leading-[1.5] text-[color:var(--color-text-muted)] [animation:sage-slide-up_0.24s_ease-out_both] [text-wrap:pretty]">
                    {msg.content}
                  </p>
                </div>
              )
            }
            const { prose, cards } = parseBookingCards(msg.content)
            if (!prose && cards.length === 0) return null
            return (
              <SageReply
                key={msg.id}
                prose={prose}
                cards={cards}
                sageParameters={sageParameters}
              />
            )
          })}

          {isError && !isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-lg border border-black/[0.08] bg-surface p-4 font-body text-base leading-[1.7] text-[color:var(--color-text-primary)]">
                Something went wrong. Please try again.
                <button
                  onClick={retryLastSend}
                  className="mt-3 block rounded-md border border-black/[0.15] bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div data-sage-streaming className="flex justify-start">
              <div className="flex gap-1.5 rounded-lg border border-black/[0.08] bg-surface p-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                    style={{ animation: `sage-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="hero-composer">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={engaged ? 'Reply…' : 'Ask Sage anything about Jeff…'}
            rows={1}
            aria-label="Message Sage"
          />
          <button
            type="button"
            onClick={send}
            disabled={isStreaming || !input.trim()}
            aria-label="Send message"
            className="hero-composer-send"
          >
            →
          </button>
        </div>

        {!engaged && (
          <div className="hero-prompt-chips">
            {PROMPT_CHIPS.map((chip) => (
              <button key={chip} type="button" onClick={() => handleChip(chip)}>
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
