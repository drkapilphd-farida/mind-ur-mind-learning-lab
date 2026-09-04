import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import ProgramSelector from '@/components/ProgramSelector'
import ProgramCardsGrid from '@/components/ProgramCardsGrid'
import HomeGalleryGlimpse from '@/components/HomeGalleryGlimpse'
import Testimonials from '@/components/Testimonials'
import FAQSection from '@/components/FAQSection'
import HomeFranchiseTeaser from '@/components/HomeFranchiseTeaser'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Mind Ur Mind — Dr. Kapil Dev Sharma | Quantum Speed Reading & Psychic-Spiritual Mastery',
  description: 'The 30-Day Quantum Speed Reading Live Masterclass, psychic & spiritual retreats, and 1-on-1 mentoring — under Dr. Kapil Dev Sharma.',
}

// New Homepage™ — the marketing apex domain's (plain mindurmind.org.in,
// www., local dev, preview deployments) root renders this directly.
// app.mindurmind.org.in's root no longer does — src/middleware.ts's
// isAppSubdomain() check now redirects that specific subdomain's root to
// /welcome/choose-method instead (Domain Split™ requires the real app
// subdomain to load the app itself, never the marketing site). Fully
// self-contained chrome (its own Navbar/Footer, not the (legacy) route
// group's simpler header/footer — see (legacy)/layout.tsx) wrapped in
// .homepage-void (globals.css), the scoped dark/gold surface + font
// override every other route is completely unaffected by.
//
// Program Cards Redesign™ — TierFlagship/TierRetreats/TierSpecialized
// (three separate, visually-identical card sections) are retired from
// this page in favor of ProgramCardsGrid.tsx, one grid built for visual
// variety instead of a repeated template — see that component's own
// notes for what changed and why. GalleryGlimpse sits right after it,
// before the social proof section, matching the request's placement.
export default function HomePage(): React.JSX.Element {
  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <ProgramSelector />
        <ProgramCardsGrid />
        <HomeGalleryGlimpse />
        <Testimonials />
        <FAQSection />
        <HomeFranchiseTeaser />
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  )
}
