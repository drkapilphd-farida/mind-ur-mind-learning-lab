import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import ProgramSelector from '@/components/ProgramSelector'
import HomeHabitBuilderFeature from '@/components/HomeHabitBuilderFeature'
import HomeOverviewVideo from '@/components/HomeOverviewVideo'
import ProgramCardsGrid from '@/components/ProgramCardsGrid'
import HomeSpeedTestCta from '@/components/HomeSpeedTestCta'
import HomeWhyMindUrMind from '@/components/HomeWhyMindUrMind'
import Testimonials from '@/components/Testimonials'
import HomeGuideSection from '@/components/HomeGuideSection'
import FAQSection from '@/components/FAQSection'
import HomeFinalCta from '@/components/HomeFinalCta'
import HomeFranchiseTeaser from '@/components/HomeFranchiseTeaser'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Mind Ur Mind — Dr. Kapil Dev Sharma | Quantum Speed Reading & Psychic-Spiritual Mastery',
  description: 'The 30-Day Quantum Speed Reading Live Masterclass, psychic & spiritual retreats, and 1-on-1 mentoring — under Dr. Kapil Dev Sharma.',
}

// Homepage V2™ — rebuilt around the explicit "Discover → Start Small →
// Experience Transformation → Go Deeper" funnel: Hero → Where Would You
// Like to Begin (four real pathways, #begin) → the featured, easiest-entry
// Habit Builder → a brand overview video → the full 5-program catalog
// (#explore-programs) → a dedicated free Speed Test section → Why Mind Ur
// Mind (ecosystem framing) → Testimonials → Dr. Kapil → FAQ → Final CTA →
// footer. HomeGalleryGlimpse is no longer rendered here (not part of this
// architecture — the file itself is untouched, so nothing was deleted, it
// simply isn't part of the homepage flow anymore). HomeFranchiseTeaser
// stays, small and low-weight as it already was, right before the footer —
// a different audience (trainers/edupreneurs) than the primary funnel
// above, and Navbar's own link list no longer carries it per the new nav
// spec, so this banner (plus the Footer's own "Become a Partner" link)
// is what keeps that path discoverable.
export default function HomePage(): React.JSX.Element {
  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <ProgramSelector />
        <HomeHabitBuilderFeature />
        <HomeOverviewVideo />
        <ProgramCardsGrid />
        <HomeSpeedTestCta />
        <HomeWhyMindUrMind />
        <Testimonials />
        <HomeGuideSection />
        <FAQSection />
        <HomeFinalCta />
        <HomeFranchiseTeaser />
      </main>
      <Footer />
      {/* Mobile QA™ — the new hero has one more line (the credentials
          trust strip below the CTA row) than before, which pushed its CTA
          row low enough on short mobile viewports to collide with this
          widget's own pre-tuned bottom-16 default (see WhatsAppWidget.tsx's
          own doc comment on why that default exists). A little more
          bottom clearance on mobile only, same technique already used on
          the QSR/Franchise pages. */}
      <WhatsAppWidget bottomClassName="bottom-24 sm:bottom-7" />
    </div>
  )
}
