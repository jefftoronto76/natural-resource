import { useReveal } from '@/hooks/useReveal'
import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string
        parentElement: HTMLElement
        prefill?: Record<string, unknown>
        utm?: Record<string, unknown>
      }) => void
    }
  }
}

type CalendarType = 'working-session' | 'discovery-call'

export function Session() {
  const ref = useReveal()
  const [activeCalendar, setActiveCalendar] = useState<CalendarType>('working-session')
  const calendarContainerRef = useRef<HTMLDivElement>(null)

  const calendlyUrls = {
    'working-session': 'https://calendly.com/naturalresource/working-session?hide_event_type_details=1&hide_gdpr_banner=1&background_color=f9f8f5&primary_color=2d6a4f',
    'discovery-call': 'https://calendly.com/naturalresource/discovery-call?hide_event_type_details=1&hide_gdpr_banner=1&background_color=f9f8f5&primary_color=2d6a4f'
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (calendarContainerRef.current) {
      calendarContainerRef.current.innerHTML = ''

      const checkCalendly = setInterval(() => {
        if (window.Calendly && calendarContainerRef.current) {
          clearInterval(checkCalendly)
          window.Calendly.initInlineWidget({
            url: calendlyUrls[activeCalendar],
            parentElement: calendarContainerRef.current
          })

          const calendlyWidget = calendarContainerRef.current.querySelector('.calendly-inline-widget') as HTMLElement
          if (calendlyWidget) {
            calendlyWidget.style.width = '100%'
            calendlyWidget.style.height = '700px'
            calendlyWidget.style.minWidth = '320px'
          }
        }
      }, 100)

      return () => clearInterval(checkCalendly)
    }
  }, [activeCalendar])

  return (
    <section id="session" style={{ padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)', borderBottom: '1px solid rgba(26,25,23,0.08)' }}>
      <div ref={ref} className="reveal" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          How to <span style={{
            position: 'relative',
            display: 'inline-block',
            padding: '0 4px',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpath d='M2,14 C20,8 80,6 98,12 C99,16 95,20 80,21 C50,23 15,22 2,18 Z' fill='%232d6a4f' fill-opacity='0.2'/%3E%3C/svg%3E\")",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}>Start</span>
          <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: '48px' }}>
          Whichever lane fits,<br /><em style={{ fontStyle: 'italic' }}>both start here.</em>
        </h2>

        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveCalendar('working-session')}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: activeCalendar === 'working-session' ? 'var(--color-text-primary)' : 'var(--color-text-dim)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeCalendar === 'working-session' ? '3px solid #2d6a4f' : '3px solid transparent',
              padding: '12px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (activeCalendar !== 'working-session') {
                e.currentTarget.style.color = 'var(--color-text-primary)'
                e.currentTarget.style.borderBottom = '3px solid rgba(45, 106, 79, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeCalendar !== 'working-session') {
                e.currentTarget.style.color = 'var(--color-text-dim)'
                e.currentTarget.style.borderBottom = '3px solid transparent'
              }
            }}
          >
            Book a Working Session — $250
          </button>

          <button
            onClick={() => setActiveCalendar('discovery-call')}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: activeCalendar === 'discovery-call' ? 'var(--color-text-primary)' : 'var(--color-text-dim)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeCalendar === 'discovery-call' ? '3px solid #2d6a4f' : '3px solid transparent',
              padding: '12px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (activeCalendar !== 'discovery-call') {
                e.currentTarget.style.color = 'var(--color-text-primary)'
                e.currentTarget.style.borderBottom = '3px solid rgba(45, 106, 79, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeCalendar !== 'discovery-call') {
                e.currentTarget.style.color = 'var(--color-text-dim)'
                e.currentTarget.style.borderBottom = '3px solid transparent'
              }
            }}
          >
            Start with a free call
          </button>
        </div>

        <div style={{
          border: '1px solid rgba(26,25,23,0.08)',
          padding: 0,
          position: 'relative',
          marginBottom: '24px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#2d6a4f' }} />
          <div
            ref={calendarContainerRef}
            style={{
              width: '100%',
              minHeight: '700px',
              overflow: 'hidden',
              background: '#f9f8f5'
            }}
          />
        </div>

        <p style={{ fontSize: '16px', color: 'var(--color-text-dim)', lineHeight: 1.7, textAlign: 'center' }}>
          ICF-aligned. Root-cause focused. Designed to help you find the right path forward. Not every engagement is a fit — if it isn't, you'll know by the end of the session.
        </p>
      </div>
    </section>
  )
}
