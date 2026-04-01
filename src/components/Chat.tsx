'use client'

import { useRef, useEffect, KeyboardEvent, useState } from 'react'
import { useSageStore } from '../lib/store'
import { streamSageResponse } from '../lib/sage'
import { useReveal } from '@/hooks/useReveal'

export function Chat() {
  const ref = useReveal()
  const {
    messages,
    isExpanded,
    isStreaming,
    hasGreeted,
    expand,
    collapse,
    addMessage,
    updateLastMessage,
    setStreaming,
    setGreeted,
  } = useSageStore()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden'
      textareaRef.current?.focus()

      if (!hasGreeted) {
        sendGreeting()
      }
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isExpanded])

  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // On mobile keyboard open, scroll message list to bottom
  useEffect(() => {
    if (!isExpanded) return
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
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

  const sendGreeting = async () => {
    setGreeted(true)
    setStreaming(true)
    addMessage({ role: 'assistant', content: '' })

    try {
      await streamSageResponse([], (chunk: string) => {
        updateLastMessage(chunk)
      })
    } catch (error) {
      updateLastMessage("Hello! I'm Sage, Jeff's AI assistant. How can I help you today?")
    }
    setStreaming(false)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMsg = { role: 'user' as const, content: text }
    // Capture messages before the state update — addMessage is async/batched
    // and the closure `messages` won't include the just-added message.
    // Build the full conversation to send explicitly, with a full SageMessage shape.
    const msgsToSend = [...messages, { ...userMsg, id: `${Date.now()}`, timestamp: Date.now() }]
    addMessage(userMsg)
    setInput('')
    setStreaming(true)
    addMessage({ role: 'assistant', content: '' })

    try {
      await streamSageResponse(msgsToSend, (chunk: string) => {
        updateLastMessage(chunk)
      })
    } catch (error) {
      updateLastMessage('I encountered an issue. Please try again.')
    }
    setStreaming(false)
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
            fontSize: '11px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-text-dim)',
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
            onClick={expand}
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
              href="#session"
              onClick={(e) => { e.preventDefault(); document.getElementById('session')?.scrollIntoView({ behavior: 'smooth' }) }}
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
              Book the $250 Session
            </a>
          </div>
        </div>
      </section>

      {/* Full-viewport overlay — rendered on top, never replaces the section */}
      {isExpanded && (
        <div style={{
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
        }}>
          <header style={{
            background: 'white',
            borderBottom: '1px solid rgba(26,25,23,0.08)',
            padding: '20px clamp(24px, 5vw, 48px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '32px',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}>
                Sage
              </h1>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-text-dim)',
              }}>
                Jeff's AI Assistant
              </p>
            </div>
            <button
              onClick={collapse}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                fontSize: '24px',
                color: 'var(--color-text-muted)',
                lineHeight: 1,
              }}
              aria-label="Close chat"
            >
              ✕
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
            }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '16px',
                    background: msg.role === 'user' ? '#2d6a4f' : 'white',
                    color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(26,25,23,0.08)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    lineHeight: 1.7,
                    fontFamily: 'var(--font-body)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
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
                placeholder="Ask about Jeff's experience, approach, or expertise..."
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
