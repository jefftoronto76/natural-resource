import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Problem } from '@/components/Problem'
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
