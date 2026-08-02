import type { Metadata } from 'next'
import { Hero } from './components/Hero'
import { DiscoveryPreview } from './components/DiscoveryPreview'
import { JourneyPreview } from './components/JourneyPreview'

export const metadata: Metadata = {
  title: 'Discover Your Learning Potential™ — Mind Ur Mind Learning Lab™',
  description: 'Discover how you or your child naturally learns — and where improvement is possible. Approximately 5 minutes.',
}

// Discover Your Learning Potential™ — Sprint-1. The new official entry
// experience, built from scratch. No navigation, no footer, one CTA.
export default function DiscoverLearningPotentialPage(): React.JSX.Element {
  return (
    <main className="bg-background">
      <Hero />
      <DiscoveryPreview />
      <JourneyPreview />
    </main>
  )
}
