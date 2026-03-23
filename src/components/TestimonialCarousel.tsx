import { useState } from 'react'

interface StatsCard {
  logo: string
  headline: string
  metric: string
  market: string
  story: string
}

const STATS_CARDS: StatsCard[] = [
  {
    logo: "/logos/Trapeze.svg",
    headline: "MARKET DOMINANCE",
    metric: "$350K → $25M",
    market: "Mission Critical, Integrated Technology, B2G",
    story: "13 successful years building commercial systems in the Constellation Software ecosystem"
  },
  {
    logo: "/logos/Infor.svg",
    headline: "ENTERPRISE BREAKTHROUGH",
    metric: "$1.7M ARR",
    market: "Tier 1 Enterprise, B2B",
    story: "Closed the largest HCM CloudSuite deal in Canadian history in 2018"
  },
  {
    logo: "/logos/keyhole.svg",
    headline: "REVENUE MODEL TRANSFORMATION",
    metric: "3× Average Deal Size",
    market: "B2B Social Analytics",
    story: "Rebuilt the GTM motion, tripling deal size and unlocking enterprise revenue"
  },
  {
    logo: "/logos/mealgarden.svg",
    headline: "PLG SCALE & GROWTH",
    metric: "9× ARR",
    market: "PLG, SMB, B2B2C",
    story: "Took a stalled product to ninefold ARR growth before a clean exit"
  }
]

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? STATS_CARDS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === STATS_CARDS.length - 1 ? 0 : prev + 1))
  }

  const currentCard = STATS_CARDS[activeIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--color-bg)',
        border: '1px solid rgba(26,25,23,0.12)',
        borderRadius: '16px',
        padding: 'clamp(40px, 5vw, 60px)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <img
              src={currentCard.logo}
              alt="Company logo"
              style={{
                height: '32px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'grayscale(100%) opacity(0.7)'
              }}
            />
          </div>

          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-text-dim)',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            {currentCard.headline}
          </p>

          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            marginBottom: '20px'
          }}>
            {currentCard.metric}
          </p>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '24px',
            fontWeight: 600
          }}>
            {currentCard.market}
          </p>

          <div style={{
            borderTop: '1px solid rgba(26,25,23,0.08)',
            paddingTop: '24px'
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--color-text-muted)',
              fontWeight: 400
            }}>
              {currentCard.story}
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '30px'
      }}>
        <button
          onClick={handlePrev}
          style={{
            background: 'transparent',
            border: '1px solid rgba(26,25,23,0.12)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'var(--color-text-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(26,25,23,0.04)'
            e.currentTarget.style.borderColor = 'rgba(26,25,23,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(26,25,23,0.12)'
          }}
          aria-label="Previous card"
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4L6 10L12 16" />
          </svg>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {STATS_CARDS.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                background: index === activeIndex ? 'var(--color-accent)' : 'rgba(26,25,23,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0
              }}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            background: 'transparent',
            border: '1px solid rgba(26,25,23,0.12)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'var(--color-text-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(26,25,23,0.04)'
            e.currentTarget.style.borderColor = 'rgba(26,25,23,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(26,25,23,0.12)'
          }}
          aria-label="Next card"
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 4L14 10L8 16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
