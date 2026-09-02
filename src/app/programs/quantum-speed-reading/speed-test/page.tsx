import type { Metadata } from 'next'
import QsrNav from '@/components/qsr/QsrNav'
import Footer from '@/components/Footer'
import QsrWhatsAppWidget from '@/components/qsr/QsrWhatsAppWidget'
import QsrSpeedTestExperience from '@/components/qsr/speed-test/QsrSpeedTestExperience'

export const metadata: Metadata = {
  title: 'Free Reading Speed Test — Quantum Speed Reading',
  description:
    'Measure your real reading speed and comprehension in 2 minutes, then feel what a trained pace is like — free, no payment required.',
}

// Dedicated route (not a modal) — this is a genuine multi-step flow
// (7 stages: intro, calibration, quiz, transition, speed demo, quiz,
// results), and a cramped inline widget on the main landing page would
// fight the page's own scroll/section rhythm. Reuses the QSR page's
// exact minimal chrome (QsrNav + Footer + WhatsApp widget) so this
// doesn't feel like an orphaned page — see QsrHero.tsx's secondary CTA
// and HeroSection.tsx's secondary CTA for the two entry points.
export default function QsrSpeedTestPage(): React.JSX.Element {
  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <QsrNav />
      <main>
        <QsrSpeedTestExperience />
      </main>
      <Footer />
      <QsrWhatsAppWidget />
    </div>
  )
}
