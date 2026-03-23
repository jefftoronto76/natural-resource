import { CardRow } from './CardRow'
import { ServiceCard } from './ServiceCard'

const SERVICES = [
  {
    number: '01', title: '1-on-1 Coaching',
    audience: 'For ambitious professionals',
    body: 'For ambitious professionals who need help. I help you identify the root cause and build a practical plan to address it.',
    items: ['Pipeline management', 'Account strategy', 'Team dynamics', 'Leadership challenges', 'A bad project', 'A promotion you are working toward', 'Figuring out what is next'],
    tags: ['ICF-aligned', 'Outcome-defined', 'Built for self-sufficiency'],
  },
  {
    number: '02', title: 'Embedded Execution',
    audience: 'For founders, CEOs, and PE leaders',
    body: 'For organizations that need to move faster without breaking what they are building.',
    items: ['Systems that are not scaling', 'A pipeline that is not converting', 'An AI strategy that needs to get real', 'A project that has gone sideways', 'A leadership gap creating drag'],
    tags: ['Step in', 'Get aligned quickly', 'Leave the team stronger'],
  },
]

export function Work() {
  return (
    <CardRow
      id="work"
      label="Two Levers"
      headline="One operator. <em style='font-style:italic'>Two ways in.</em>"
      subheadline="Both lanes start with the same session. Tap a card to see the full picture."
      cardWidth={360}
    >
      {SERVICES.map(s => (
        <ServiceCard key={s.number} {...s} />
      ))}
    </CardRow>
  )
}
