import { useState } from 'react'

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
  }
]

export function QuotesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, QUOTES.length - 2) : Math.max(0, prev - 1)))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(QUOTES.length - 2, prev + 1))
  }

  const canGoUp = currentIndex > 0
  const canGoDown = currentIndex < QUOTES.length - 2

  const quoteStyle: React.CSSProperties = {
    borderLeft: '2px solid var(--color-accent)',
    paddingLeft: '24px',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '48px',
      paddingBottom: '48px'
    }}>
      {/* Section Label */}
      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '11px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(26,25,23,0.4)',
        marginBottom: '32px',
      }}>
        What People Say
      </div>

      {/* Quotes Container */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        height: '400px',
        marginBottom: '24px'
      }}>
        {/* First visible quote */}
        <div style={{
          ...quoteStyle,
          opacity: 1,
          transform: 'translateY(0)',
        }}>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--color-text-primary)',
            marginBottom: '10px'
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

        {/* Second visible quote */}
        {currentIndex + 1 < QUOTES.length && (
          <div style={{
            ...quoteStyle,
            marginTop: '40px',
            opacity: 1,
            transform: 'translateY(0)',
          }}>
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'var(--color-text-primary)',
              marginBottom: '10px'
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

        {/* Peek of next quote (partially visible, muted) */}
        {currentIndex + 2 < QUOTES.length && (
          <div style={{
            ...quoteStyle,
            marginTop: '40px',
            opacity: 0.3,
            transform: 'translateY(0)',
            pointerEvents: 'none',
          }}>
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'var(--color-text-primary)',
              marginBottom: '10px'
            }}>
              "{QUOTES[currentIndex + 2].text}"
            </p>
            <cite style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
              fontStyle: 'normal'
            }}>
              — {QUOTES[currentIndex + 2].author}, {QUOTES[currentIndex + 2].company} ({QUOTES[currentIndex + 2].year})
            </cite>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={handlePrev}
          disabled={!canGoUp}
          style={{
            background: 'transparent',
            border: '1px solid rgba(26,25,23,0.12)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoUp ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            color: canGoUp ? 'var(--color-text-primary)' : 'rgba(26,25,23,0.2)',
            opacity: canGoUp ? 1 : 0.4
          }}
          onMouseEnter={(e) => {
            if (canGoUp) {
              e.currentTarget.style.background = 'rgba(26,25,23,0.04)'
              e.currentTarget.style.borderColor = 'rgba(26,25,23,0.2)'
            }
          }}
          onMouseLeave={(e) => {
            if (canGoUp) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(26,25,23,0.12)'
            }
          }}
          aria-label="Previous quotes"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12L10 6L16 12" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          disabled={!canGoDown}
          style={{
            background: 'transparent',
            border: '1px solid rgba(26,25,23,0.12)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoDown ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            color: canGoDown ? 'var(--color-text-primary)' : 'rgba(26,25,23,0.2)',
            opacity: canGoDown ? 1 : 0.4
          }}
          onMouseEnter={(e) => {
            if (canGoDown) {
              e.currentTarget.style.background = 'rgba(26,25,23,0.04)'
              e.currentTarget.style.borderColor = 'rgba(26,25,23,0.2)'
            }
          }}
          onMouseLeave={(e) => {
            if (canGoDown) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(26,25,23,0.12)'
            }
          }}
          aria-label="Next quotes"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8L10 14L16 8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
