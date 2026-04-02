'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface IntroCard {
  type: 'intro'
  headline: string
  subheader: string
}

interface StatsCard {
  type?: 'company'
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

interface EducationCard {
  type: 'education'
  logo: string | string[]
  year: string
  program: string
  focus: string
  coursework?: string
}

type CarouselCard = IntroCard | StatsCard | EducationCard

const CARDS: CarouselCard[] = [
  {
    type: 'intro',
    headline: 'Career Highlights',
    subheader: 'Strong outcomes across diverse businesses.',
  },
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
    type: 'education',
    logo: '/logos/York_University_Logo.svg',
    year: '2011',
    program: 'Certificate in Executive Sales Leadership',
    focus: 'Executive training in sales strategy, team leadership, and executive presence. Built the foundation for leading performance-driven revenue organizations.',
  },
  {
    type: 'education',
    logo: '/logos/royalroads_Logo.svg',
    year: '2014',
    program: 'Graduate Certificate in Executive Coaching',
    focus: 'ICF-certified executive coaching training focused on leadership judgment, team effectiveness, and developing accountable, high-trust organizations.',
  },
  {
    logo: "/logos/Infor.svg",
    year: "2015",
    tagline: "Legacy Vendor → Viable Cloud Partner",
    metric: "$1.7M",
    outcome: "Built a $2.5M enterprise pipeline and closed a landmark CloudSuite HCM project.",
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
    type: 'education',
    logo: '/logos/JohnHopkins_Logo.svg',
    year: '2017',
    program: 'Executive Data Science Specialization',
    focus: 'Executive training in data-driven leadership, analytics strategy, and using metrics to improve decision quality and operational execution.',
  },
  {
    logo: "/logos/Keyhole.svg",
    year: "2017",
    tagline: "Self Service → Multi-Motion Revenue",
    metric: "3×",
    metricLabel: "Deal Size",
    outcome: "Transitioned the revenue model from PLG to inbound and enterprise.",
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
    tagline: "Stalled Product → Real Business",
    metric: "9×",
    metricLabel: "ARR Growth",
    outcome: "Full P&L ownership across product, revenue, and operations. Turned a promising product into a real business.",
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
  },
  {
    type: 'education',
    logo: ['/logos/DesginLab_Logo.svg', '/logos/IDF_Logo.svg', '/logos/deeplearningai.svg'],
    year: '2023–2025',
    program: 'Product, UX & Applied AI',
    focus: 'Continuous education across UX foundations, design thinking, technical product management, SaaS product development, structured decision-making, and applied AI. Focused on strengthening modern product judgment and AI fluency.',
    coursework: 'UX Foundations · Design Thinking · Technical Product Management · AI for Everyone · Building SaaS Products with AI · Structured Decision Making',
  }
]

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const modalContentRef = useRef<HTMLDivElement>(null)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? CARDS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === CARDS.length - 1 ? 0 : prev + 1))
  }

  const openModal = (index: number) => {
    setModalIndex(index)
    requestAnimationFrame(() => setModalVisible(true))
  }

  const closeModal = () => {
    setModalVisible(false)
    setTimeout(() => setModalIndex(null), 200)
  }

  useEffect(() => {
    if (modalIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalIndex])

  const currentCard = CARDS[activeIndex]
  const isIntro = currentCard.type === 'intro'
  const isEducation = currentCard.type === 'education'
  const isCompany = !isIntro && !isEducation
  const modalCard = modalIndex !== null ? CARDS[modalIndex] as StatsCard : null

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
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
      }}>
        {/* Year stamp - company and education cards */}
        {!isIntro && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: 'rgba(26,25,23,0.25)',
            letterSpacing: '0.15em',
          }}>
            {(currentCard as StatsCard | EducationCard).year}
          </div>
        )}

        {/* Intro card content */}
        {isIntro && (
          <div>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#1a1917',
              marginBottom: 0,
            }}>
              {(currentCard as IntroCard).headline}
            </h2>
            <hr style={{
              border: 'none',
              borderTop: '1px solid #2d6a4f',
              margin: '16px 0',
            }} />
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'rgba(26,25,23,0.55)',
              margin: 0,
            }}>
              {(currentCard as IntroCard).subheader}
            </p>
          </div>
        )}

        {/* Education card content */}
        {isEducation && (
          <div>
            {/* Logo */}
            <div style={{ marginBottom: '20px' }}>
              {Array.isArray((currentCard as EducationCard).logo) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                  {((currentCard as EducationCard).logo as string[]).map((src, i, arr) => (
                    <img
                      key={i}
                      src={src}
                      alt="Institution logo"
                      style={{
                        height: '32px',
                        width: 'auto',
                        display: 'block',
                        flexShrink: 1,
                        ...(i === arr.length - 1 ? { maxWidth: '100px' } : {}),
                      }}
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={(currentCard as EducationCard).logo as string}
                  alt="Institution logo"
                  style={{
                    height: '40px',
                    width: 'auto',
                    display: 'block',
                  }}
                />
              )}
            </div>

            {/* Program name */}
            <p style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '14px',
              color: '#2d6a4f',
              marginBottom: '16px',
            }}>
              {(currentCard as EducationCard).program}
            </p>

            {/* Focus description */}
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '16px',
              color: 'var(--color-text-primary)',
              lineHeight: 1.7,
              marginBottom: '16px',
            }}>
              {(currentCard as EducationCard).focus}
            </p>

            {/* Coursework line */}
            {(currentCard as EducationCard).coursework && (
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                color: 'rgba(26,25,23,0.5)',
                lineHeight: 1.7,
                margin: 0,
              }}>
                {(currentCard as EducationCard).coursework}
              </p>
            )}
          </div>
        )}

        {/* Company card content */}
        {isCompany && <div>
          {/* Logo - left aligned */}
          <div style={{ marginBottom: '20px' }}>
            <img
              src={(currentCard as StatsCard).logo}
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
            {(currentCard as StatsCard).tagline.split('→').map((part, i, arr) => (
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
              fontSize: ((currentCard as StatsCard).logo === "/logos/Keyhole.svg" || (currentCard as StatsCard).logo === "/logos/MealGarden.svg")
                ? 'clamp(40px, 5vw, 64px)'
                : 'clamp(32px, 4vw, 48px)',
              fontWeight: 400,
              color: 'rgba(26,25,23,0.9)',
              lineHeight: 1.2,
            }}>
              {(currentCard as StatsCard).metric}
            </div>
            {(currentCard as StatsCard).metricLabel && (
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                color: 'rgba(26,25,23,0.5)',
                marginTop: '4px',
              }}>
                {(currentCard as StatsCard).metricLabel}
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
            {(currentCard as StatsCard).outcome}
          </p>

        </div>}

        {/* See More button - company cards only */}
        {isCompany && <button
          onClick={() => openModal(activeIndex)}
          style={{
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
          See more
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6L8 10L12 6" />
          </svg>
        </button>}
      </div>

      {/* Modal overlay */}
      {modalIndex !== null && modalCard && createPortal(
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: modalVisible ? 1 : 0,
            transition: 'opacity 0.2s ease',
            padding: '20px',
          }}
        >
          <div
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
              padding: 'clamp(24px, 4vw, 40px)',
              position: 'relative',
            }}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
              <img
                src={modalCard.logo}
                alt="Company logo"
                style={{ height: '40px', width: 'auto' }}
              />
              <button
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'rgba(26,25,23,0.5)',
                }}
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div style={{ borderTop: '1px solid rgba(26,25,23,0.08)', paddingTop: '24px' }}>
              {modalIndex === 1 ? (
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
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    My commercial training ground.
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    Started part-time in Special Projects, supporting the executive team, reporting to the VP of Business Development (co-founder).
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    Built early CRM and pipeline discipline, supported executive decisions, and saw firsthand how Constellation operators run software businesses.
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
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
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    Mission-critical system-of-record technology supporting public transportation agencies across North America, spanning onboard systems, wireless infrastructure, hardware, and software.
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
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
                        fontSize: '14px',
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
              ) : modalIndex === 4 ? (
                <>
                  {/* Infor custom expanded content */}

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
                      "Despite early doubts, Jeff stayed with the opportunity, expanded the scope, and ultimately won a $1.75M CloudSuite deal in a highly competitive process. Real conviction and persistence."
                    </p>
                    <p style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '14px',
                      color: 'var(--color-text-muted)',
                      margin: '8px 0 0 0',
                    }}>
                      — John Parsons, RVP Sales, Infor
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
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
                    Joined during Infor's transition from legacy ERP provider to cloud platform, helping expand CloudSuite adoption into both enterprise and mid-market organizations while building credibility in a highly structured Tier-1 sales environment.
                  </p>

                  {/* Market Context */}
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
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
                    Global vertical software provider transitioning to a cloud-first strategy. Led CloudSuite HCM growth in Canada, helping introduce Talent Science as a strategic differentiator in complex enterprise sales.
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
                      { bold: 'Built a $2.5M+ qualified pipeline in under 18 months.', text: 'Established and developed relationships with key enterprise accounts across Canada, engaging in multiple competitive RFP processes.' },
                      { bold: 'Expanded cloud adoption into new customer segments.', text: 'Helped drive CloudSuite adoption in the 1,000–5,000 employee segment while also competing successfully in large enterprise opportunities.' },
                      { bold: 'Closed the largest CloudSuite HCM deal in company history.', text: 'Transformed a narrow payroll evaluation into a full platform transformation — ~10,000 employees across HCM, Payroll, WFM, Talent Science, and Learning. Beat Dayforce in a head-to-head evaluation through persistence, preparation, and differentiated positioning.' },
                    ].map((item, idx) => (
                      <li key={idx} style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '14px',
                        lineHeight: 1.7,
                        paddingLeft: '20px',
                        position: 'relative',
                        marginBottom: idx < 2 ? '16px' : '0',
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
              ) : modalIndex === 6 ? (
                <>
                  {/* Keyhole custom expanded content */}

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
                      "Your question-based coaching had a huge impact on helping me think more creatively in the face of problems that seem unapproachable."
                    </p>
                    <p style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '14px',
                      color: 'var(--color-text-muted)',
                      margin: '8px 0 0 0',
                    }}>
                      — Iara Rios, Manager, Content Marketing, Keyhole
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
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
                    Recruited by the CEO to rebuild revenue, increase deal size, and expand growth channels. Owned hiring, revenue structure, and growth investment decisions.
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
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
                    Product-led SaaS company providing social listening and analytics tools. Strong self-serve adoption but limited enterprise motion, fragmented demand generation, and no structured revenue architecture.
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
                      { bold: 'Built a multi-motion revenue engine.', text: 'Added inbound, enterprise, and structured demand generation to complement PLG growth.' },
                      { bold: 'Tripled average deal size.', text: 'Introduced qualification discipline, annual contracts, and enterprise sales structure.' },
                      { bold: 'Expanded revenue ownership beyond sales.', text: 'Added customer success, demand generation, and pipeline development capabilities.' },
                      { bold: 'Built commercial operating structure.', text: 'Introduced hiring plans, performance management, forecasting, and growth investment discipline.' },
                      { bold: 'Connected customer insights directly to product and GTM decisions.', text: 'Partnered with the CEO to close the loop between customer feedback, product direction, and go-to-market execution.' },
                      { bold: 'Developed team capability while delivering results.', text: 'Grew individual contributors through operator-coach leadership while hitting revenue outcomes.' },
                    ].map((item, idx) => (
                      <li key={idx} style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '14px',
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
              ) : modalIndex === 7 ? (
                <>
                  {/* Meal Garden custom expanded content */}

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
                      "Jeff gave me the confidence to get out there and make it happen — whether that meant making a phone call, trying an out-of-the-box idea, or asking for help."
                    </p>
                    <p style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '14px',
                      color: 'var(--color-text-muted)',
                      margin: '8px 0 0 0',
                    }}>
                      — Kiki, Demand Generation Lead, Meal Garden
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
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
                    Recruited by the Founder to operationalize the business, introduce P&L discipline, and build the leadership and commercial foundation required to turn early traction into a sustainable company.
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
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: '0' }}>
                    Consumer and B2B SaaS platform helping individuals, dietitians, and food businesses manage nutrition and meal planning. Early product-market fit but a small, high-churn user base, no operating infrastructure, commercial discipline, or path to sustainable unit economics.
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
                      { bold: 'Built the operating infrastructure from the ground up.', text: 'Introduced financial discipline, budget ownership, and performance cadence across revenue, product, and operations.' },
                      { bold: 'Built enterprise and institutional partnerships.', text: 'Signed HEB (one of the largest grocery chains in the US), Nutrigenomix, and Metabolic Balance as white-label and teams channel partners.' },
                      { bold: 'Built demand generation from scratch.', text: 'Hired and structured a team to drive awareness and trials, growing web traffic by triple digits.' },
                      { bold: 'Expanded into new revenue channels.', text: 'Added teams, education, and platform partner motions — increasing deal size and shifting the base toward annual agreements.' },
                      { bold: 'Spearheaded core product enhancements.', text: 'Drove delivery of payments, mobile, meal plan auto-generation, and enhanced food data — closing critical gaps for enterprise and practitioner use cases.' },
                      { bold: 'Sustained strong conversion performance.', text: 'Maintained >18% trial-to-conversion through improved qualification, onboarding, and customer success.' },
                    ].map((item, idx) => (
                      <li key={idx} style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '14px',
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
              ) : modalCard.quote ? (
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
                      {modalCard.story}
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
                      {modalCard.details[0]}
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
                      {modalCard.details.slice(1).map((detail, idx) => (
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
                        {modalCard.quote}
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
                      {modalCard.quoteAuthor}
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
                    {modalCard.story}
                  </p>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {modalCard.details.map((detail, idx) => (
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
        </div>,
        document.body
      )}

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
          {CARDS.map((_, index) => (
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
