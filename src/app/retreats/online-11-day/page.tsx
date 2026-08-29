import type { Metadata } from 'next'
import { translations } from '@/lib/i18n'
import { buildFaqPageSchema } from '@/lib/seo/faqSchema'
import RetreatNav from '@/components/retreat/RetreatNav'
import RetreatHero from '@/components/retreat/RetreatHero'
import RetreatCoreProblem from '@/components/retreat/RetreatCoreProblem'
import RetreatSchedule from '@/components/retreat/RetreatSchedule'
import RetreatDisciplines from '@/components/retreat/RetreatDisciplines'
import RetreatAuthority from '@/components/retreat/RetreatAuthority'
import RetreatLiveStructure from '@/components/retreat/RetreatLiveStructure'
import RetreatOutcomes from '@/components/retreat/RetreatOutcomes'
import RetreatVideoTestimonials from '@/components/retreat/RetreatVideoTestimonials'
import RetreatFaq from '@/components/retreat/RetreatFaq'
import RetreatFinalCta from '@/components/retreat/RetreatFinalCta'
import Footer from '@/components/Footer'
import RetreatStickyBar from '@/components/retreat/RetreatStickyBar'
import RetreatWhatsAppWidget from '@/components/retreat/RetreatWhatsAppWidget'

export const metadata: Metadata = {
  title: '11-Day Online Psychic & Spiritual Retreat — Dr. Kapil Dev Sharma',
  description:
    'Authentic Kriya Yoga, Prana, and cosmic energy — an intensive, live, 11-day journey through telepathy, aura reading, Samadhi meditation, chakra activation, Kundalini meditation, and astral projection. Guided nightly by Dr. Kapil Dev Sharma, teaching since 2014. Monthly batch, 10th–20th, 7:30–10:30 PM.',
}

// Flagship Retreat Landing Page™ — the real destination TierRetreats'
// homepage "online" card CTA already points to
// (/retreats/online-11-day), the exact same pattern as the QSR landing
// page: single-goal direct-response page, this page's own minimal
// RetreatNav (no links away from enrollment), a sticky bottom CTA bar,
// and a WhatsApp widget tuned to this exact program. Shares the site's
// .warm-light palette (not a separate teal/green scheme) so it stays
// visually consistent with every other marketing page.
//
// Section order: hook (Hero) -> why meditation apps fail, Kriya Yoga as
// the real mechanism (CoreProblem) -> what's covered (Disciplines) ->
// who's teaching it, 12+ years (Authority) -> when it actually happens
// (Schedule, with the real Razorpay checkout) -> how the 11 nights
// actually run (LiveStructure) -> what changes (Outcomes) -> social
// proof (VideoTestimonials) -> objection handling (Faq) -> final push
// (FinalCta) before the footer.
export default function OnlineElevenDayRetreatPage(): React.JSX.Element {
  const faqSchema = buildFaqPageSchema(translations.en.retreatLanding.faq.items)

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <RetreatNav />
      <main>
        <RetreatHero />
        <RetreatCoreProblem />
        <RetreatDisciplines />
        <RetreatAuthority />
        <RetreatSchedule />
        <RetreatLiveStructure />
        <RetreatOutcomes />
        <RetreatVideoTestimonials />
        <RetreatFaq />
        <RetreatFinalCta />
      </main>
      <Footer />
      <RetreatStickyBar />
      <RetreatWhatsAppWidget />
    </div>
  )
}
