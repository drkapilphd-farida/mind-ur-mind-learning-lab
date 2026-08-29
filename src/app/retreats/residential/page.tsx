import type { Metadata } from 'next'
import { translations } from '@/lib/i18n'
import { buildFaqPageSchema } from '@/lib/seo/faqSchema'
import ResidentialNav from '@/components/residential/ResidentialNav'
import ResidentialHero from '@/components/residential/ResidentialHero'
import ResidentialRoadmap from '@/components/residential/ResidentialRoadmap'
import ResidentialCoreProblem from '@/components/residential/ResidentialCoreProblem'
import ResidentialAdvantage from '@/components/residential/ResidentialAdvantage'
import ResidentialJourney from '@/components/residential/ResidentialJourney'
import ResidentialGallery from '@/components/residential/ResidentialGallery'
import ResidentialAuthority from '@/components/residential/ResidentialAuthority'
import ResidentialVenues from '@/components/residential/ResidentialVenues'
import ResidentialPricing from '@/components/residential/ResidentialPricing'
import ResidentialVideoTestimonials from '@/components/residential/ResidentialVideoTestimonials'
import ResidentialAudience from '@/components/residential/ResidentialAudience'
import ResidentialFaq from '@/components/residential/ResidentialFaq'
import ResidentialFinalCta from '@/components/residential/ResidentialFinalCta'
import Footer from '@/components/Footer'
import ResidentialStickyBar from '@/components/residential/ResidentialStickyBar'
import ResidentialWhatsAppWidget from '@/components/residential/ResidentialWhatsAppWidget'

export const metadata: Metadata = {
  title: 'Residential Retreats — Lonavala & Rishikesh — Dr. Kapil Dev Sharma',
  description:
    'Small-group, fully immersive residential retreats guided in person by Dr. Kapil Dev Sharma since 2014. Lonavala and Rishikesh, 2026–2027. Kriya Yoga, Prana, and cosmic energy work — ₹35,000 sharing, ₹45,000 private.',
}

// Residential Retreats Landing Page™ — the real destination TierRetreats'
// homepage "Residential" card CTA already points to
// (/retreats/residential), same single-goal direct-response pattern as
// the QSR and Online Retreat pages: minimal nav, sticky bottom CTA bar,
// WhatsApp widget tuned to this exact offer. No Razorpay checkout exists
// for this offer (see whatsappSupportLink.ts) — WhatsApp is the real
// booking path, not a placeholder for a missing gateway.
//
// Section order: hook (Hero) -> the real 2026–27 schedule (Roadmap, the
// anchor) -> why even online isn't enough (CoreProblem) -> why in-person
// specifically (Advantage) -> what happens inside (Journey) -> what it
// looks like (Gallery) -> who's teaching (Authority) -> where it happens
// (Venues) -> what it costs (Pricing, the real conversion point) ->
// social proof (VideoTestimonials) -> fit check (Audience) -> objection
// handling (Faq) -> final push (FinalCta) before the footer.
export default function ResidentialRetreatsLandingPage(): React.JSX.Element {
  const faqSchema = buildFaqPageSchema(translations.en.residentialLanding.faq.items)

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <ResidentialNav />
      <main>
        <ResidentialHero />
        <ResidentialRoadmap />
        <ResidentialCoreProblem />
        <ResidentialAdvantage />
        <ResidentialJourney />
        <ResidentialGallery />
        <ResidentialAuthority />
        <ResidentialVenues />
        <ResidentialPricing />
        <ResidentialVideoTestimonials />
        <ResidentialAudience />
        <ResidentialFaq />
        <ResidentialFinalCta />
      </main>
      <Footer />
      <ResidentialStickyBar />
      <ResidentialWhatsAppWidget />
    </div>
  )
}
