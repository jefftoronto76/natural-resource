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

function TrendingDownIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  )
}

function PowerOffIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <path d="M18.36 6.64a9 9 0 0 1 .55 11.54" />
      <path d="M6.26 18.14A9 9 0 0 1 7.74 5.86" />
      <line x1="2" y1="2" x2="22" y2="22" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  )
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function PackageXIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m7.5 4.27 9 5.15" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
      <line x1="17" y1="13" x2="22" y2="18" />
      <line x1="22" y1="13" x2="17" y2="18" />
    </svg>
  )
}

function MessageCircleQuestionIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function ReceiptIcon({ className }: IconProps) {
  return (
    <svg className={className} {...iconBaseProps}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  )
}

const CARDS = [
  { Icon: TrendingDownIcon, label: 'Pipeline not converting' },
  { Icon: PowerOffIcon, label: 'Deals being lost' },
  { Icon: UsersIcon, label: 'Teams not gaining momentum' },
  { Icon: PackageXIcon, label: 'Systems sold, but not delivered' },
  { Icon: MessageCircleQuestionIcon, label: 'Mystery churn' },
  { Icon: ReceiptIcon, label: 'Clients not paying' },
]

const CREDENTIALS = ['Revenue', 'Operations', 'Product', 'Leadership']

export function Problems() {
  return (
    <section id="problems" className="py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-text-dim)] mb-6">
          Root cause, not blame
        </p>

        <h2 className="font-display text-4xl md:text-5xl font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--color-text-primary)] mb-10">
          The problems I&apos;m built to solve.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARDS.map(({ Icon, label }) => (
            <div
              key={label}
              className="bg-surface rounded-xl border border-[color:var(--color-border)] p-7"
            >
              <Icon className="text-accent mb-5" />
              <p className="font-body text-base font-semibold leading-snug text-[color:var(--color-text-primary)]">
                {label}
              </p>
            </div>
          ))}
        </div>

        <p className="font-display italic text-lg md:text-xl leading-relaxed text-[color:var(--color-text-muted)] mt-12 max-w-3xl">
          Underneath all of it: relationships always win. Know your customer,
          understand their pains, help them win. That&apos;s the cornerstone of
          a durable business.
        </p>

        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-text-dim)] mt-8">
          {CREDENTIALS.map((c, i) => (
            <span key={c}>
              {c}
              {i < CREDENTIALS.length - 1 && (
                <span aria-hidden className="mx-2">
                  ·
                </span>
              )}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
