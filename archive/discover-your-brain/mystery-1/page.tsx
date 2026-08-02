import type { Metadata } from 'next'
import { MysteryExperience } from './components/MysteryExperience'

export const metadata: Metadata = {
  title: 'Your Eyes See... But What Does Your Brain Notice?™ — Mind Ur Mind Learning Lab™',
  description: "The first Brain Discovery Experience — what does your brain naturally notice first?",
}

// Discover Your Brain™ — Mystery-1. Inherits the shared shell and
// MotionConfig from the parent discover-your-brain layout.
export default function Mystery1Page(): React.JSX.Element {
  return <MysteryExperience />
}
