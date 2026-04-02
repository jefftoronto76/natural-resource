'use client'

import { useSageStore } from '../lib/store'

export function Hero() {
  const expand = useSageStore((s) => s.expand)

  return (
    <>
      <section id="hero" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '64px clamp(24px, 5vw, 48px)',
        borderBottom: '1px solid rgba(26,25,23,0.08)',
        background: 'var(--color-bg)',
      }}>
        <div style={{ maxWidth: '920px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '13.2px',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(26,25,23,0.34)', marginBottom: '40px',
          }}>Performance-Driven, <span style={{
            position: 'relative',
            display: 'inline-block',
            padding: '0 4px',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpath d='M2,14 C20,8 80,6 98,12 C99,16 95,20 80,21 C50,23 15,22 2,18 Z' fill='%232d6a4f' fill-opacity='0.2'/%3E%3C/svg%3E\")",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}>Heart-Led</span></p>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 72px)',
            fontWeight: 400, lineHeight: 1.06, letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)', marginBottom: '32px',
          }}>
            Better close rates.<br />
            Deeper relationships.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>Revenue growth, made easier.</em>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.7, fontWeight: 400,
            color: 'var(--color-text-muted)', maxWidth: '540px', marginBottom: '48px',
          }}>
            I'm Jeff Lougheed, a revenue and operations leader who helps technology companies and ambitious professionals achieve the growth they're after.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="#work" onClick={(e) => { e.preventDefault(); document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }) }} style={{
              display: 'inline-block', background: 'var(--color-text-primary)',
              color: 'var(--color-bg)', fontFamily: 'var(--font-mono)',
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '16px 32px', textDecoration: 'none',
              cursor: 'pointer',
            }}>Book a Session — $250</a>
            <a href="#chat" onClick={(e) => { e.preventDefault(); expand() }} style={{
              display: 'inline-block', background: 'transparent',
              color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '16px 32px', textDecoration: 'none',
              border: '1px solid rgba(26,25,23,0.15)',
              cursor: 'pointer',
            }}>Ask a Question</a>
          </div>
        </div>
      </section>
    </>
  )
}
