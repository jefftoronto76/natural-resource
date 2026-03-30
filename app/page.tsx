import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Problem } from '@/components/Problem'
import { WhyMe } from '@/components/WhyMe'
import { Results } from '@/components/Results'
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
        <WhyMe />
        <Results />
        <Work />
        {/* <Session /> */}
        <Chat />
      </main>
      <Footer />
    </>
  )
}
