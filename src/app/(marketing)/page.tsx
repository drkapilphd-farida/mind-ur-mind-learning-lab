import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TierFlagship from '@/components/TierFlagship'
import TierRetreats from '@/components/TierRetreats'
import TierSpecialized from '@/components/TierSpecialized'
import HabitAppStrip from '@/components/HabitAppStrip'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Mind Ur Mind — Dr. Kapil Dev Sharma | Quantum Speed Reading & Psychic-Spiritual Mastery',
  description: 'Quantum Speed Reading, psychic & spiritual retreats, 1-on-1 mentoring, and a free Habit App — under Dr. Kapil Dev Sharma.',
}

// New Homepage™ — app.mindurmind.org.in's root now renders this directly
// (the old redirect() to /welcome/choose-method is gone). Fully
// self-contained chrome (its own Navbar/Footer, not the (legacy) route
// group's simpler header/footer — see (legacy)/layout.tsx) wrapped in
// .homepage-void (globals.css), the scoped dark/gold surface + font
// override every other route is completely unaffected by.
export default function HomePage(): React.JSX.Element {
  return (
    <div className="homepage-void min-h-screen font-sans antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <TierFlagship />
        <TierRetreats />
        <TierSpecialized />
        <HabitAppStrip />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
