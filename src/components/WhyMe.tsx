import { CardRow } from './CardRow'
import { StatCard } from './StatCard'
import { TimelineCard } from './TimelineCard'
import { QuoteCard } from './QuoteCard'
import { PhotoPanel } from './PhotoPanel'
import { useReveal } from '@/hooks/useReveal'

const STATS = [
  { value: '27', label: 'Years operating', company: 'Career', note: 'Over 27 years operating inside technology companies, scaling teams, revenue, and products across multiple verticals.' },
  { value: '$25M', label: 'Personal quota', company: 'Trapeze Group', note: 'Scaled personal quota from $350K to $25M over 13 years at Trapeze Group, Constellation Software first operating company.' },
  { value: '9x', label: 'ARR growth', company: 'Meal Garden', note: 'Drove ninefold ARR growth at Meal Garden through a product-led motion before negotiating a clean exit.' },
  { value: '$2.1M', label: 'Largest deal, Canada', company: 'Infor', note: 'Closed the largest enterprise deal in Infor Canada history by aligning stakeholders across a 3-year sales cycle.' },
]

const TIMELINE = [
  {
    year: '1998-2013', company: 'Trapeze Group', role: 'Account Manager to Sales Director',
    context: 'Constellation Software - first operating company',
    logoText: 'TG', isContinuation: false,
    milestones: [
      { label: 'Quota growth', value: '$350K to $25M' },
      { label: 'Tenure', value: '13 years' },
      { label: 'Markets', value: 'Transit, Rail' },
    ],
    note: 'Built the go-to-market foundation. Scaled from rep to director while maintaining top performer status every year. Rebuilt the team twice, both times delivering record growth.',
  },
  {
    year: '2014-2016', company: 'Infor', role: 'Senior Account Executive',
    context: 'Enterprise HCM and Workforce Management',
    logoText: 'IN', isContinuation: false,
    milestones: [
      { label: 'Largest deal in Canada', value: '$2.1M' },
      { label: 'Sales cycle', value: '3 years' },
      { label: 'Method', value: 'Strategic patience' },
    ],
    note: 'Spotted a WFM opportunity others dismissed as just payroll. Closed the largest Canadian deal in Infor history by aligning stakeholders over a 3-year cycle.',
  },
  {
    year: '2017-2019', company: 'Keyhole', role: 'Head of Revenue',
    context: 'Analytics SaaS - acquired by Muck Rack',
    logoText: 'KH', isContinuation: false,
    milestones: [
      { label: 'Deal size', value: '2x in 15 months' },
      { label: 'Key accounts', value: 'Spotify, UFC' },
      { label: 'Outcome', value: 'Acquisition' },
    ],
    note: 'Rebuilt the revenue team while maintaining 10-15% month-over-month growth. Closed marquee enterprise accounts. Company acquired by Muck Rack.',
  },
  {
    year: '2020-2022', company: 'Meal Garden', role: 'General Manager',
    context: 'Health tech SaaS - product-led growth',
    logoText: 'MG', isContinuation: false,
    milestones: [
      { label: 'ARR growth', value: '9x' },
      { label: 'Motion', value: 'Product-led' },
      { label: 'Outcome', value: 'Clean exit' },
    ],
    note: 'Took over a stalled product. Rebuilt pricing, marketing, and delivery simultaneously. Drove ninefold ARR growth through a PLG motion before negotiating a clean exit.',
  },
  {
    year: '2015 / 2023-', company: 'Natural Resource', role: 'Founder - Coach and Operator',
    context: 'Royal Roads University, ICF-aligned',
    logoText: 'NR', isContinuation: false,
    milestones: [
      { label: 'Credential', value: 'Graduate Certificate' },
      { label: 'Methodology', value: 'ICF-aligned' },
      { label: 'Focus', value: 'Revenue and Operations' },
    ],
    note: 'Graduate Certificate in Executive Coaching from Royal Roads University. Coaching ambitious professionals and operators while taking on embedded execution work.',
  },
]

const QUOTES_1 = [
  {
    quote: "I took that advice and went out guns blazing - number 1 on my team and number 2 in Canada.",
    name: "Chris Chun", role: "Account Executive", relationship: "Coached at Keyhole",
  },
  {
    quote: "Jeff proved himself to be a very capable leader, an advocate for the customer base, and a true partner as we re-built and reorganized our sales organization.",
    name: "Jim Schnepp", role: "VP Sales, Trapeze Group", relationship: "Direct manager",
  },
  {
    quote: "Jeff Lougheed has had the single most impact on the development of my career. Growing from an inside sales rep to an accomplished relationship manager.",
    name: "Brendan Samis", role: "Territory Manager", relationship: "Direct report, Trapeze",
  },
  {
    quote: "Jeff helped me with deal progression. He coached me around meeting execution and how to figure out the right questions to understand the needs of the customer.",
    name: "Karl Shamatutu", role: "Digital Transformation Strategist, Google", relationship: "Direct report, Keyhole",
  },
]

export function WhyMe() {
  const ref = useReveal()

  return (
    <>
      <section id="about" style={{ padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)', borderBottom: '1px solid rgba(26,25,23,0.08)' }}>
        <div ref={ref} className="reveal" style={{ maxWidth: '800px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            Why Me
            <span style={{ flex: 1, height: '1px', background: 'rgba(26,25,23,0.1)', maxWidth: '120px', display: 'block' }} />
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: '20px' }}>
            Built in the <em style={{ fontStyle: 'italic' }}>hard rooms.</em>
          </h2>
          <p style={{ fontSize: 'clamp(16px, 1.8vw, 18px)', lineHeight: 1.8, color: 'var(--color-text-muted)', maxWidth: '620px' }}>
            My operating approach was shaped inside Constellation Software where growth is earned through discipline, not narrative. Over 27 years I have scaled revenue, rebuilt teams, and delivered results across transit, analytics, health tech, and beyond.
          </p>
        </div>
      </section>

      <CardRow label="The numbers" cardWidth={260}>
        {STATS.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </CardRow>

      <PhotoPanel
        caption="27 years on the road. Transit systems, enterprise deals, and a lot of airports."
        side="right"
      />

      <CardRow
        label="Career"
        headline="The full picture."
        subheadline="Each stop shaped how I work. Tap any card for the story."
        cardWidth={300}
      >
        {TIMELINE.map((stop, i) => (
          <TimelineCard
            key={stop.company}
            {...stop}
            isLast={i === TIMELINE.length - 1}
          />
        ))}
      </CardRow>

      <CardRow
        label="What people say"
        headline="The people I have worked with."
        cardWidth={340}
      >
        {QUOTES_1.map(q => (
          <QuoteCard key={q.name} {...q} />
        ))}
      </CardRow>
    </>
  )
}
