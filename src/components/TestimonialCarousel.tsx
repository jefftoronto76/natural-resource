import { useState } from 'react'

interface StatsCard {
  logo: string
  year: string
  tagline: string
  metric: string
  metricLabel?: string
  outcome: string
  story: string
  details: string[]
}

const STATS_CARDS: StatsCard[] = [
  {
    logo: "/logos/Trapeze.svg",
    year: "2000",
    tagline: "Struggling Provider → Trusted Partner",
    metric: "$350K → $25M",
    outcome: "Led the sales transformation that helped establish Trapeze as industry leader.",
    story: "13 successful years building commercial systems in the Constellation Software ecosystem",
    details: [
      "Full-cycle enterprise selling",
      "Multi-stakeholder procurement",
      "13 years in the Constellation Software ecosystem"
    ]
  },
  {
    logo: "/logos/Infor.svg",
    year: "2015",
    tagline: "Legacy Vendor → Viable Cloud Partner",
    metric: "$1.7M",
    outcome: "Closed the largest HCM CloudSuite deal in Company history.",
    story: "Closed the largest HCM CloudSuite deal in Canadian history in 2018",
    details: [
      "Largest CloudSuite HCM deal in Canada (2018)",
      "Built $5M enterprise pipeline in 18 months"
    ]
  },
  {
    logo: "/logos/Keyhole.svg",
    year: "2017",
    tagline: "Self Service → PLG, Inbound & Enterprise",
    metric: "3×",
    metricLabel: "Deal Size",
    outcome: "Rebuilt the revenue team around deal qualification, annual contracts and demand gen.",
    story: "Rebuilt the GTM motion, tripling deal size and unlocking enterprise revenue",
    details: [
      "Inbound growth motion",
      "Demand generation team build"
    ]
  },
  {
    logo: "/logos/MealGarden.svg",
    year: "2019",
    tagline: "Stalled Product → Stable Business",
    metric: "9×",
    metricLabel: "ARR Growth",
    outcome: "GM-level ownership across P&L, product, sales, and demand generation.",
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
        position: 'relative',
      }}>
        {/* Year stamp - absolute top right */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontFamily: 'DM Mono, monospace',
          fontSize: '11px',
          color: 'rgba(26,25,23,0.25)',
          letterSpacing: '0.15em',
        }}>
          {currentCard.year}
        </div>

        <div>
          {/* Logo - left aligned */}
          <div style={{ marginBottom: '20px' }}>
            <img
              src={currentCard.logo}
              alt="Company logo"
              style={{
                height: '40px',
                width: 'auto',
                display: 'block',
              }}
            />
          </div>

          {/* Tagline with arrow */}
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#2d6a4f',
            marginBottom: '24px',
            letterSpacing: '0.02em',
          }}>
            {currentCard.tagline.split('→').map((part, i, arr) => (
              <span key={i}>
                {part.trim()}
                {i < arr.length - 1 && (
                  <span style={{ color: '#2d6a4f', margin: '0 6px' }}>→</span>
                )}
              </span>
            ))}
          </p>

          {/* Metric - large hero number */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: (currentCard.logo === "/logos/Keyhole.svg" || currentCard.logo === "/logos/MealGarden.svg")
                ? 'clamp(40px, 5vw, 64px)'
                : 'clamp(32px, 4vw, 48px)',
              fontWeight: 400,
              color: 'rgba(26,25,23,0.9)',
              lineHeight: 1.2,
            }}>
              {currentCard.metric}
            </div>
            {currentCard.metricLabel && (
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                color: 'rgba(26,25,23,0.5)',
                marginTop: '4px',
              }}>
                {currentCard.metricLabel}
              </div>
            )}
          </div>

          {/* Outcome sentence */}
          <p style={{
            fontSize: '16px',
            color: 'rgba(26,25,23,0.6)',
            lineHeight: 1.7,
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: '24px',
          }}>
            {currentCard.outcome}
          </p>

          {/* Expandable section */}
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

        {/* See More toggle */}
        <button
          onClick={() => toggleExpanded(activeIndex)}
          style={{
            marginTop: isExpanded ? '16px' : '0',
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
