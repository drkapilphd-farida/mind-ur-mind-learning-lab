import type { Metadata } from 'next'
import { buildFaqPageSchema } from '@/lib/seo/faqSchema'
import PrefrontalPowerNav from '@/components/prefrontal-power/PrefrontalPowerNav'
import PrefrontalPowerHero from '@/components/prefrontal-power/PrefrontalPowerHero'
import PrefrontalPowerProblem from '@/components/prefrontal-power/PrefrontalPowerProblem'
import PrefrontalPowerScience from '@/components/prefrontal-power/PrefrontalPowerScience'
import PrefrontalPowerModules from '@/components/prefrontal-power/PrefrontalPowerModules'
import PrefrontalPowerMovers from '@/components/prefrontal-power/PrefrontalPowerMovers'
import PrefrontalPowerApplication from '@/components/prefrontal-power/PrefrontalPowerApplication'
import PrefrontalPowerPlan from '@/components/prefrontal-power/PrefrontalPowerPlan'
import PrefrontalPowerIncludes from '@/components/prefrontal-power/PrefrontalPowerIncludes'
import PrefrontalPowerNotThis from '@/components/prefrontal-power/PrefrontalPowerNotThis'
import PrefrontalPowerTrainer from '@/components/prefrontal-power/PrefrontalPowerTrainer'
import PrefrontalPowerSchedule from '@/components/prefrontal-power/PrefrontalPowerSchedule'
import PrefrontalPowerTrust from '@/components/prefrontal-power/PrefrontalPowerTrust'
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

// PREfrontal POWER — Mumbai Workshop Landing Page™. English-only launch
// (confirmed with the site owner: premium-editorial English for a Mumbai
// professional audience — no Hindi pass yet, so this page's own copy is
// hardcoded rather than routed through the site's t.* i18n system; the
// shared Navbar/LanguageToggle chrome still appears for visual
// consistency, it just won't translate this page's body).
//
// Section order matches the approved copy doc exactly: Hero -> Problem ->
// Science -> Workshop Experience (6 modules) -> MOVERS(tm) Protocol ->
// Real-Life Application -> 21-Day Plan -> What You Take Home -> What
// This Is Not -> Meet Your Trainer -> Schedule -> Trust -> FAQ -> Final
// CTA -> Footer, with a scroll-reveal mobile sticky bar throughout. No
// separate floating WhatsApp widget on top of the sticky bar — both
// would point at the same registration link and compete for the same
// screen corner on mobile, so only the sticky bar (plus the Nav/Hero/
// Final CTA buttons) carries the WhatsApp CTA.
//
// PREFRONTAL_POWER_REGISTRATION_URL (see whatsappSupportLink.ts) is
// currently a real, working WhatsApp pre-filled message — the same "no
// dedicated checkout exists yet" pattern already used for Retreats and
// Personal Class. Swap that one constant for a real payment/booking URL
// later; no component here needs to change.
export default function PrefrontalPowerMumbaiPage(): React.JSX.Element {
  const faqSchema = buildFaqPageSchema([...PREFRONTAL_POWER_FAQ_ITEMS])

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <PrefrontalPowerNav />
      <main>
        <PrefrontalPowerHero />
        <PrefrontalPowerProblem />
        <PrefrontalPowerScience />
        <PrefrontalPowerModules />
        <PrefrontalPowerMovers />
        <PrefrontalPowerApplication />
        <PrefrontalPowerPlan />
        <PrefrontalPowerIncludes />
        <PrefrontalPowerNotThis />
        <PrefrontalPowerTrainer />
        <PrefrontalPowerSchedule />
        <PrefrontalPowerTrust />
        <PrefrontalPowerFaq />
        <PrefrontalPowerFinalCta />
      </main>
      <Footer />
      <PrefrontalPowerStickyBar />
    </div>
  )
}
