type IconProps = { className?: string }

const iconBaseProps = {
  width: 36,
  height: 36,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function GlobeIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CalendarSyncIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M16 14a3 3 0 1 0 3 3" />
      <path d="m17 11 2 3-3 1" />
    </svg>
  )
}

function MessageSquareIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function DumbbellIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="5" y="10" width="2" height="4" rx="0.5" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <rect x="17" y="10" width="2" height="4" rx="0.5" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
    </svg>
  )
}

function NetworkIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <path d="M5 16v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
      <path d="M12 8v3" />
    </svg>
  )
}

const CARDS = [
  {
    Icon: GlobeIcon,
    label: 'Range',
    body:
      'From $40/month SaaS to $10M enterprise. Vertical markets to broad. I’ve been in it at every scale.',
  },
  {
    Icon: SearchIcon,
    label: 'Pattern recognition',
    body:
      'I find what’s actually limiting performance — not the symptom everyone’s pointing at.',
  },
  {
    Icon: CalendarSyncIcon,
    label: 'Player-coach',
    body:
      'In the boardroom and on the floor. I go where the work is.',
  },
  {
    Icon: MessageSquareIcon,
    label: 'Straight shooter',
    body:
      'You’ll always know where things stand. No spin, no surprises.',
  },
  {
    Icon: DumbbellIcon,
    label: 'High challenge, high support',
    body:
      'I care enough to push the work — and the people doing it — to get better.',
  },
  {
    Icon: NetworkIcon,
    label: 'Team autonomy',
    body:
      'Strong teams don’t rely on heroics. I help build clarity, ownership, and momentum that lasts.',
  },
]

export function About() {
  return (
    <section id="about" className="py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <p className="font-display italic text-lg md:text-xl leading-relaxed border-l-2 border-accent pl-4 text-[color:var(--color-text-muted)] mb-10 max-w-2xl">
          The people I&apos;ve led go on to outperform me. That&apos;s the goal.
        </p>

        <h2 className="font-display text-4xl md:text-5xl font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--color-text-primary)] mb-10">
          My Approach.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARDS.map(({ Icon, label, body }) => (
            <div
              key={label}
              className="bg-surface rounded-xl border border-[color:var(--color-border)] p-7"
            >
              <Icon className="text-accent mb-5" />
              <p className="font-body text-base font-semibold leading-snug text-[color:var(--color-text-primary)] mb-3">
                {label}
              </p>
              <p className="font-body text-[15px] leading-relaxed text-[color:var(--color-text-muted)]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
