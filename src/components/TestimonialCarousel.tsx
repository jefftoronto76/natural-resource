'use client'

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
  quote?: string
  quoteAuthor?: string
}

const STATS_CARDS: StatsCard[] = [
  {
    logo: "/logos/Trapeze.svg",
    year: "2000",
    tagline: "Struggling Provider → Trusted Partner",
    metric: "$350K → $25M",
    outcome: "Led the sales transformation that helped establish Trapeze as industry leader.",
    story: "Started part-time as a data analyst working with the executive team, including Constellation Software CEO Mark Leonard, to help build an early CRM and reporting foundation.",
    details: [
      "Mission-critical vertical software business serving public transportation agencies across North America, with long sales cycles and complex stakeholder environments.",
      "Grew from an individual contributor to a sales leader over more than a decade",
      "Built and coached high-performing enterprise sales teams across North America",
      "Introduced sales systems, playbooks, onboarding, and win/loss processes",
      "Consistently achieved top performer or top performing team in terms of quota and forecast accuracy",
      "Built trusted advisor relationships with major enterprise customers and helped establish Trapeze as the market leader"
    ],
    quote: "He has proven repeatedly that he can perform in the most trying situations.",
    quoteAuthor: "Rick Bacchus, President, Trapeze Group North America"
  },
  {
    logo: "/logos/Infor.svg",
    year: "2015",
    tagline: "Legacy Vendor → Viable Cloud Partner",
    metric: "$1.7M",
    outcome: "Closed the largest HCM CloudSuite deal in Company history.",
    story: "Joined during Infor's push to expand cloud adoption and modernize its legacy ERP customer base.",
    details: [
      "Tier-1 enterprise software environment selling complex HCM transformation deals with long sales cycles, formal procurement, and executive stakeholders.",
      "Closed the largest CloudSuite HCM deal of all time (2018)",
      "Built $2M enterprise pipeline in 18 months",
      "Established credibility in a highly competitive Tier-1 environment",
      "Navigated complex enterprise buying committees and procurement processes"
    ],
    quote: "Dog with a bone. Awesome.",
    quoteAuthor: "John Parsons, Infor — on closing the largest CloudSuite HCM deal in company history"
  },
  {
    logo: "/logos/Keyhole.svg",
    year: "2017",
    tagline: "Self Service → PLG, Inbound & Enterprise",
    metric: "3×",
    metricLabel: "Deal Size",
    outcome: "Rebuilt the revenue team around deal qualification, annual contracts and demand gen.",
    story: "Recruited by the CEO to rebuild revenue, grow deal size, and expand growth channels; owned hiring and growth spend.",
    details: [
      "Product-led SaaS company with strong self-serve adoption but limited enterprise motion and no structured demand generation.",
      "Introduced inbound and enterprise revenue channels",
      "Added demand generation and customer success capability",
      "Consistently delivered +/- 10% of team sales quota",
      "Expanded scope from sales leadership into full revenue ownership",
      "Worked closely with CEO to build product-led feedback loops amongst the teams"
    ],
    quote: "Your question-based coaching had a huge impact on helping me think more creatively in the face of problems that seem unapproachable.",
    quoteAuthor: "Iara Rios, Keyhole"
  },
  {
    logo: "/logos/MealGarden.svg",
    year: "2019",
    tagline: "Stalled Product → Stable Business",
    metric: "9×",
    metricLabel: "ARR Growth",
    outcome: "GM-level ownership across P&L, product, sales, and demand generation.",
    story: "Recruited by the Founder to operationalize the business, establish P&L discipline, and build the leadership and commercial foundation for scale.",
    details: [
      "High-potential product with strong market fit but limited commercial structure and no integrated product-to-revenue operating model.",
      "Built and led Revenue, Product, and Operations",
      "Established P&L ownership and operating cadence",
      "Maintained >18% trial-to-conversion ratio over 5 years",
      "Built demand generation, onboarding, and customer success functions",
      "Rebuilt approach to product development, layering in structured feedback and a design resource"
    ],
    quote: "Jeff has been instrumental in moving Meal Garden forward.",
    quoteAuthor: "Vlad Chernenko, Founder, Meal Garden"
  }
]

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(3)
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
            maxHeight: isExpanded ? (activeIndex === 0 ? '2000px' : '800px') : '0',
            opacity: isExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.3s ease',
          }}>
            <div style={{
              borderTop: '1px solid rgba(26,25,23,0.08)',
              paddingTop: '24px',
              paddingBottom: '24px'
            }}>
              {activeIndex === 0 ? (
                <>
                  {/* Trapeze custom expanded content */}

                  {/* Quote block */}
                  <div style={{
                    borderLeft: '2px solid #2d6a4f',
                    paddingLeft: '16px',
                    marginBottom: '24px',
                  }}>
                    <p style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '16px',
                      lineHeight: 1.7,
                      color: 'var(--color-text-primary)',
                      fontStyle: 'italic',
                      margin: 0,
                    }}>
                      "He has proven repeatedly that he can perform in the most trying situations."
                    </p>
                    <p style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '14px',
                      color: 'var(--color-text-muted)',
                      marginTop: '8px',
                      margin: '8px 0 0 0',
                    }}>
                      — Rick Bacchus, President, Trapeze Group North America
                    </p>
                  </div>

                  {/* What Got Me There */}
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: '12px',
                  }}>
                    What Got Me There
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    My commercial training ground.
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    Started part-time in Special Projects, supporting the executive team, reporting to the VP of Business Development (co-founder).
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    Built early CRM and pipeline discipline, supported executive decisions, and saw firsthand how Constellation operators run software businesses.
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
                    This is where I learned that great companies are built on discipline, focus, and consistent execution over time.
                  </p>

                  {/* The Business */}
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginTop: '24px',
                    marginBottom: '12px',
                  }}>
                    The Business
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    Mission-critical system-of-record technology supporting public transportation agencies across North America, spanning onboard systems, wireless infrastructure, hardware, and software.
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
                    Long sales cycles, complex stakeholders, and high switching costs, where costs, trust, execution, and consistency determine who wins.
                  </p>

                  {/* Impact */}
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginTop: '24px',
                    marginBottom: '12px',
                  }}>
                    Impact
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {[
                      { bold: 'Scaled multiple revenue segments.', text: 'Led growth across small sector, SMB, enterprise, and partner channels.' },
                      { bold: 'Commercial leadership through acquisition integration.', text: 'Integrated acquired businesses across sales structure, territories, and customer relationships while protecting pipeline and revenue continuity.' },
                      { bold: 'Protected revenue during organizational change.', text: 'Ensured deals progressed and customers remained stable through ownership and structural transitions.' },
                      { bold: 'Built repeatable commercial systems.', text: 'Implemented sales playbooks, onboarding programs, forecasting discipline, and win/loss processes.' },
                      { bold: 'Operator and performer.', text: 'Consistently delivered as top individual contributor, top territory leader, top team leader, largest deals, and strongest quarters across roles.' },
                      { bold: 'Built trusted enterprise relationships.', text: 'Developed executive-level customer relationships that positioned Trapeze as a long-term strategic partner for more than 70 of the top 200 key accounts.' },
                    ].map((item, idx) => (
                      <li key={idx} style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '16px',
                        lineHeight: 1.7,
                        paddingLeft: '20px',
                        position: 'relative',
                        marginBottom: idx < 5 ? '16px' : '0',
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          color: '#2d6a4f',
                          fontWeight: 600,
                        }}>·</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.bold}</span>
                        <br />
                        <span style={{ color: 'var(--color-text-muted)' }}>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : currentCard.quote ? (
                <>
                  {/* WHAT GOT ME THERE section */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'rgba(26,25,23,0.5)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      WHAT GOT ME THERE
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '15px',
                      lineHeight: 1.7,
                      color: 'var(--color-text-muted)',
                      fontWeight: 400,
                      margin: 0
                    }}>
                      {currentCard.story}
                    </p>
                  </div>

                  {/* BUSINESS CONTEXT section */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'rgba(26,25,23,0.5)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      BUSINESS CONTEXT
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '15px',
                      lineHeight: 1.7,
                      color: 'var(--color-text-muted)',
                      fontWeight: 400,
                      margin: 0
                    }}>
                      {currentCard.details[0]}
                    </p>
                  </div>

                  {/* IMPACT section */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'rgba(26,25,23,0.5)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      IMPACT
                    </div>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {currentCard.details.slice(1).map((detail, idx) => (
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

                  {/* QUOTE section */}
                  <div>
                    <div style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'rgba(26,25,23,0.5)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      QUOTE
                    </div>
                    <div style={{
                      borderLeft: '3px solid #2d6a4f',
                      paddingLeft: '16px',
                      marginBottom: '8px'
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '15px',
                        lineHeight: 1.7,
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                        margin: 0
                      }}>
                        {currentCard.quote}
                      </p>
                    </div>
                    <div style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '11px',
                      color: 'rgba(26,25,23,0.5)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      paddingLeft: '16px'
                    }}>
                      {currentCard.quoteAuthor}
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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
