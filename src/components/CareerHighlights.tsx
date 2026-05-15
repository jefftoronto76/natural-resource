'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type CardId =
  | 'trapeze'
  | 'york'
  | 'royalroads'
  | 'infor'
  | 'jhu'
  | 'keyhole'
  | 'mealgarden'
  | 'product-ai'

interface CompanyCard {
  kind: 'company'
  id: CardId
  logo: string
  year: string
  tagline: string
  metric: string
  metricLabel?: string
  title?: string
  outcome: string
}

interface EducationCard {
  kind: 'education'
  id: CardId
  logo: string[]
  year: string
  program: string
  focus: string
  coursework?: string
}

type Card = CompanyCard | EducationCard

const CARDS: Card[] = [
  {
    kind: 'company',
    id: 'trapeze',
    logo: '/logos/Trapeze.svg',
    year: '1998–2013',
    tagline: 'Struggling Provider → Trusted Partner',
    metric: '$350K → $25M',
    metricLabel: 'Annual Bookings',
    title: 'Director of Sales & Relationship Management',
    outcome: 'Led the sales transformation that helped establish Trapeze as industry leader.',
  },
  {
    kind: 'education',
    id: 'york',
    logo: ['/logos/York_University_Logo.svg'],
    year: '2011',
    program: "I've always been a strong seller. This taught me to lead sellers.",
    focus: 'Executive training in sales strategy, leadership, and executive presence. Learned to build revenue systems that make teams better and performance repeatable.',
  },
  {
    kind: 'education',
    id: 'royalroads',
    logo: ['/logos/royalroads_Logo.svg'],
    year: '2014–2015',
    program: "Most performance problems aren't skill problems. Cognitive coaching taught me to see the difference.",
    focus: 'ICF-certified executive coaching training focused on developing leaders who think clearly, take ownership, and help teams perform without constant direction.',
  },
  {
    kind: 'company',
    id: 'infor',
    logo: '/logos/Infor.svg',
    year: '2015–2017',
    tagline: 'Legacy Vendor → Viable Cloud Partner',
    metric: '$1.7M',
    metricLabel: 'Largest CloudSuite HCM deal',
    title: 'Account Executive, HCM',
    outcome: 'Built a $2.5M enterprise pipeline and closed a $1.7M CloudSuite HCM deal.',
  },
  {
    kind: 'education',
    id: 'jhu',
    logo: ['/logos/JohnHopkins_Logo.svg'],
    year: '2017',
    program: "Understanding ML and AI isn't optional anymore. This is where I built that foundation.",
    focus: 'Executive training in data science and analytics. Built a practical understanding of machine learning and how to guide product and operational decisions with data.',
  },
  {
    kind: 'company',
    id: 'keyhole',
    logo: '/logos/Keyhole.svg',
    year: '2017–2018',
    tagline: 'Self Service → Multi-Motion Revenue',
    metric: '3×',
    metricLabel: 'Average Deal Size',
    title: 'VP, Revenue',
    outcome: 'Transitioned the revenue model from PLG to inbound and enterprise.',
  },
  {
    kind: 'company',
    id: 'mealgarden',
    logo: '/logos/MealGarden.svg',
    year: '2019–2025',
    tagline: 'Stalled Product → Real Business',
    metric: '9×',
    metricLabel: 'ARR Growth',
    title: 'Head of Revenue, Product & Operations',
    outcome: 'Full P&L ownership across product, revenue, and operations. Turned a promising product into a real business.',
  },
  {
    kind: 'education',
    id: 'product-ai',
    logo: ['/logos/DesginLab_Logo.svg', '/logos/IDF_Logo.svg', '/logos/deeplearningai.svg'],
    year: '2023–2025',
    program: 'Product, UX & Applied AI',
    focus: 'Invested to build the judgment to lead at the intersection of commercial outcomes and product execution.',
    coursework: 'UX Foundations · Design Thinking · Technical Product Management · AI for Everyone · Building SaaS Products with AI · Structured Decision Making',
  },
]

type Filter = 'all' | 'roles' | 'education'

const labelStyle = {
  fontFamily: 'DM Mono, monospace',
  fontSize: '11px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-text-muted)',
  marginBottom: '12px',
}

const bodyParaStyle = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '14px',
  lineHeight: 1.7,
  color: 'var(--color-text-primary)',
  marginBottom: '16px',
}

const bodyParaLastStyle = { ...bodyParaStyle, marginBottom: 0 }

function ImpactList({ items }: { items: { bold: string; text: string }[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, idx) => (
        <li
          key={idx}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            lineHeight: 1.7,
            paddingLeft: '20px',
            position: 'relative',
            marginBottom: idx < items.length - 1 ? '16px' : '0',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              color: 'rgb(var(--color-accent))',
              fontWeight: 600,
            }}
          >
            ·
          </span>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.bold}</span>
          <br />
          <span style={{ color: 'var(--color-text-muted)' }}>{item.text}</span>
        </li>
      ))}
    </ul>
  )
}

function QuoteBlock({ quote, author }: { quote: string; author: string }) {
  return (
    <div
      style={{
        borderLeft: '2px solid rgb(var(--color-accent))',
        paddingLeft: '16px',
        marginBottom: '24px',
      }}
    >
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--color-text-primary)',
          fontStyle: 'italic',
          margin: 0,
        }}
      >
        “{quote}”
      </p>
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: '8px 0 0 0',
        }}
      >
        — {author}
      </p>
    </div>
  )
}

function TrapezeModalBody() {
  return (
    <>
      <QuoteBlock
        quote="He has proven repeatedly that he can perform in the most trying situations."
        author="Rick Bacchus, President, Trapeze Group North America"
      />
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          lineHeight: 1.7,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        Progressed from Special Projects to Director of Sales & Relationship Management, ultimately responsible for more than 50% of annual bookings in North America.
      </p>

      <div style={labelStyle}>Where It Started</div>
      <p style={bodyParaStyle}>Started part-time in Special Projects, supporting the executive team, reporting to the VP of Business Development (co-founder).</p>
      <p style={bodyParaStyle}>Built early CRM and pipeline discipline, supported executive decisions, and saw firsthand how Constellation operators run software businesses.</p>
      <p style={bodyParaLastStyle}>This is where I learned that great companies are built on discipline, focus, and consistent execution over time.</p>

      <div style={{ ...labelStyle, marginTop: '24px' }}>The Business</div>
      <p style={bodyParaStyle}>Mission-critical system-of-record technology supporting public transportation agencies across North America, spanning onboard systems, wireless infrastructure, hardware, and software.</p>
      <p style={bodyParaLastStyle}>Long sales cycles, complex stakeholders, and high switching costs, where costs, trust, execution, and consistency determine who wins.</p>

      <div style={{ ...labelStyle, marginTop: '24px' }}>Impact</div>
      <ImpactList
        items={[
          { bold: 'Scaled multiple revenue segments.', text: 'Led growth across small sector, SMB, enterprise, and partner channels.' },
          { bold: 'Led commercial integration through acquisition and leadership transitions.', text: 'Protecting the pipeline, revenue continuity, and customer relationships.' },
          { bold: 'Built repeatable commercial systems.', text: 'Implemented sales playbooks, onboarding programs, forecasting discipline, and win/loss processes.' },
          { bold: 'Operator and performer.', text: 'Consistently delivered as top individual contributor, top territory leader, top team leader, largest deals, and strongest quarters across roles.' },
          { bold: 'Built trusted enterprise relationships.', text: 'Developed executive-level customer relationships that positioned Trapeze as a long-term strategic partner for more than 70 of the top 200 key accounts.' },
        ]}
      />
    </>
  )
}

function InforModalBody() {
  return (
    <>
      <QuoteBlock
        quote="Despite early doubts, Jeff stayed with the opportunity, expanded the scope, and ultimately won a $1.75M CloudSuite deal in a highly competitive process. Real conviction and persistence."
        author="John Parsons, RVP Sales, Infor"
      />

      <div style={labelStyle}>Why Infor</div>
      <p style={bodyParaLastStyle}>Joined during Infor's transition from legacy ERP provider to cloud platform. Expanded CloudSuite adoption into both enterprise and mid-market organizations while building credibility in a highly structured Tier-1 sales environment.</p>

      <div style={{ ...labelStyle, marginTop: '24px' }}>The Business</div>
      <p style={bodyParaLastStyle}>Global vertical software provider transitioning to a cloud-first strategy. Led CloudSuite HCM growth in Canada. Introduced Talent Science as a strategic differentiator in complex enterprise sales.</p>

      <div style={{ ...labelStyle, marginTop: '24px' }}>Impact</div>
      <ImpactList
        items={[
          { bold: 'Built a $2.5M+ qualified pipeline in under 18 months.', text: 'Established and developed relationships with key enterprise accounts across Canada, engaging in multiple competitive RFP processes.' },
          { bold: 'Expanded cloud adoption into new customer segments.', text: 'Drove CloudSuite adoption in the 1,000–5,000 employee segment while also competing successfully in large enterprise opportunities.' },
          { bold: 'Closed the largest CloudSuite HCM deal in company history.', text: 'Transformed a narrow payroll evaluation into a full platform transformation — ~10,000 employees across HCM, Payroll, WFM, Talent Science, and Learning. Beat Dayforce in a head-to-head evaluation through persistence, preparation, and differentiated positioning.' },
        ]}
      />
    </>
  )
}

function KeyholeModalBody() {
  return (
    <>
      <QuoteBlock
        quote="Your question-based coaching had a huge impact on helping me think more creatively in the face of problems that seem unapproachable."
        author="Iara Rios, Manager, Content Marketing, Keyhole"
      />

      <div style={labelStyle}>The Mandate</div>
      <p style={bodyParaLastStyle}>Recruited by the CEO to rebuild revenue, increase deal size, and expand growth channels. Owned hiring, revenue structure, and growth investment decisions.</p>

      <div style={{ ...labelStyle, marginTop: '24px' }}>The Business</div>
      <p style={bodyParaLastStyle}>Product-led SaaS company providing social listening and analytics tools. Strong self-serve adoption but limited enterprise motion, fragmented demand generation, and no structured revenue architecture.</p>

      <div style={{ ...labelStyle, marginTop: '24px' }}>Impact</div>
      <ImpactList
        items={[
          { bold: 'Built a multi-motion revenue engine.', text: 'Added inbound, enterprise, and structured demand generation to complement PLG growth.' },
          { bold: 'Tripled average deal size.', text: 'Introduced qualification discipline, annual contracts, and enterprise sales structure.' },
          { bold: 'Expanded revenue ownership beyond sales.', text: 'Added customer success, demand generation, and pipeline development capabilities.' },
          { bold: 'Built commercial operating structure.', text: 'Introduced hiring plans, performance management, forecasting, and growth investment discipline.' },
          { bold: 'Connected customer insights directly to product and GTM decisions.', text: 'Partnered with the CEO to close the loop between customer feedback, product direction, and go-to-market execution.' },
        ]}
      />
    </>
  )
}

function MealGardenModalBody() {
  return (
    <>
      <QuoteBlock
        quote="Jeff gave me the confidence to get out there and make it happen — whether that meant making a phone call, trying an out-of-the-box idea, or asking for help."
        author="Kiki, Demand Generation Lead, Meal Garden"
      />

      <div style={labelStyle}>The Mandate</div>
      <p style={bodyParaLastStyle}>Recruited by the Founder to operationalize the business, introduce P&L discipline, and build the leadership and commercial foundation required to turn early traction into a sustainable company.</p>

      <div style={{ ...labelStyle, marginTop: '24px' }}>The Business</div>
      <p style={bodyParaLastStyle}>Consumer and B2B SaaS platform helping individuals, dietitians, and food businesses manage nutrition and meal planning. Early product-market fit but a small, high-churn user base, no operating infrastructure, commercial discipline, or path to sustainable unit economics.</p>

      <div style={{ ...labelStyle, marginTop: '24px' }}>Impact</div>
      <ImpactList
        items={[
          { bold: 'Introduced operating infrastructure from the ground up.', text: 'Introduced financial discipline, budget ownership, and performance cadence across revenue, product, and operations.' },
          { bold: 'Built enterprise and institutional partnerships.', text: 'Signed HEB (one of the largest grocery chains in the US), Nutrigenomix, and Metabolic Balance as white-label and teams channel partners.' },
          { bold: 'Created demand generation from scratch.', text: 'Hired and structured a team to drive awareness and trials, growing web traffic by triple digits.' },
          { bold: 'Expanded into new revenue channels.', text: 'Added teams, education, and platform partner motions — increasing deal size and shifting the base toward annual agreements.' },
          { bold: 'Spearheaded core product enhancements.', text: 'Drove delivery of payments, mobile, meal plan auto-generation, and enhanced food data — closing critical gaps for enterprise and practitioner use cases.' },
          { bold: 'Sustained strong conversion performance.', text: 'Maintained >18% trial-to-conversion through improved qualification, onboarding, and customer success.' },
        ]}
      />
    </>
  )
}

function ModalBodyById({ id }: { id: CardId }) {
  switch (id) {
    case 'trapeze':
      return <TrapezeModalBody />
    case 'infor':
      return <InforModalBody />
    case 'keyhole':
      return <KeyholeModalBody />
    case 'mealgarden':
      return <MealGardenModalBody />
    default:
      return null
  }
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      data-active={active}
      className="inline-flex items-center gap-2 px-[14px] py-2 rounded-full border cursor-pointer transition-[background-color,color,border-color] duration-200 data-[active=true]:bg-[rgb(var(--color-accent))] data-[active=true]:border-[rgb(var(--color-accent))] data-[active=true]:text-[rgb(var(--color-bg))] data-[active=false]:bg-transparent data-[active=false]:border-[rgb(26_25_23/0.12)] data-[active=false]:text-[rgb(26_25_23/0.7)] data-[active=false]:hover:border-[rgb(26_25_23/0.3)] data-[active=false]:hover:text-[rgb(26_25_23)]"
      style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {label}
      <span
        data-active={active}
        className="data-[active=true]:text-[rgb(var(--color-bg)/0.7)] data-[active=false]:text-[rgb(26_25_23/0.4)]"
        style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.06em',
          fontWeight: 600,
        }}
      >
        {count.toString().padStart(2, '0')}
      </span>
    </button>
  )
}

function CareerCard({ card, onOpen }: { card: Card; onOpen: () => void }) {
  const [hover, setHover] = useState(false)
  const isCompany = card.kind === 'company'

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={isCompany ? onOpen : undefined}
      style={{
        background: 'rgb(var(--color-surface))',
        border: '1px solid rgb(26 25 23 / 0.1)',
        borderRadius: 14,
        padding: 28,
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: isCompany ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        transform: hover && isCompany ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow:
          hover && isCompany
            ? '0 12px 32px rgb(26 25 23 / 0.08)'
            : '0 1px 0 rgb(26 25 23 / 0.02)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 22,
          fontFamily: 'DM Mono, monospace',
          fontSize: 10.5,
          color: 'rgb(26 25 23 / 0.32)',
          letterSpacing: '0.16em',
        }}
      >
        {card.year}
      </div>

      <div style={{ marginBottom: 22, height: 36, display: 'flex', alignItems: 'center' }}>
        {card.kind === 'education' ? (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {card.logo.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{ height: 26, width: 'auto', maxWidth: 80 }}
              />
            ))}
          </div>
        ) : (
          <img src={card.logo} alt="" style={{ height: 32, width: 'auto' }} />
        )}
      </div>

      {card.kind === 'company' ? (
        <>
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgb(var(--color-accent))',
              marginBottom: 18,
              letterSpacing: '0.01em',
              lineHeight: 1.45,
            }}
          >
            {card.tagline}
          </div>

          <div
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: card.metric.length > 8 ? 32 : 44,
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            {card.metric}
          </div>
          {card.metricLabel && (
            <div
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 12,
                color: 'rgb(26 25 23 / 0.5)',
                marginBottom: 18,
              }}
            >
              {card.metricLabel}
            </div>
          )}

          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--color-text-muted)',
              margin: 0,
              marginBottom: 'auto',
              textWrap: 'pretty',
            }}
          >
            {card.outcome}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 20,
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgb(var(--color-accent))',
              opacity: hover ? 1 : 0.75,
              transition: 'opacity 0.2s',
            }}
          >
            See more
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d={hover ? 'M4 8 H12 M9 5 L12 8 L9 11' : 'M4 6L8 10L12 6'} />
            </svg>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 13,
              color: 'rgb(var(--color-accent))',
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            {card.program}
          </div>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--color-text-muted)',
              margin: 0,
              marginBottom: 'auto',
              textWrap: 'pretty',
            }}
          >
            {card.focus}
          </p>
          {card.coursework && (
            <div
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10.5,
                lineHeight: 1.6,
                color: 'rgb(26 25 23 / 0.42)',
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px dashed rgb(26 25 23 / 0.12)',
              }}
            >
              {card.coursework}
            </div>
          )}
        </>
      )}
    </article>
  )
}

export function CareerHighlights() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<CardId | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const visible = useMemo(() => {
    if (filter === 'roles') return CARDS.filter((c) => c.kind === 'company')
    if (filter === 'education') return CARDS.filter((c) => c.kind === 'education')
    return CARDS
  }, [filter])

  const roleCount = CARDS.filter((c) => c.kind === 'company').length
  const eduCount = CARDS.filter((c) => c.kind === 'education').length
  const total = roleCount + eduCount

  const openCard = openId !== null ? CARDS.find((c) => c.id === openId) ?? null : null

  const openModal = (id: CardId) => {
    setOpenId(id)
    requestAnimationFrame(() => setModalVisible(true))
  }

  const closeModal = () => {
    setModalVisible(false)
    setTimeout(() => setOpenId(null), 200)
  }

  useEffect(() => {
    if (openId !== null) {
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal()
      }
      window.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', onKey)
      }
    }
    return undefined
  }, [openId])

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes career-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgb(26 25 23 / 0.42)',
            marginBottom: 14,
          }}
        >
          01 · Career Highlights
        </div>
        <h2
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(36px, 4vw, 52px)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            margin: 0,
            maxWidth: 720,
            textWrap: 'pretty',
          }}
        >
          Strong outcomes across{' '}
          <em style={{ color: 'rgb(var(--color-accent))', fontStyle: 'italic' }}>
            diverse businesses.
          </em>
        </h2>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: '1px solid rgb(26 25 23 / 0.12)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <FilterChip
            label="All"
            count={total}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterChip
            label="Roles"
            count={roleCount}
            active={filter === 'roles'}
            onClick={() => setFilter('roles')}
          />
          <FilterChip
            label="Education"
            count={eduCount}
            active={filter === 'education'}
            onClick={() => setFilter('education')}
          />
        </div>

        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            color: 'rgb(26 25 23 / 0.45)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Showing {visible.length.toString().padStart(2, '0')} of {total.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Grid */}
      <div
        key={filter}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{
          gap: 20,
          animation: 'career-fade-in 0.25s ease both',
        }}
      >
        {visible.map((card) => (
          <CareerCard key={card.id} card={card} onOpen={() => openModal(card.id)} />
        ))}
      </div>

      {/* Modal */}
      {openCard && openCard.kind === 'company' &&
        createPortal(
          <div
            onClick={closeModal}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgb(0 0 0 / 0.45)',
              backdropFilter: 'blur(2px)',
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
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgb(var(--color-surface))',
                borderRadius: '16px',
                maxWidth: '640px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                boxShadow: '0 8px 40px rgb(26 25 23 / 0.18)',
                padding: 'clamp(24px, 4vw, 40px)',
                position: 'relative',
                transform: modalVisible ? 'scale(1)' : 'scale(0.97)',
                transition: 'transform 0.25s cubic-bezier(.2,.7,.2,1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  gap: 16,
                }}
              >
                <div>
                  <img
                    src={openCard.logo}
                    alt=""
                    style={{ height: '36px', width: 'auto', display: 'block', marginBottom: 12 }}
                  />
                  <div
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 11,
                      letterSpacing: '0.18em',
                      color: 'rgb(26 25 23 / 0.5)',
                    }}
                  >
                    {openCard.year}
                    {openCard.title ? ` · ${openCard.title}` : ''}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  aria-label="Close"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgb(26 25 23 / 0.12)',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgb(26 25 23 / 0.55)',
                    flex: 'none',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgb(26 25 23 / 0.08)', paddingTop: 24 }}>
                <ModalBodyById id={openCard.id} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
