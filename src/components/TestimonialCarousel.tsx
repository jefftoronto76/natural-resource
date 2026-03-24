import { useState } from 'react'

interface StatsCard {
  logo: string
  headline: string
  metric: string
  tagline: string
  story: string
  details: string[]
}

const STATS_CARDS: StatsCard[] = [
  {
    logo: "/logos/Trapeze.svg",
    headline: "MARKET DOMINANCE",
    metric: "$350K → $25M",
    tagline: "Mission-critical B2G enterprise infrastructure",
    story: "13 successful years building commercial systems in the Constellation Software ecosystem",
    details: [
      "Full-cycle enterprise selling",
      "Multi-stakeholder procurement",
      "13 years in the Constellation Software ecosystem"
    ]
  },
  {
    logo: "/logos/Infor.svg",
    headline: "ENTERPRISE BREAKTHROUGH",
    metric: "$1.7M",
    tagline: "Tier-1 enterprise HCM SaaS",
    story: "Closed the largest HCM CloudSuite deal in Canadian history in 2018",
    details: [
      "Largest CloudSuite HCM deal in Canada (2018)",
      "Built $5M enterprise pipeline in 18 months"
    ]
  },
  {
    logo: "/logos/keyhole.svg",
    headline: "REVENUE MODEL TRANSFORMATION",
    metric: "3× Deal Size",
    tagline: "B2B social analytics SaaS",
    story: "Rebuilt the GTM motion, tripling deal size and unlocking enterprise revenue",
    details: [
      "Inbound growth motion",
      "Demand generation team build"
    ]
  },
  {
    logo: "/logos/mealgarden.svg",
    headline: "PLG SCALE & GROWTH",
    metric: "9× ARR Growth",
    tagline: "B2B2C marketplace",
    story: "Took a stalled product to ninefold ARR growth before a clean exit",
    details: [
      "Led Revenue, Product, and Operations",
      "Turned stalled product into growth engine"
    ]
  }
]

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? STATS_CARDS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === STATS_CARDS.length - 1 ? 0 : prev + 1))
  }

  const toggleExpanded = (index: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const currentCard = STATS_CARDS[activeIndex]
  const isExpanded = expandedCards.has(activeIndex)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--color-bg)',
        border: '1px solid rgba(26,25,23,0.12)',
        borderRadius: '16px',
        padding: 'clamp(40px, 5vw, 60px)',
        display: 'flex',
        flexDirection: 'column',
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
                objectFit: 'contain'
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
            {currentCard.tagline}
          </p>

          <div style={{
            maxHeight: isExpanded ? '500px' : '0',
            opacity: isExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.3s ease',
          }}>
            <div style={{
              borderTop: '1px solid rgba(26,25,23,0.08)',
              paddingTop: '24px',
              paddingBottom: '24px'
            }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
                fontWeight: 400,
                marginBottom: '20px'
              }}>
                {currentCard.story}
              </p>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {currentCard.details.map((detail, idx) => (
                  <li key={idx} style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: 'var(--color-text-muted)',
                    paddingLeft: '20px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: 'var(--color-accent)',
                      fontWeight: 600
                    }}>·</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => toggleExpanded(activeIndex)}
          style={{
            marginTop: isExpanded ? '16px' : '24px',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0',
            transition: 'opacity 0.2s ease',
            alignSelf: 'flex-start'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          {isExpanded ? 'See less' : 'See more'}
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
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <path d="M4 6L8 10L12 6" />
          </svg>
        </button>
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
