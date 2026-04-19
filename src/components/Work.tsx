'use client'

import { useState, useEffect, useRef } from 'react';
import { useSageStore } from '../lib/store'

export function Work() {
  const [expandedCard1, setExpandedCard1] = useState(false);
  const [expandedCard2, setExpandedCard2] = useState(false);
  const [openCalendar, setOpenCalendar] = useState<'card1' | 'card2' | null>(null);
  const calendly1Ref = useRef<HTMLDivElement>(null);
  const calendly2Ref = useRef<HTMLDivElement>(null);
  const expand = useSageStore((s) => s.expand);

  useEffect(() => {
    const loadCalendly = () => {
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://assets.calendly.com/assets/external/widget.js'
        script.async = true
        document.body.appendChild(script)
      }
    }
    loadCalendly()
  }, [])

  useEffect(() => {
    if (openCalendar === 'card1' && calendly1Ref.current && window.Calendly) {
      window.Calendly.initInlineWidget({
        url: 'https://calendly.com/naturalresource/working-session?hide_event_type_details=1&hide_gdpr_banner=1&background_color=f9f8f5&primary_color=2d6a4f',
        parentElement: calendly1Ref.current,
      })
    }
  }, [openCalendar])

  useEffect(() => {
    if (openCalendar === 'card2' && calendly2Ref.current && window.Calendly) {
      window.Calendly.initInlineWidget({
        url: 'https://calendly.com/naturalresource/working-session?hide_event_type_details=1&hide_gdpr_banner=1&background_color=f9f8f5&primary_color=2d6a4f',
        parentElement: calendly2Ref.current,
      })
    }
  }, [openCalendar])

  const handleQuestionModeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // Keep the URL bar showing the deep-linkable form so visitors can copy
    // and share. The overlay itself opens via expand('question') — the URL
    // is decorative here, not the source of runtime state.
    if (window.location.hash !== '#chat?mode=question') {
      history.pushState(null, '', '/#chat?mode=question')
    }
    expand('question')
  }

  return (
    <section id="work" className="w-full px-8 py-16 max-w-7xl mx-auto">
      {/* Section Label */}
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

      {/* Headline */}
      <div className="mb-24">
        <h2
          className="text-6xl leading-tight max-w-2xl mb-6"
          style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
        >
          One operator.
          <br />
          <span className="italic">Two ways in.</span>
        </h2>
        <p
          className="text-lg leading-relaxed mb-4"
          style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, color: 'rgba(26,25,23,0.6)' }}
        >
          I trained in executive coaching at the graduate level. It shapes how I approach growth, leadership, and decision-making.
        </p>
        <p
          className="text-lg leading-relaxed"
          style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, color: 'rgba(26,25,23,0.6)' }}
        >
          Every conversation drives one outcome: clearer priorities and 1–2 practical next moves.
        </p>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24" style={{ alignItems: 'stretch' }}>
        {/* Column 1 - 1-on-1 Coaching */}
        <div className="border rounded-lg p-8" style={{ borderColor: 'rgba(26,25,23,0.12)', display: 'flex', flexDirection: 'column' }}>
          <div className="space-y-8" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Number */}
          <div
            className="text-xs tracking-widest text-gray-300"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            01
          </div>

          {/* Category */}
          <div
            className="text-xs tracking-widest text-gray-400 uppercase"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            FOR AMBITIOUS PROFESSIONALS
          </div>

          {/* Service Title */}
          <h3
            className="text-4xl"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
          >
            Executive Coaching
          </h3>

          {/* Description */}
          <div className="max-w-md">
            <p
              className="text-base leading-relaxed text-gray-600 mb-4"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              Structured thinking work, not just conversations.
            </p>
            <p
              className="text-base leading-relaxed text-gray-600"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              A clear process to get you unstuck and moving forward.
            </p>
          </div>

          {/* List */}
          <div className="work-card-list-wrapper">
            <ul className="space-y-4 pt-4 work-card-list" style={{
              maxHeight: expandedCard1 ? '1000px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease'
            }}>
              {[
                'A deal you can\'t afford to lose',
                'Conversations you don\'t know how to have',
                'Teams that aren\'t working together',
                'Decisions with no clear answer',
                'A project that\'s going sideways',
                'Pipeline that doesn\'t convert',
                'Customers quietly churning',
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-gray-500"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
                >
                  <span className="text-gray-300 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setExpandedCard1(!expandedCard1)}
              className="work-card-toggle"
              style={{
                marginTop: '16px',
                background: 'transparent',
                border: 'none',
                color: '#2d6a4f',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
              }}
            >
              {expandedCard1 ? 'See less' : 'See more'}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: expandedCard1 ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path d="M4 6L8 10L12 6" />
              </svg>
            </button>
          </div>

          {/* Calendly Embed Card 1 */}
          {openCalendar === 'card1' && (
            <div style={{
              marginTop: '32px',
              marginLeft: '-32px',
              marginRight: '-32px',
              marginBottom: '-32px',
              borderTop: '1px solid rgba(26,25,23,0.08)',
              overflow: 'hidden',
            }}>
              <div
                ref={calendly1Ref}
                style={{ minWidth: '320px', height: '700px' }}
              />
            </div>
          )}

          {/* Book Button */}
          <div style={{ marginTop: 'auto', paddingTop: '24px' }} />
          {openCalendar !== 'card1' && (
            <button
              onClick={() => setOpenCalendar('card1')}
              style={{
                width: '100%',
                padding: '16px 32px',
                background: 'rgba(26,25,23,0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(26,25,23,1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(26,25,23,0.9)'
              }}
            >
              Book a Session — C$250
            </button>
          )}

          {openCalendar === 'card1' && (
            <button
              onClick={() => setOpenCalendar(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '16px 32px',
                background: 'rgba(26,25,23,0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(26,25,23,1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(26,25,23,0.9)'
              }}
            >
              Hide Calendar
            </button>
          )}
          </div>
        </div>

        {/* Column 2 - Embedded Execution */}
        <div className="border rounded-lg p-8" style={{ borderColor: 'rgba(26,25,23,0.12)', display: 'flex', flexDirection: 'column' }}>
          <div className="space-y-8" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Number */}
          <div
            className="text-xs tracking-widest text-gray-300"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            02
          </div>

          {/* Category */}
          <div
            className="text-xs tracking-widest text-gray-400 uppercase"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            FOR FOUNDERS, CEOS, AND PE LEADERS
          </div>

          {/* Service Title */}
          <h3
            className="text-4xl"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
          >
            Embedded Execution
          </h3>

          {/* Description */}
          <div className="max-w-md">
            <p
              className="text-base leading-relaxed text-gray-600 mb-4"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              For organizations that want to grow without the drama.
            </p>
            <p
              className="text-base leading-relaxed text-gray-600"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              I build systems that stop problems from happening.
            </p>
          </div>

          {/* List */}
          <div className="work-card-list-wrapper">
            <ul className="space-y-4 pt-4 work-card-list" style={{
              maxHeight: expandedCard2 ? '1000px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease'
            }}>
              {[
                'Forecasts you don\'t trust',
                'Conversion drops nobody can explain',
                'Systems breaking under growth',
                'A critical project off track',
                'A leadership gap slowing execution',
                'Friction between product, sales, and customers',
                'AI plans that aren\'t operational',
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-gray-500"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
                >
                  <span className="text-gray-300 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setExpandedCard2(!expandedCard2)}
              className="work-card-toggle"
              style={{
                marginTop: '16px',
                background: 'transparent',
                border: 'none',
                color: '#2d6a4f',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
              }}
            >
              {expandedCard2 ? 'See less' : 'See more'}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: expandedCard2 ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path d="M4 6L8 10L12 6" />
              </svg>
            </button>
          </div>

          {/* Calendly Embed Card 2 */}
          {openCalendar === 'card2' && (
            <div style={{
              marginTop: '32px',
              marginLeft: '-32px',
              marginRight: '-32px',
              marginBottom: '-32px',
              borderTop: '1px solid rgba(26,25,23,0.08)',
              overflow: 'hidden',
            }}>
              <div
                ref={calendly2Ref}
                style={{ minWidth: '320px', height: '700px' }}
              />
            </div>
          )}

          {/* Book Button */}
          <div style={{ marginTop: 'auto', paddingTop: '24px' }} />
          {openCalendar !== 'card2' && (
            <button
              onClick={() => setOpenCalendar('card2')}
              style={{
                width: '100%',
                padding: '16px 32px',
                background: 'rgba(26,25,23,0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(26,25,23,1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(26,25,23,0.9)'
              }}
            >
              Book a Session — C$250
            </button>
          )}

          {openCalendar === 'card2' && (
            <button
              onClick={() => setOpenCalendar(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '16px 32px',
                background: 'rgba(26,25,23,0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(26,25,23,1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(26,25,23,0.9)'
              }}
            >
              Hide Calendar
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Question Mode Chat Link */}
      <div style={{
        textAlign: 'center',
        marginTop: '48px',
        fontSize: '16px',
        color: 'rgba(26,25,23,0.6)',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        Still have questions?{' '}
        <a
          href="/#chat?mode=question"
          onClick={handleQuestionModeClick}
          style={{
            color: '#2d6a4f',
            textDecoration: 'none',
            borderBottom: '1px solid #2d6a4f',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Click here
        </a>
        .
      </div>

      <style>{`
        @media (min-width: 769px) {
          .work-card-list {
            max-height: none !important;
          }
        }
        @media (max-width: 768px) {
          .work-card-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </section>
  );
}
