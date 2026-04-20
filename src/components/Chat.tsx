'use client'

import { useRef, useEffect, useLayoutEffect, KeyboardEvent, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSageStore } from '../lib/store'
import { streamSageResponse } from '../lib/sage'
import { useReveal } from '@/hooks/useReveal'

type OpenAs = 'new_tab' | 'popup'

interface BookingCardData {
  label: string
  description: string
  ctaLabel: string
  url: string
}

interface SageParameterPublic {
  key: string
  label: string | null
  description: string | null
  cta_label: string | null
  url: string | null
  open_as: OpenAs
  embed_code: string | null
}

interface BookingCardProps extends BookingCardData {
  openAs: OpenAs
  embedCode: string | null
}

// Matches a completed booking-card line: [BOOKING: label | description | cta | url]
const BOOKING_REGEX = /\[BOOKING:\s*([^|\]]*)\|\s*([^|\]]*)\|\s*([^|\]]*)\|\s*([^\]]*)\]/g

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

function parseBookingCards(content: string): { prose: string; cards: BookingCardData[] } {
  const cards: BookingCardData[] = []
  let prose = content.replace(
    BOOKING_REGEX,
    (_match, label: string, description: string, ctaLabel: string, url: string) => {
      cards.push({
        label: label.trim(),
        description: description.trim(),
        ctaLabel: ctaLabel.trim(),
        url: url.trim(),
      })
      return ''
    },
  )
  // Strip an incomplete [BOOKING:... fragment still streaming (no closing bracket yet)
  prose = prose.replace(/\[BOOKING:[^\]]*$/, '')
  // Collapse extra blank lines left behind by removed cards
  prose = prose.replace(/\n{3,}/g, '\n\n').trim()
  return { prose, cards }
}

// Injects an embed snippet into a target element, re-materializing <script>
// tags so they execute (setting innerHTML alone does NOT execute scripts).
// Handles both pure inline JS and HTML fragments containing <script src="...">.
function injectInlineEmbed(target: HTMLElement, embedCode: string): void {
  const trimmed = embedCode.trim()
  if (!trimmed) return

  const hasScriptTag = /<script[\s>]/i.test(trimmed)
  if (!hasScriptTag) {
    const script = document.createElement('script')
    script.text = trimmed
    target.appendChild(script)
    return
  }

  const temp = document.createElement('div')
  temp.innerHTML = trimmed
  Array.from(temp.childNodes).forEach(node => {
    if (node.nodeType !== 1) {
      target.appendChild(node.cloneNode(true))
      return
    }
    if (node.nodeName === 'SCRIPT') {
      const original = node as HTMLScriptElement
      const script = document.createElement('script')
      if (original.src) {
        script.src = original.src
        script.async = original.async
        script.defer = original.defer
      } else {
        script.text = original.textContent ?? ''
      }
      for (const attr of Array.from(original.attributes)) {
        if (attr.name !== 'src' && attr.name !== 'async' && attr.name !== 'defer') {
          script.setAttribute(attr.name, attr.value)
        }
      }
      target.appendChild(script)
    } else if (node.nodeName === 'LINK') {
      document.head.appendChild(node.cloneNode(true))
    } else {
      target.appendChild(node.cloneNode(true))
    }
  })
}

function BookingCard({ label, description, ctaLabel, url, openAs, embedCode }: BookingCardProps) {
  const inlineRef = useRef<HTMLDivElement>(null)
  const [inlineOpen, setInlineOpen] = useState(false)

  const effectiveOpenAs: OpenAs =
    openAs === 'popup' && (!embedCode || embedCode.trim().length === 0) ? 'new_tab' : openAs

  const handleInlineClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!embedCode) {
      console.warn('[BookingCard] inline selected but embed_code missing — falling back to new tab')
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
      return
    }
    if (inlineOpen) return
    const target = inlineRef.current
    if (!target) return
    console.log('[BookingCard] injecting inline embed for', label || url)
    setInlineOpen(true)
    try {
      injectInlineEmbed(target, embedCode)
    } catch (err) {
      console.error('[BookingCard] inline embed injection failed — falling back to new tab:', err)
      setInlineOpen(false)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  if (openAs === 'popup' && (!embedCode || embedCode.trim().length === 0)) {
    console.warn('[BookingCard] inline requested without embed_code for', label || url)
  }

  const buttonClass =
    'mt-3 inline-block rounded-md bg-[#2d6a4f] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-white no-underline hover:opacity-90'

  return (
    <div className="w-full">
      <div className="w-full rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <p className="m-0 font-body text-base font-semibold text-[#1a1917]">{label}</p>
        {description && (
          <p className="mt-1 mb-0 font-body text-sm text-[#1a1917]/60">{description}</p>
        )}
        {effectiveOpenAs === 'popup' ? (
          <button
            type="button"
            onClick={handleInlineClick}
            disabled={inlineOpen}
            className={`${buttonClass} cursor-pointer border-0 disabled:opacity-50`}
          >
            {ctaLabel || 'Book'}
          </button>
        ) : url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass}>
            {ctaLabel || 'Book'}
          </a>
        ) : null}
      </div>
      {effectiveOpenAs === 'new_tab' && (
        <p className="mt-2 m-0 font-body text-xs text-[#1a1917]/55">
          Heads up — clicking the button will open in a new tab to complete your booking.
        </p>
      )}
      <div
        ref={inlineRef}
        aria-hidden={!inlineOpen}
        className={`mt-2 w-full min-h-[700px] ${inlineOpen ? 'block' : 'hidden'}`}
      />
    </div>
  )
}

const markdownComponents = {
  p: ({ children }: any) => (
    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', color: '#1a1917', margin: '0 0 12px 0' }}>
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong style={{ fontWeight: 600, color: '#1a1917' }}>{children}</strong>
  ),
  ul: ({ children }: any) => (
    <ul style={{ paddingLeft: '16px', marginBottom: '12px', listStyleType: 'disc' }}>{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol style={{ paddingLeft: '16px', marginBottom: '12px' }}>{children}</ol>
  ),
  li: ({ children }: any) => <li>{children}</li>,
  pre: ({ children }: any) => <>{children}</>,
  code: ({ children, className }: any) => {
    const isBlock = Boolean(className?.startsWith('language-'))
    return (
      <code style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '13px',
        background: 'rgba(26,25,23,0.06)',
        padding: isBlock ? '8px' : '2px 4px',
        borderRadius: isBlock ? '6px' : '3px',
        display: isBlock ? 'block' : 'inline',
        marginBottom: isBlock ? '12px' : '0',
      }}>
        {children}
      </code>
    )
  },
}

function SageReply({
  prose,
  cards,
  sageParameters,
}: {
  prose: string
  cards: BookingCardData[]
  sageParameters: SageParameterPublic[]
}) {
  if (!prose && cards.length === 0) return null

  return (
    <div
      data-sage-role="assistant"
      className="sage-animate max-w-[680px] border-l-2 border-accent/35 pl-4 [animation:sage-slide-up_0.28s_ease-out_both]"
    >
      {prose && (
        <div className="font-display text-[18px] font-normal leading-[1.55] tracking-[-0.005em] text-[color:var(--color-text-primary)] [text-wrap:pretty]">
          <ReactMarkdown components={markdownComponents}>{prose}</ReactMarkdown>
        </div>
      )}

      {cards.length > 0 && (
        <div className="mt-3 flex w-full flex-col gap-2">
          {cards.map((card, i) => {
            const match = sageParameters.find((p) => (p.url ?? '') === card.url)
            return (
              <BookingCard
                key={`${card.url}-${i}`}
                {...card}
                openAs={match?.open_as ?? 'new_tab'}
                embedCode={match?.embed_code ?? null}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Chat() {
  const ref = useReveal()
  const {
    messages,
    isExpanded,
    isStreaming,
    sessionId,
    mode,
    expand,
    collapse,
    addMessage,
    updateLastMessage,
    setStreaming,
    setSessionId,
  } = useSageStore()

  const [input, setInput] = useState('')
  const [isError, setIsError] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [sageParameters, setSageParameters] = useState<SageParameterPublic[]>([])

  // On fresh page load, auto-open the overlay in question mode when the URL
  // carries ?mode=question. In-page nav (Work's "Click here") routes through
  // expand('question') directly, so the URL is not the source of truth at
  // runtime — it only seeds the initial mount.
  // TODO: migrate to conditional block in Composer when activation_condition feature ships
  useEffect(() => {
    if (detectModeFromLocation() === 'question') {
      expand('question')
    }
  }, [expand])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const retryMsgsRef = useRef<typeof messages>([])
  const retrySessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    console.log('[Chat] fetching sage parameters')
    fetch('/api/sage/parameters')
      .then(async r => {
        if (!r.ok) {
          console.error('[Chat] sage parameters fetch failed:', r.status)
          return
        }
        const data: SageParameterPublic[] = await r.json()
        if (cancelled) return
        console.log('[Chat] sage parameters fetched:', data.length)
        setSageParameters(data)
      })
      .catch(err => {
        console.error('[Chat] sage parameters fetch threw:', err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useLayoutEffect(() => {
    if (!isExpanded) return
    const scrollY = window.scrollY
    document.body.style.setProperty('--sage-scroll-y', `-${scrollY}px`)
    document.body.classList.add('sage-locked')
    return () => {
      document.body.classList.remove('sage-locked')
      document.body.style.removeProperty('--sage-scroll-y')
      window.scrollTo(0, scrollY)
    }
  }, [isExpanded])

  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isExpanded) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages, isExpanded])

  // On mobile, detect keyboard open/close via VisualViewport and scroll the
  // latest message into view. The overlay itself resizes via `height: 100dvh`
  // — we intentionally do NOT mutate top/height here, because setting fixed
  // pixel values fights with dvh and causes the input to float mid-screen on
  // iOS Safari. Desktop is no-op'd via the matchMedia gate.
  useEffect(() => {
    if (!isExpanded) return
    const vv = window.visualViewport
    if (!vv) return
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const baselineHeight = window.innerHeight
    const onViewportChange = () => {
      if (!mobileQuery.matches) {
        setKeyboardOpen(false)
        document.documentElement.style.setProperty('--kb-h', '0px')
        return
      }
      const open = vv.height < baselineHeight * 0.85
      setKeyboardOpen(open)
      const inset = Math.max(0, baselineHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty('--kb-h', `${inset}px`)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    vv.addEventListener('resize', onViewportChange)
    vv.addEventListener('scroll', onViewportChange)
    return () => {
      vv.removeEventListener('resize', onViewportChange)
      vv.removeEventListener('scroll', onViewportChange)
    }
  }, [isExpanded])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        collapse()
      }
    }
    window.addEventListener('keydown', handleEscape as any)
    return () => window.removeEventListener('keydown', handleEscape as any)
  }, [isExpanded, collapse])

  const send = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    setIsError(false)
    const userMsg = { role: 'user' as const, content: text }
    // Capture messages before the state update — addMessage is async/batched
    // and the closure `messages` won't include the just-added message.
    // Build the full conversation to send explicitly, with a full SageMessage shape.
    const msgsToSend = [...messages, { ...userMsg, id: `${Date.now()}`, timestamp: Date.now() }]
    addMessage(userMsg)
    setInput('')
    setStreaming(true)
    addMessage({ role: 'assistant', content: '' })

    // Create session row on the first user message
    let activeSessionId = sessionId
    if (!activeSessionId) {
      try {
        const res = await fetch('/api/sessions', { method: 'POST' })
        const data = await res.json()
        console.log('[Chat] POST /api/sessions status:', res.status, '| response:', JSON.stringify(data))
        if (data.id) {
          activeSessionId = data.id
          setSessionId(data.id)
        }
      } catch (err) {
        console.error('[Chat] POST /api/sessions failed:', err)
      }
    }

    retryMsgsRef.current = msgsToSend
    retrySessionIdRef.current = activeSessionId

    try {
      await streamSageResponse(msgsToSend, (chunk: string) => {
        updateLastMessage(chunk)
      }, { mode })
    } catch (error) {
      updateLastMessage('')
      setIsError(true)
      setStreaming(false)
      return
    }
    setStreaming(false)

    // Persist the completed conversation after each reply
    if (activeSessionId) {
      const { messages: finalMessages, visitorName } = useSageStore.getState()
      fetch(`/api/sessions/${activeSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: finalMessages, visitorName }),
      })
        .then((r) => r.json().then((d) => console.log('[Chat] PATCH /api/sessions status:', r.status, '| response:', JSON.stringify(d))))
        .catch((err) => console.error('[Chat] PATCH /api/sessions failed:', err))
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
      }, { mode })
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
        .then((r) => r.json().then((d) => console.log('[Chat] PATCH /api/sessions status:', r.status, '| response:', JSON.stringify(d))))
        .catch((err) => console.error('[Chat] PATCH /api/sessions failed:', err))
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Section always stays in the DOM — keeps #chat anchor and reveal working */}
      <section
        id="chat"
        style={{
          padding: '64px clamp(24px, 5vw, 48px)',
          borderBottom: '1px solid rgba(26,25,23,0.08)',
          background: '#f9f8f5',
        }}
      >
        <div ref={ref} className="reveal" style={{ maxWidth: '640px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13.2px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(26,25,23,0.34)',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            Not Sure Yet?
            <span style={{
              flex: 1,
              height: '1px',
              background: 'rgba(26,25,23,0.1)',
              maxWidth: '120px',
              display: 'block',
            }} />
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            marginBottom: '12px',
          }}>
            Ask first.<br /><em style={{ fontStyle: 'italic' }}>No commitment.</em>
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 1.6vw, 17px)',
            lineHeight: 1.75,
            color: 'var(--color-text-muted)',
            fontWeight: 400,
            marginBottom: '40px',
          }}>
            This AI knows Jeff's background. It'll give you a straight answer about whether it's a fit.
          </p>

          {messages.length > 0 && (
            <div style={{
              maxHeight: '240px',
              overflowY: 'auto',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '16px',
              background: 'white',
              border: '1px solid rgba(26,25,23,0.08)',
              borderRadius: '4px',
            }}>
              {messages.slice(-3).map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: msg.role === 'user' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    fontWeight: msg.role === 'user' ? 500 : 400,
                  }}
                >
                  <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>
                    {msg.role === 'user' ? 'You' : 'Sage'}
                  </strong>
                  {msg.content.substring(0, 120)}{msg.content.length > 120 ? '...' : ''}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => expand()}
            style={{
              background: '#2d6a4f',
              color: 'white',
              border: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '16px 32px',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            {messages.length > 0 ? 'Continue Conversation' : 'Start a Conversation'}
          </button>

          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(26,25,23,0.08)',
          }}>
            <a
              href="#work"
              onClick={(e) => { e.preventDefault(); document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }) }}
              style={{
                display: 'inline-block',
                border: '1px solid rgba(26,25,23,0.15)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '14px 28px',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Book a Session
            </a>
          </div>
        </div>
      </section>

      {/* Full-viewport overlay — rendered on top, never replaces the section */}
      {isExpanded && (
        <div ref={overlayRef} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100dvh',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          background: '#f9f8f5',
          animation: 'expandChat 0.3s ease-out',
          transition: 'height 0.3s ease, top 0.3s ease',
        }}>
          <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-black/[0.06] bg-bg/90 px-4 backdrop-blur-md backdrop-saturate-150 sm:px-8 [-webkit-backdrop-filter:saturate(180%)_blur(12px)]">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full transition-colors ${isStreaming ? 'bg-accent' : 'bg-accent/35'}`}
              />
              <h1 className="font-display text-[22px] font-normal leading-none tracking-[-0.01em] text-[color:var(--color-text-primary)]">
                Sage
              </h1>
            </div>
            <button
              onClick={collapse}
              aria-label="Close chat"
              className="flex h-11 w-11 items-center justify-center bg-transparent text-[color:var(--color-text-muted)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </header>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(24px, 5vw, 48px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            <div style={{
              maxWidth: '900px',
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              flex: 1,
            }}>
              {messages.length === 0 && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(48px, 6vw, 80px)',
                    fontWeight: 400,
                    color: '#1a1917',
                  }}>
                    Hello.
                  </span>
                </div>
              )}
              {messages.map((msg) => {
                if (msg.role === 'assistant' && !msg.content) return null
                if (msg.role === 'user') {
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '16px',
                        background: '#2d6a4f',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '16px',
                        lineHeight: 1.7,
                        fontFamily: 'var(--font-body)',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  )
                }
                const { prose, cards } = parseBookingCards(msg.content)
                if (!prose && cards.length === 0) return null
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '12px',
                      maxWidth: '70%',
                    }}
                  >
                    {prose && (
                      <div style={{
                        width: '100%',
                        padding: '16px',
                        background: 'white',
                        color: 'var(--color-text-primary)',
                        border: '1px solid rgba(26,25,23,0.08)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        lineHeight: 1.7,
                        fontFamily: 'var(--font-body)',
                      }}>
                        <ReactMarkdown components={markdownComponents}>{prose}</ReactMarkdown>
                      </div>
                    )}
                    {cards.length > 0 && (
                      <div className="flex w-full flex-col gap-2">
                        {cards.map((card, i) => {
                          const match = sageParameters.find(p => (p.url ?? '') === card.url)
                          const openAs: OpenAs = match?.open_as ?? 'new_tab'
                          const embedCode = match?.embed_code ?? null
                          return (
                            <BookingCard
                              key={i}
                              {...card}
                              openAs={openAs}
                              embedCode={embedCode}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              {isError && !isStreaming && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '16px',
                    background: 'white',
                    color: 'var(--color-text-primary)',
                    border: '1px solid rgba(26,25,23,0.08)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    lineHeight: 1.7,
                    fontFamily: 'var(--font-body)',
                  }}>
                    Something went wrong. Please try again.
                    <button
                      onClick={retryLastSend}
                      style={{
                        display: 'block',
                        marginTop: '12px',
                        background: 'transparent',
                        border: '1px solid rgba(26,25,23,0.15)',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '16px',
                    background: 'white',
                    border: '1px solid rgba(26,25,23,0.08)',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '6px',
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#2d6a4f',
                          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div style={{
            background: 'white',
            borderTop: '1px solid rgba(26,25,23,0.08)',
            padding: '12px clamp(16px, 4vw, 48px)',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            flexShrink: 0,
          }}>
            <div style={{
              maxWidth: '900px',
              margin: '0 auto',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder=""
                rows={1}
                style={{
                  flex: 1,
                  background: '#f9f8f5',
                  border: '1px solid rgba(26,25,23,0.12)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  color: 'var(--color-text-primary)',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.5,
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
              />
              <button
                onClick={send}
                disabled={isStreaming || !input.trim()}
                style={{
                  background: '#2d6a4f',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: isStreaming || !input.trim() ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'white',
                  fontSize: '20px',
                }}
                aria-label="Send message"
              >
                →
              </button>
            </div>
            <p style={{
              textAlign: 'center',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '11px',
              color: 'rgba(26,25,23,0.4)',
              marginTop: '8px',
              opacity: keyboardOpen ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}>
              Sage knows Jeff's background and will give you a straight answer.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes expandChat {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </>
  )
}
