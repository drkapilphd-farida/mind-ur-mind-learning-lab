import type { Metadata } from 'next'
import { buildFaqPageSchema } from '@/lib/seo/faqSchema'
import PrefrontalPowerNav from '@/components/prefrontal-power/PrefrontalPowerNav'
import PrefrontalPowerHero from '@/components/prefrontal-power/PrefrontalPowerHero'
import PrefrontalPowerProblem from '@/components/prefrontal-power/PrefrontalPowerProblem'
import PrefrontalPowerPromise from '@/components/prefrontal-power/PrefrontalPowerPromise'
import PrefrontalPowerModules from '@/components/prefrontal-power/PrefrontalPowerModules'
import PrefrontalPowerTestimonials from '@/components/prefrontal-power/PrefrontalPowerTestimonials'
import PrefrontalPowerMovers from '@/components/prefrontal-power/PrefrontalPowerMovers'
import PrefrontalPowerApplication from '@/components/prefrontal-power/PrefrontalPowerApplication'
import PrefrontalPowerPlan from '@/components/prefrontal-power/PrefrontalPowerPlan'
import PrefrontalPowerIncludes from '@/components/prefrontal-power/PrefrontalPowerIncludes'
import PrefrontalPowerTrainer from '@/components/prefrontal-power/PrefrontalPowerTrainer'
import PrefrontalPowerSchedule from '@/components/prefrontal-power/PrefrontalPowerSchedule'
import PrefrontalPowerFaq, { PREFRONTAL_POWER_FAQ_ITEMS } from '@/components/prefrontal-power/PrefrontalPowerFaq'
import PrefrontalPowerFinalCta from '@/components/prefrontal-power/PrefrontalPowerFinalCta'
import PrefrontalPowerStickyBar from '@/components/prefrontal-power/PrefrontalPowerStickyBar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'PREfrontal POWER Mumbai | One-Day Brain Training Workshop',
  description:
    'Join PREfrontal POWER in Mumbai on 27 September 2026 — a one-day, science-informed brain training workshop for focus, emotional regulation, clarity and better decision-making.',
  alternates: {
    canonical: '/prefrontal-power-mumbai',
  },
  openGraph: {
    title: 'PREfrontal POWER — Train Your Brain. Think Better. Live Better.',
    description:
      'A one-day experiential brain training workshop in Mumbai. Science-informed. Practical. Limited to 40 seats.',
    url: '/prefrontal-power-mumbai',
  },
}

// PREfrontal POWER V3™ — social proof moved ahead of the curriculum
// (Testimonials now sits right after Promise, before Modules/Movers/Plan)
// so a visitor sees real participant videos before being asked to read
// through workshop detail — per explicit "proof before a lot of workshop
// detail" instruction. Testimonials now uses 11 real, individually
// supplied YouTube Shorts (prefrontalPowerVideoReviews.ts), not the
// earlier QSR-program placeholder pool.
//
// The detailed 13-row timetable stays compact by default, full detail
// behind a <details> disclosure (see PrefrontalPowerSchedule.tsx), which
// now also carries the ₹3,500 price block.
//
// CTA discipline: exactly three placements (Hero, after Testimonials,
// Final CTA) plus the persistent mobile sticky bar — not sprinkled into
// every section, per explicit "do not overuse CTA" instruction.
//
// Still English-only (see PrefrontalPowerNav.tsx's own doc comment).
export default function PrefrontalPowerMumbaiPage(): React.JSX.Element {
  const faqSchema = buildFaqPageSchema([...PREFRONTAL_POWER_FAQ_ITEMS])

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <PrefrontalPowerNav />
      <main>
        <PrefrontalPowerHero />
        <PrefrontalPowerProblem />
        <PrefrontalPowerPromise />
        <PrefrontalPowerTestimonials />
        <PrefrontalPowerModules />
        <PrefrontalPowerMovers />
        <PrefrontalPowerPlan />
        <PrefrontalPowerApplication />
        <PrefrontalPowerIncludes />
        <PrefrontalPowerTrainer />
        <PrefrontalPowerSchedule />
        <PrefrontalPowerFaq />
        <PrefrontalPowerFinalCta />
      </main>
      <Footer />
      <PrefrontalPowerStickyBar />
    </div>
  )
}
