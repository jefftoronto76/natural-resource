'use client'

import { useState } from 'react'
import { useReveal } from '@/hooks/useReveal'

interface Quote {
  text: string
  author: string
  company: string
  year: string
}

const QUOTES: Quote[] = [
  {
    text: "I took that advice and went out guns blazing — #1 on my team and #2 in Canada.",
    author: "Chris Chun",
    company: "Intuit",
    year: "2019"
  },
  {
    text: "A very capable leader, an advocate for the customer base, and a true partner as we re-built our sales organization.",
    author: "Jim Schnepp",
    company: "VP Sales, Trapeze Group",
    year: "2015"
  },
  {
    text: "Once he has decided on a course of action, he is tenacious in executing and accomplishing those goals.",
    author: "Colin McKenzie",
    company: "General Manager, Trapeze Group",
    year: "2011"
  },
  {
    text: "His sharp listening skills are rare — a defining trait of what makes him a formidable manager and sales expert.",
    author: "Diego Menchaca",
    company: "Designer",
    year: "2025"
  },
  {
    text: "He puts his own personality stamp on everything he does — which makes his contributions memorable and easy to appreciate.",
    author: "Pepper Harward",
    company: "Director Enterprise Sales",
    year: "2012"
  },
  {
    text: "A fantastic business coach who will help you or your company's business development skills increase dramatically.",
    author: "Martin Burwell",
    company: "Keyhole",
    year: "2018"
  },
  {
    text: "He coached me around how to figure out the right questions to understand the needs of the customer.",
    author: "Karl Shamatutu",
    company: "Keyhole",
    year: "2019"
  },
  {
    text: "Gave me the confidence to get out there and make it happen.",
    author: "Kiki Athanas",
    company: "Meal Garden",
    year: "2019"
  },
  {
    text: "You were committed to my success — you could see my strengths and weaknesses quickly, helped me find wins, and had patience where I was lacking.",
    author: "Skyler Thompson",
    company: "Keyhole",
    year: "2019"
  }
]

export function QuoteCarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(1)
  const ref = useReveal()

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 1 ? 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(QUOTES.length - 2, prev + 1))
  }

  const canGoUp = currentIndex > 1
  const canGoDown = currentIndex < QUOTES.length - 2

  const quoteStyle: React.CSSProperties = {
    borderLeft: '2px solid var(--color-accent)',
    paddingLeft: '24px',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  }

  return (
    <section
      style={{
        padding: '64px clamp(24px, 5vw, 48px)',
        borderBottom: '1px solid rgba(26,25,23,0.08)',
      }}
    >
      <div ref={ref} className="reveal" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section Label */}
        <div style={{
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
          <span style={{
            position: 'relative',
            display: 'inline-block',
            padding: '0 4px',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpath d='M2,14 C20,8 80,6 98,12 C99,16 95,20 80,21 C50,23 15,22 2,18 Z' fill='%232d6a4f' fill-opacity='0.2'/%3E%3C/svg%3E\")",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}>Why Me</span>
          <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
        </div>

        {/* H2 Heading */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(30px, 4vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          color: 'var(--color-text-primary)',
          marginBottom: '48px',
        }}>
          What it's like to <em style={{ fontStyle: 'italic' }}>work together.</em>
        </h2>

        {/* Quotes Container */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
        }}>
          {/* Up Arrow - Above first quote */}
          <button
            onClick={handlePrev}
            disabled={!canGoUp}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              marginBottom: '24px',
              marginLeft: '24px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canGoUp ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              color: canGoUp ? 'var(--color-text-primary)' : 'rgba(26,25,23,0.2)',
              opacity: canGoUp ? 1 : 0.3,
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (canGoUp) {
                e.currentTarget.style.opacity = '0.6'
              }
            }}
            onMouseLeave={(e) => {
              if (canGoUp) {
                e.currentTarget.style.opacity = '1'
              }
            }}
            aria-label="Previous quotes"
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12L10 6L16 12" />
            </svg>
          </button>

          <div style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '450px',
          }}>
            {/* Previous quote (above, faded) */}
            {currentIndex - 1 >= 0 && (
              <div style={{
                ...quoteStyle,
                opacity: 0.4,
                transform: 'translateY(0)',
                pointerEvents: 'none',
              }}>
                <p style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(18px, 2vw, 22px)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'var(--color-text-primary)',
                  marginBottom: '16px'
                }}>
                  "{QUOTES[currentIndex - 1].text}"
                </p>
                <cite style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-dim)',
                  fontStyle: 'normal'
                }}>
                  — {QUOTES[currentIndex - 1].author}, {QUOTES[currentIndex - 1].company} ({QUOTES[currentIndex - 1].year})
                </cite>
              </div>
            )}

            {/* Current quote (center, full opacity) */}
            <div style={{
              ...quoteStyle,
              marginTop: currentIndex - 1 >= 0 ? '56px' : '0',
              opacity: 1,
              transform: 'translateY(0)',
            }}>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(18px, 2vw, 22px)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'var(--color-text-primary)',
                marginBottom: '16px'
              }}>
                "{QUOTES[currentIndex].text}"
              </p>
              <cite style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-dim)',
                fontStyle: 'normal'
              }}>
                — {QUOTES[currentIndex].author}, {QUOTES[currentIndex].company} ({QUOTES[currentIndex].year})
              </cite>
            </div>

            {/* Next quote (below, faded) */}
            {currentIndex + 1 < QUOTES.length && (
              <div style={{
                ...quoteStyle,
                marginTop: '56px',
                opacity: 0.4,
                transform: 'translateY(0)',
                pointerEvents: 'none',
              }}>
                <p style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(18px, 2vw, 22px)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'var(--color-text-primary)',
                  marginBottom: '16px'
                }}>
                  "{QUOTES[currentIndex + 1].text}"
                </p>
                <cite style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-dim)',
                  fontStyle: 'normal'
                }}>
                  — {QUOTES[currentIndex + 1].author}, {QUOTES[currentIndex + 1].company} ({QUOTES[currentIndex + 1].year})
                </cite>
              </div>
            )}
          </div>

          {/* Down Arrow - Below last quote */}
          <button
            onClick={handleNext}
            disabled={!canGoDown}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              marginTop: '24px',
              marginLeft: '24px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canGoDown ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              color: canGoDown ? 'var(--color-text-primary)' : 'rgba(26,25,23,0.2)',
              opacity: canGoDown ? 1 : 0.3,
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (canGoDown) {
                e.currentTarget.style.opacity = '0.6'
              }
            }}
            onMouseLeave={(e) => {
              if (canGoDown) {
                e.currentTarget.style.opacity = '1'
              }
            }}
            aria-label="Next quotes"
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8L10 14L16 8" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
