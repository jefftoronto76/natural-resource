import { useRef, useEffect, KeyboardEvent, useState } from 'react'
import { useChatStore } from '@/lib/store'
import { sendMessage } from '@/lib/ai'
import { useReveal } from '@/hooks/useReveal'

export function Chat() {
  const ref = useReveal()
  const { messages, loading, addMessage, setLoading } = useChatStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { role: 'user' as const, content: text }
    addMessage(userMsg)
    setInput('')
    setLoading(true)
    try {
      const reply = await sendMessage([...messages, userMsg])
      addMessage({ role: 'assistant', content: reply })
    } catch {
      addMessage({ role: 'assistant', content: 'Something went wrong. Try again.' })
    }
    setLoading(false)
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <section id="chat" style={{ padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)', borderBottom: '1px solid rgba(26,25,23,0.08)' }}>
      <div ref={ref} className="reveal" style={{ maxWidth: '640px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          Not Sure Yet?
          <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          Ask first.<br /><em style={{ fontStyle: 'italic' }}>No commitment.</em>
        </h2>
        <p style={{ fontSize: 'clamp(16px, 1.6vw, 17px)', lineHeight: 1.75, color: 'var(--color-text-muted)', fontWeight: 400, marginBottom: '40px' }}>
          This AI knows Jeff's background. It'll give you a straight answer about whether it's a fit.
        </p>

        <div style={{ maxHeight: '360px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(26,25,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '12px', marginTop: '2px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)' }} />
                </div>
              )}
              <div style={{
                maxWidth: '80%', fontSize: '16px', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                padding: msg.role === 'user' ? '12px 16px' : '0',
                border: msg.role === 'user' ? '1px solid rgba(26,25,23,0.08)' : 'none',
                background: msg.role === 'user' ? 'rgba(26,25,23,0.03)' : 'transparent',
                color: msg.role === 'user' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(26,25,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)' }} />
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-accent)', opacity: 0.4, animation: `pulse 1.2s ease-in-out ${j*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ borderTop: '1px solid rgba(26,25,23,0.08)', paddingTop: '20px', display: 'flex', gap: '10px' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="What are you working on..." rows={2}
            style={{ flex: 1, background: 'transparent', border: '1px solid rgba(26,25,23,0.12)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--color-text-primary)', resize: 'none', outline: 'none' }} />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{ background: 'var(--color-text-primary)', color: 'var(--color-bg)', border: 'none', padding: '0 20px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.3 : 1 }}>
            Send
          </button>
        </div>

        <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(26,25,23,0.08)' }}>
          <a href="#session" style={{ display: 'inline-block', border: '1px solid rgba(26,25,23,0.15)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 28px', textDecoration: 'none' }}>
            Book the $250 Session
          </a>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </section>
  )
}
