'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

type FilterId = 'all' | 'roles' | 'education'

type RoleCard = {
  kind: 'role'
  id: string
  logo: string
  year: string
  tagline: string
  metric: string
  metricLabel?: string
  title?: string
  outcome: string
  story: string
  context: string
  impact: { bold: string; text: string }[]
  quote?: string
  quoteAuthor?: string
}

type EducationCard = {
  kind: 'education'
  id: string
  logo: string | string[]
  year: string
  program: string
  focus: string
  coursework?: string
}

type Card = RoleCard | EducationCard

const CARDS: Card[] = [
  {
    kind: 'role',
    id: 'trapeze',
    logo: '/logos/Trapeze.svg',
    year: '1998–2013',
    tagline: 'Struggling Provider → Trusted Partner',
    metric: '$350K → $25M',
    metricLabel: 'Annual Bookings',
    title: 'Director of Sales & Relationship Management',
    outcome:
      'Led the sales transformation that helped establish Trapeze as industry leader.',
    story:
      'Started part-time as a data analyst working with the executive team, including Constellation Software CEO Mark Leonard, to help build an early CRM and reporting foundation.',
    context:
      'Mission-critical vertical software business serving public transportation agencies across North America, with long sales cycles and complex stakeholder environments.',
    impact: [
      {
        bold: 'Scaled multiple revenue segments.',
        text: 'Led growth across small sector, SMB, enterprise, and partner channels.',
      },
      {
        bold: 'Led commercial integration through acquisition and leadership transitions.',
        text: 'Protecting the pipeline, revenue continuity, and customer relationships.',
      },
      {
        bold: 'Built repeatable commercial systems.',
        text: 'Implemented sales playbooks, onboarding programs, forecasting discipline, and win/loss processes.',
      },
      {
        bold: 'Operator and performer.',
        text: 'Consistently delivered as top individual contributor, top territory leader, top team leader, largest deals, and strongest quarters across roles.',
      },
      {
        bold: 'Built trusted enterprise relationships.',
        text: 'Executive-level customer relationships that positioned Trapeze as long-term strategic partner for more than 70 of the top 200 key accounts.',
      },
    ],
    quote: 'He has proven repeatedly that he can perform in the most trying situations.',
    quoteAuthor: 'Rick Bacchus, President, Trapeze Group North America',
  },
  {
    kind: 'education',
    id: 'york',
    logo: '/logos/York_University_Logo.svg',
    year: '2011',
    program: "I've always been a strong seller. This taught me to lead sellers.",
    focus:
      'Executive training in sales strategy, leadership, and executive presence. Learned to build revenue systems that make teams better and performance repeatable.',
  },
  {
    kind: 'education',
    id: 'royalroads',
    logo: '/logos/royalroads_Logo.svg',
    year: '2014–2015',
    program:
      "Most performance problems aren't skill problems. Cognitive coaching taught me to see the difference.",
    focus:
      'ICF-certified executive coaching training focused on developing leaders who think clearly, take ownership, and help teams perform without constant direction.',
  },
  {
    kind: 'role',
    id: 'infor',
    logo: '/logos/Infor.svg',
    year: '2015–2017',
    tagline: 'Legacy Vendor → Viable Cloud Partner',
    metric: '$1.7M',
    metricLabel: 'CloudSuite HCM Deal',
    title: 'Account Executive, HCM',
    outcome:
      'Built a $2.5M enterprise pipeline and closed a $1.7M CloudSuite HCM deal.',
    story:
      "Joined during Infor's push to expand cloud adoption and modernize its legacy ERP customer base.",
    context:
      'Tier-1 enterprise software environment selling complex HCM transformation deals with long sales cycles, formal procurement, and executive stakeholders.',
    impact: [
      {
        bold: 'Closed the largest CloudSuite HCM deal in company history.',
        text: 'Transformed a narrow payroll evaluation into a full platform transformation across HCM, Payroll, WFM, Talent Science, and Learning.',
      },
      {
        bold: 'Built $2.5M+ qualified pipeline in 18 months.',
        text: 'Established relationships with key enterprise accounts across Canada and competed in multiple RFP processes.',
      },
      {
        bold: 'Expanded cloud adoption into new customer segments.',
        text: 'Drove CloudSuite adoption in the 1,000–5,000 employee segment while competing successfully in large enterprise opportunities.',
      },
    ],
    quote: 'Dog with a bone. Awesome.',
    quoteAuthor:
      'John Parsons, Infor — on closing the largest CloudSuite HCM deal in company history',
  },
  {
    kind: 'education',
    id: 'jhu',
    logo: '/logos/JohnHopkins_Logo.svg',
    year: '2017',
    program:
      "Understanding ML and AI isn't optional anymore. This is where I built that foundation.",
    focus:
      'Executive training in data science and analytics. Built a practical understanding of machine learning and how to guide product and operational decisions with data.',
  },
  {
    kind: 'role',
    id: 'keyhole',
    logo: '/logos/Keyhole.svg',
    year: '2017–2018',
    tagline: 'Self Service → Multi-Motion Revenue',
    metric: '3×',
    metricLabel: 'Deal Size',
    title: 'VP, Revenue',
    outcome: 'Transitioned the revenue model from PLG to inbound and enterprise.',
    story:
      'Recruited by the CEO to rebuild revenue, grow deal size, and expand growth channels; owned hiring and growth spend.',
    context:
      'Product-led SaaS company with strong self-serve adoption but limited enterprise motion and no structured demand generation.',
    impact: [
      {
        bold: 'Built a multi-motion revenue engine.',
        text: 'Added inbound, enterprise, and structured demand generation to complement PLG growth.',
      },
      {
        bold: 'Tripled average deal size.',
        text: 'Introduced qualification discipline, annual contracts, and enterprise sales structure.',
      },
      {
        bold: 'Expanded revenue ownership beyond sales.',
        text: 'Added customer success, demand generation, and pipeline development capabilities.',
      },
      {
        bold: 'Connected customer insights directly to product and GTM decisions.',
        text: 'Partnered with the CEO to close the loop between customer feedback, product direction, and execution.',
      },
    ],
    quote:
      'Your question-based coaching had a huge impact on helping me think more creatively in the face of problems that seem unapproachable.',
    quoteAuthor: 'Iara Rios, Keyhole',
  },
  {
    kind: 'role',
    id: 'mealgarden',
    logo: '/logos/MealGarden.svg',
    year: '2019–2025',
    tagline: 'Stalled Product → Real Business',
    metric: '9×',
    metricLabel: 'ARR Growth',
    title: 'Head of Revenue, Product & Operations',
    outcome:
      'Full P&L ownership across product, revenue, and operations. Turned a promising product into a real business.',
    story:
      'Recruited by the Founder to operationalize the business, establish P&L discipline, and build the leadership and commercial foundation for scale.',
    context:
      'High-potential product with strong market fit but limited commercial structure and no integrated product-to-revenue operating model.',
    impact: [
      {
        bold: 'Introduced operating infrastructure from the ground up.',
        text: 'Financial discipline, budget ownership, and performance cadence across revenue, product, and operations.',
      },
      {
        bold: 'Built enterprise and institutional partnerships.',
        text: 'Signed HEB, Nutrigenomix, and Metabolic Balance as white-label and teams channel partners.',
      },
      {
        bold: 'Created demand generation from scratch.',
        text: 'Hired and structured a team that grew web traffic by triple digits.',
      },
      {
        bold: 'Sustained strong conversion performance.',
        text: 'Maintained >18% trial-to-conversion through improved qualification, onboarding, and customer success.',
      },
    ],
    quote: 'Jeff has been instrumental in moving Meal Garden forward.',
    quoteAuthor: 'Vlad Chernenko, Founder, Meal Garden',
  },
  {
    kind: 'education',
    id: 'product-ai',
    logo: [
      '/logos/DesignLab_Logo.svg',
      '/logos/IDF_Logo.svg',
      '/logos/deeplearningai.svg',
    ],
    year: '2023–2025',
    program: 'Product, UX & Applied AI',
    focus:
      'Invested to build the judgment to lead at the intersection of commercial outcomes and product execution.',
    coursework:
      'UX Foundations · Design Thinking · Technical Product Management · AI for Everyone · Building SaaS Products with AI · Structured Decision Making',
  },
]

const ROLE_COUNT = CARDS.filter((c) => c.kind === 'role').length
const EDU_COUNT = CARDS.filter((c) => c.kind === 'education').length

export function SectionCareer() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [modalRoleId, setModalRoleId] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [mobileShowAll, setMobileShowAll] = useState(false)

  const visible = CARDS.filter((c) => {
    if (filter === 'roles') return c.kind === 'role'
    if (filter === 'education') return c.kind === 'education'
    return true
  })

  const openModal = (id: string) => {
    setModalRoleId(id)
    requestAnimationFrame(() => setModalVisible(true))
  }

  const closeModal = () => {
    setModalVisible(false)
    setTimeout(() => setModalRoleId(null), 200)
  }

  useEffect(() => {
    if (modalRoleId !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalRoleId])

  const setFilterAndReset = (id: FilterId) => {
    setFilter(id)
    setMobileShowAll(false)
    setModalVisible(false)
    setModalRoleId(null)
  }

  const modalCard =
    modalRoleId !== null
      ? (CARDS.find((c) => c.kind === 'role' && c.id === modalRoleId) as
          | RoleCard
          | undefined)
      : null

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: ROLE_COUNT + EDU_COUNT },
    { id: 'roles', label: 'Roles', count: ROLE_COUNT },
    { id: 'education', label: 'Education', count: EDU_COUNT },
  ]

  const hiddenOnMobile = Math.max(0, visible.length - 2)

  return (
    <section id="career" className="bg-[color:var(--color-surface)] py-16 px-6 md:px-12">
      <div className="max-w-[1100px] mx-auto">
        {/* Eyebrow */}
        <p className="font-mono text-[13.2px] tracking-[0.22em] uppercase text-[color:var(--color-text-dim)] mb-6 flex items-center gap-4">
          <span>Career Highlights</span>
          <span
            aria-hidden
            className="flex-1 h-px bg-[color:var(--color-border)] max-w-[160px]"
          />
        </p>

        {/* Headline */}
        <h2 className="font-display text-[clamp(30px,4vw,52px)] font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--color-text-primary)] mb-10 md:mb-14 text-balance max-w-[22ch]">
          Strong outcomes across{' '}
          <em className="italic font-normal text-accent">diverse businesses.</em>
        </h2>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7 md:mb-10 pb-5 border-b border-[color:var(--color-border)]">
          <div
            className="flex gap-2 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible md:flex-wrap"
            role="tablist"
            aria-label="Filter career cards"
          >
            {filters.map((f) => {
              const active = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilterAndReset(f.id)}
                  className={[
                    'flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border font-body text-[13px] font-medium transition-colors whitespace-nowrap',
                    active
                      ? 'bg-accent border-accent text-bg'
                      : 'bg-transparent border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-hover)] hover:text-[color:var(--color-text-primary)]',
                  ].join(' ')}
                >
                  {f.label}
                  <span
                    className={[
                      'font-mono text-[10px] tracking-[0.06em] font-semibold',
                      active ? 'text-bg/70' : 'text-[color:var(--color-text-dim)]',
                    ].join(' ')}
                  >
                    {f.count.toString().padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="hidden md:block font-mono text-[11px] tracking-[0.16em] uppercase text-[color:var(--color-text-dim)]">
            Showing {visible.length.toString().padStart(2, '0')} of{' '}
            {(ROLE_COUNT + EDU_COUNT).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {visible.map((card, i) => {
            // On mobile: hide cards beyond the first 2 unless mobileShowAll is on.
            // On md+ always shown.
            const hideOnMobile = !mobileShowAll && i >= 2
            return (
              <div
                key={card.id}
                className={hideOnMobile ? 'hidden md:block' : 'block'}
              >
                {card.kind === 'role' ? (
                  <RoleCardView
                    card={card}
                    onOpen={() => openModal(card.id)}
                  />
                ) : (
                  <EducationCardView card={card} />
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile reveal control */}
        {hiddenOnMobile > 0 && !mobileShowAll && (
          <div className="md:hidden relative -mt-20 pt-20 pointer-events-none bg-gradient-to-b from-transparent via-bg/80 to-bg">
            <button
              type="button"
              onClick={() => setMobileShowAll(true)}
              className="pointer-events-auto w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-accent text-bg font-body text-sm font-semibold border border-accent active:scale-[0.98] transition-transform"
            >
              Show {hiddenOnMobile} more
              <span className="font-mono text-[10px] tracking-[0.12em] font-medium opacity-70">
                02 / {visible.length.toString().padStart(2, '0')}
              </span>
            </button>
          </div>
        )}

        {hiddenOnMobile > 0 && mobileShowAll && (
          <button
            type="button"
            onClick={() => setMobileShowAll(false)}
            className="md:hidden mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] font-body text-[13px] font-medium"
          >
            Show less
            <ChevronUp size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {modalCard &&
        typeof document !== 'undefined' &&
        createPortal(
          <RoleModal
            card={modalCard}
            visible={modalVisible}
            onClose={closeModal}
          />,
          document.body,
        )}
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */
/*  Role card                                                  */
/* ─────────────────────────────────────────────────────────── */

function RoleCardView({
  card,
  onOpen,
}: {
  card: RoleCard
  onOpen: () => void
}) {
  const longMetric = card.metric.length > 8
  return (
    <article className="relative flex flex-col h-full bg-surface border border-[color:var(--color-border)] rounded-2xl p-6 md:p-7 transition-shadow hover:shadow-[0_12px_32px_rgba(26,25,23,0.08)]">
      <span className="absolute top-5 right-5 font-mono text-[10.5px] tracking-[0.16em] text-[color:var(--color-text-dim)]">
        {card.year}
      </span>

      <div className="mb-5 h-9 flex items-center">
        <img src={card.logo} alt="" className="h-7 md:h-8 w-auto" />
      </div>

      <p className="font-mono text-[13px] font-semibold text-accent leading-snug mb-4">
        {card.tagline}
      </p>

      <div
        className={[
          'font-display font-normal text-[color:var(--color-text-primary)] leading-[1.1] mb-1',
          longMetric ? 'text-3xl' : 'text-[44px]',
        ].join(' ')}
      >
        {card.metric}
      </div>
      {card.metricLabel && (
        <div className="font-body text-xs text-[color:var(--color-text-dim)] mb-4">
          {card.metricLabel}
        </div>
      )}

      {card.title && (
        <p className="font-body text-[12.5px] text-[color:var(--color-text-dim)] mb-3">
          {card.title}
        </p>
      )}

      <p className="font-body text-sm leading-relaxed text-[color:var(--color-text-muted)] text-pretty mb-4">
        {card.outcome}
      </p>

      <button
        type="button"
        onClick={onOpen}
        className="mt-auto pt-4 flex items-center gap-2 font-body text-[13px] font-semibold text-accent hover:opacity-80 transition-opacity self-start"
      >
        See more
        <ChevronDown size={14} strokeWidth={2} />
      </button>
    </article>
  )
}

/* ─────────────────────────────────────────────────────────── */
/*  Role modal                                                 */
/* ─────────────────────────────────────────────────────────── */

function RoleModal({
  card,
  visible,
  onClose,
}: {
  card: RoleCard
  visible: boolean
  onClose: () => void
}) {
  return (
    <div
      onClick={onClose}
      role="presentation"
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
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${card.tagline} — career detail`}
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
        <div className="flex items-center justify-between mb-6">
          <img src={card.logo} alt="" className="h-10 w-auto" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="bg-transparent border-0 cursor-pointer p-1 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <div className="border-t border-[color:var(--color-border)] pt-6 flex flex-col gap-5">
          <ExpandBlock label="What got me there" body={card.story} />
          <ExpandBlock label="Business context" body={card.context} />

          <div>
            <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-[color:var(--color-text-dim)] mb-2.5">
              Impact
            </div>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {card.impact.map((item, idx) => (
                <li
                  key={idx}
                  className="relative pl-5 font-body text-[13.5px] leading-relaxed text-pretty"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 text-accent font-semibold"
                  >
                    ·
                  </span>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">
                    {item.bold}
                  </span>{' '}
                  <span className="text-[color:var(--color-text-muted)]">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {card.quote && (
            <div className="border-l-2 border-accent pl-4">
              <p className="font-display italic text-[15px] leading-relaxed text-[color:var(--color-text-primary)] m-0">
                &ldquo;{card.quote}&rdquo;
              </p>
              {card.quoteAuthor && (
                <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-[color:var(--color-text-dim)] mt-2 m-0">
                  — {card.quoteAuthor}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ExpandBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-[color:var(--color-text-dim)] mb-2.5">
        {label}
      </div>
      <p className="font-body text-[13.5px] leading-relaxed text-[color:var(--color-text-muted)] text-pretty m-0">
        {body}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── */
/*  Education card                                             */
/* ─────────────────────────────────────────────────────────── */

function EducationCardView({ card }: { card: EducationCard }) {
  return (
    <article className="relative flex flex-col h-full bg-surface border border-[color:var(--color-border)] rounded-2xl p-6 md:p-7">
      <span className="absolute top-5 right-5 font-mono text-[10.5px] tracking-[0.16em] text-[color:var(--color-text-dim)]">
        {card.year}
      </span>

      <div className="mb-5 h-9 flex items-center">
        {Array.isArray(card.logo) ? (
          <div className="flex items-center gap-3.5 flex-wrap">
            {card.logo.map((src, i) => (
              <img key={i} src={src} alt="" className="h-6 w-auto max-w-[80px]" />
            ))}
          </div>
        ) : (
          <img src={card.logo} alt="" className="h-8 w-auto" />
        )}
      </div>

      <p className="font-mono text-[13px] text-accent leading-snug mb-4">
        {card.program}
      </p>

      <p className="font-body text-sm leading-relaxed text-[color:var(--color-text-muted)] text-pretty mb-auto">
        {card.focus}
      </p>

      {card.coursework && (
        <div className="mt-4 pt-4 border-t border-dashed border-[color:var(--color-border)] font-mono text-[10.5px] leading-relaxed text-[color:var(--color-text-dim)]">
          {card.coursework}
        </div>
      )}
    </article>
  )
}
