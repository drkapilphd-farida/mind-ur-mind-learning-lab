import type { Metadata } from 'next'
import { WelcomeExperience } from './components/WelcomeExperience'

export const metadata: Metadata = {
  title: 'Discover Your Brain™ — Mind Ur Mind Learning Lab™',
  description: 'The beginning of your personalized Brain Transformation Journey™.',
}

// Discover Your Brain™ — Screen 1: Welcome. The universal entry point for
// the entire platform, standing apart from Quantum Speed Reading Lab™ and
// any other Intelligence Lab. WelcomeExperience owns whether the brain has
// been tapped yet (Opening Experience™ state) — kept in its own client
// component since this Server Component can't hold that state itself.
export default function DiscoverYourBrainPage(): React.JSX.Element {
  return <WelcomeExperience />
}
