import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Problem } from '@/components/Problem'
import { Problems } from '@/components/Problems'
import { About } from '@/components/About'
import { Process } from '@/components/Process'
import { WhyMe } from '@/components/WhyMe'
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
        <Problems />
        <About />
        <Process />
        <WhyMe />
        <Work />
        {/* <Session /> */}
        <Chat />
      </main>
      <Footer />
    </>
  )
}
