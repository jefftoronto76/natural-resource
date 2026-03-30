import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Problem } from '@/components/Problem'
import { Results } from '@/components/Results'
import { WhyMe } from '@/components/WhyMe'
import { QuoteCarouselSection } from '@/components/QuoteCarouselSection'
import { Work } from '@/components/Work'
import { Session } from '@/components/Session'
import { Chat } from '@/components/Chat'
import { Footer } from '@/components/Footer'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Results />
        <WhyMe />
        <QuoteCarouselSection />
        <Work />
        <Session />
        <Chat />
      </main>
      <Footer />
    </>
  )
}
