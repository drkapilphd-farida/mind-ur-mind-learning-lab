import type { Metadata } from 'next'
import { PrototypeExperience } from './components/PrototypeExperience'

export const metadata: Metadata = {
  title: 'Founder Prototype VS001 — Mind Ur Mind Learning Lab™',
  description: 'Internal founder prototype — not part of the production Discover Your Brain™ flow.',
}

// Founder Prototype™ — Mystery-1: "Your Eyes See... But What Does Your
// Brain Notice?™" / Brain Moment: The First Glance™. Inherits the shared
// shell and MotionConfig from the parent discover-your-brain layout.
export default function PrototypeVs001Page(): React.JSX.Element {
  return <PrototypeExperience />
}
