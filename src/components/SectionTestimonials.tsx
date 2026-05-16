'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

type Relationship = 'Executive' | 'Peer' | 'Direct Report' | 'Friend'

type Testimonial = {
  text: string
  author: string
  role: string | null
  company: string
  month: string
  year: string
  relationship: Relationship
  /** Filename in /public/headshots/, without extension. Omit to use initials. */
  headshot?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: 'His sharp listening skills are rare — a defining trait of what makes him a formidable manager and sales expert.',
    author: 'Diego Menchaca',
    role: 'Designer',
    company: 'Independent',
    month: 'Feb',
    year: '2025',
    relationship: 'Peer',
    headshot: 'diego-menchaca',
  },
  {
    text: 'I took that advice and went out guns blazing — #1 on my team and #2 in Canada.',
    author: 'Chris Chun',
    role: null,
    company: 'Intuit',
    month: 'Mar',
    year: '2019',
    relationship: 'Direct Report',
    headshot: 'chris-chun',
  },
  {
    text: 'He coached me around how to figure out the right questions to understand the needs of the customer.',
    author: 'Karl Shamatutu',
    role: null,
    company: 'Keyhole',
    month: 'Aug',
    year: '2019',
    relationship: 'Direct Report',
    headshot: 'karl-shamatutu',
  },
  {
    text: 'Gave me the confidence to get out there and make it happen.',
    author: 'Kiki Athanas',
    role: null,
    company: 'Meal Garden',
    month: 'Oct',
    year: '2019',
    relationship: 'Friend',
    headshot: 'kiki-athanas',
  },
  {
    text: 'You were committed to my success — you could see my strengths and weaknesses quickly, helped me find wins, and had patience where I was lacking.',
    author: 'Skyler Thompson',
    role: null,
    company: 'Keyhole',
    month: 'Jul',
    year: '2019',
    relationship: 'Direct Report',
    headshot: 'skyler-thompson',
  },
  {
    text: "A fantastic business coach who will help you or your company's business development skills increase dramatically.",
    author: 'Martin Burwell',
    role: null,
    company: 'Keyhole',
    month: 'Apr',
    year: '2018',
    relationship: 'Direct Report',
    headshot: 'martin-burwell',
  },
  {
    text: 'A very capable leader, an advocate for the customer base, and a true partner as we re-built our sales organization.',
    author: 'Jim Schnepp',
    role: 'VP Sales',
    company: 'Trapeze Group',
    month: 'Jun',
    year: '2015',
    relationship: 'Executive',
    headshot: 'jim-schnepp',
  },
  {
    text: 'He puts his own personality stamp on everything he does — which makes his contributions memorable and easy to appreciate.',
    author: 'Pepper Harward',
    role: 'Director',
    company: 'Enterprise Sales',
    month: 'Nov',
    year: '2012',
    relationship: 'Peer',
    headshot: 'pepper-harward',
  },
  {
    text: 'Once he has decided on a course of action, he is tenacious in executing and accomplishing those goals.',
    author: 'Colin McKenzie',
    role: 'General Manager',
    company: 'Trapeze Group',
    month: 'Sep',
    year: '2011',
    relationship: 'Executive',
    headshot: 'colin-mckenzie',
  },
]

const FILTERS = ['All', 'Executive', 'Peer', 'Direct Report', 'Friend'] as const
type Filter = (typeof FILTERS)[number]

// Per-relationship dot colour. On-palette, calm.
const RELATIONSHIP_DOT: Record<Relationship, string> = {
  Executive: 'bg-[#2D6A4F]',
  Peer: 'bg-[#526D82]',
  'Direct Report': 'bg-[#A8845A]',
  Friend: 'bg-[#785A8C]',
}

const COLLAPSED_COUNT = 3

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

function Avatar({ name, headshot }: { name: string; headshot?: string }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(headshot) && !failed

  return (
    <div
      aria-label={name}
      className="flex-none w-9 h-9 rounded-full overflow-hidden bg-[#E8E1CF] text-[color:var(--color-text-primary)] font-body font-semibold text-[12px] tracking-[0.02em] flex items-center justify-center select-none"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/headshots/${headshot}.jpg`}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden>{getInitials(name)}</span>
      )}
    </div>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: Filter
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'inline-flex items-center gap-2 rounded-full border font-mono text-[11px] tracking-[0.1em] uppercase px-3 pt-2 pb-[7px] transition-colors ' +
        (active
          ? 'bg-[color:var(--color-text-primary)] text-bg border-[color:var(--color-text-primary)]'
          : 'bg-surface text-[color:var(--color-text-primary)] border-[color:var(--color-border)] hover:bg-bg')
      }
    >
      {label !== 'All' && (
        <span
          aria-hidden
          className={
            'w-[7px] h-[7px] rounded-full ' +
            (active ? 'bg-bg' : RELATIONSHIP_DOT[label as Relationship])
          }
        />
      )}
      <span>{label}</span>
      <span className="opacity-60 tabular-nums text-[10px]">{count}</span>
    </button>
  )
}

function ReviewCard({
  q,
  className = '',
}: {
  q: Testimonial
  className?: string
}) {
  return (
    <article
      className={
        'bg-surface border border-[color:var(--color-border)] rounded-xl p-5 md:p-6 flex flex-col gap-3.5 shadow-[0_2px_14px_rgba(24,32,41,0.04)] ' +
        className
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[color:var(--color-text-muted)]">
          <span
            aria-hidden
            className={'w-1.5 h-1.5 rounded-full ' + RELATIONSHIP_DOT[q.relationship]}
          />
          {q.relationship}
        </span>
        <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-[color:var(--color-text-dim)]">
          {q.month} {q.year}
        </span>
      </div>

      <p className="font-body text-[15px] leading-[1.6] text-[color:var(--color-text-primary)] m-0 text-pretty">
        &ldquo;{q.text}&rdquo;
      </p>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 pt-3.5 border-t border-[color:var(--color-border)]">
        <Avatar name={q.author} headshot={q.headshot} />
        <div className="min-w-0 flex-1">
          <div className="font-body font-bold text-[14px] tracking-[-0.005em] text-[color:var(--color-text-primary)]">
            {q.author}
          </div>
          <div className="font-mono text-[10px] tracking-[0.04em] uppercase text-[color:var(--color-text-dim)] mt-0.5 truncate">
            {q.role ? `${q.role} · ${q.company}` : q.company}
          </div>
        </div>
        <span
          title="Verified"
          aria-label="Verified"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white flex-none"
        >
          <Check size={11} strokeWidth={2.4} aria-hidden />
        </span>
      </div>
    </article>
  )
}

export function SectionTestimonials() {
  const [active, setActive] = useState<Filter>('All')
  const [expanded, setExpanded] = useState(false)

  // Newest first.
  const ordered = [...TESTIMONIALS].sort(
    (a, b) => Number(b.year) - Number(a.year),
  )

  const counts: Record<Filter, number> = {
    All: ordered.length,
    Executive: 0,
    Peer: 0,
    'Direct Report': 0,
    Friend: 0,
  }
  for (const q of ordered) counts[q.relationship]++

  const visible =
    active === 'All' ? ordered : ordered.filter((q) => q.relationship === active)

  // Reset the mobile reveal whenever the filter changes.
  useEffect(() => {
    setExpanded(false)
  }, [active])

  const showMobileReveal = !expanded && visible.length > COLLAPSED_COUNT
  const hiddenOnMobile = Math.max(0, visible.length - COLLAPSED_COUNT)

  return (
    <section id="testimonials" className="py-16 px-6 md:px-12">
      <div className="max-w-[1100px] mx-auto">
        {/* Eyebrow */}
        <p className="font-mono text-[13.2px] tracking-[0.22em] uppercase text-[color:var(--color-text-dim)] mb-6 flex items-center gap-4">
          <span>Testimonials</span>
          <span
            aria-hidden
            className="flex-1 h-px bg-[color:var(--color-border)] max-w-[160px]"
          />
        </p>

        {/* Heading */}
        <h2 className="font-display text-[clamp(30px,4vw,52px)] font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--color-text-primary)] mb-5 text-balance max-w-[22ch]">
          From people who didn&apos;t have to{' '}
          <em className="italic font-normal text-accent">say anything.</em>
        </h2>

        {/* Subhead */}
        <p className="font-body text-[17px] leading-[1.55] text-[color:var(--color-text-muted)] mb-10 max-w-[56ch] text-pretty">
          Outcomes tell part of the story. The people who know me best tell the rest.
        </p>

        {/* Filter row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter testimonials by relationship">
            {FILTERS.map((f) => (
              <FilterPill
                key={f}
                label={f}
                count={counts[f]}
                active={active === f}
                onClick={() => setActive(f)}
              />
            ))}
          </div>
          <div
            className="font-mono text-[11px] tracking-[0.12em] uppercase text-[color:var(--color-text-dim)]"
            aria-live="polite"
          >
            Showing {visible.length} of {ordered.length}
          </div>
        </div>

        {/* Cards */}
        {visible.length > 0 ? (
          <>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visible.map((q, i) => (
                  <ReviewCard
                    key={`${active}-${q.author}-${i}`}
                    q={q}
                    // On mobile, hide cards past the collapsed count until expanded.
                    // On desktop (md+), always show every card.
                    className={
                      showMobileReveal && i >= COLLAPSED_COUNT
                        ? 'hidden md:flex'
                        : ''
                    }
                  />
                ))}
              </div>

              {/* Mobile fade overlay — only over the 3rd card, only when collapsed */}
              {showMobileReveal && (
                <div
                  aria-hidden
                  className="md:hidden pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg via-bg/85 to-transparent"
                />
              )}
            </div>

            {/* Mobile reveal CTA */}
            {showMobileReveal && (
              <div className="md:hidden mt-6 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-text-primary)] text-bg font-mono text-[11px] tracking-[0.16em] uppercase px-5 py-3 shadow-[0_6px_18px_rgba(24,32,41,0.18)]"
                >
                  Show all {visible.length} references
                  <ChevronDown size={12} strokeWidth={2.2} aria-hidden />
                </button>
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[color:var(--color-text-dim)]">
                  +{hiddenOnMobile} more hidden
                </span>
              </div>
            )}

            {/* Mobile collapse CTA */}
            {expanded && visible.length > COLLAPSED_COUNT && (
              <div className="md:hidden mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-surface border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] font-mono text-[10.5px] tracking-[0.14em] uppercase px-4 py-2.5"
                >
                  Collapse
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-9 text-center bg-surface border border-dashed border-[color:var(--color-border)] rounded-xl font-mono text-[11px] tracking-[0.08em] uppercase text-[color:var(--color-text-dim)]">
            No references in this group yet.
          </div>
        )}
      </div>
    </section>
  )
}
