import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Problem } from '@/components/Problem'
import { Problems } from '@/components/Problems'
import { About } from '@/components/About'
import { Process } from '@/components/Process'
import { SectionOutcomes } from '@/components/SectionOutcomes'
import { SectionWhy } from '@/components/SectionWhy'
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
        <SectionOutcomes />
        <SectionWhy />
        <Work />
        {/* <Session /> */}
        <Chat />
      </main>
      <Footer />
    </>
  )
}
