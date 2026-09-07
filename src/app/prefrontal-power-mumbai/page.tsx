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

// PREfrontal POWER V2™ — a focused conversion + visual rewrite of the
// original 16-section page down to the 13-section architecture below.
// Trimmed hardest: the old full 13-row timetable (now compact by default,
// full detail behind a <details> disclosure — see PrefrontalPowerSchedule
// .tsx), the old standalone "Emotional Control" module tile (folded into
// the Promise/Application/Schedule sections instead), and the old "What
// This Is Not" section (dropped entirely, not part of this architecture).
// New: a mandatory real-video-testimonials section reusing the same
// already-vetted QSR_ADULT_VIDEO_REVIEWS pool via the shared
// VideoReviewGrid component — no new assets fabricated.
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
        <PrefrontalPowerModules />
        <PrefrontalPowerTestimonials />
        <PrefrontalPowerMovers />
        <PrefrontalPowerApplication />
        <PrefrontalPowerPlan />
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
