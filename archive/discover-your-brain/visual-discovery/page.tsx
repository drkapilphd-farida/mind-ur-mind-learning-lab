import type { Metadata } from 'next'
import { VisualDiscoveryExperience } from './components/VisualDiscoveryExperience'

export const metadata: Metadata = {
  title: 'Visual Discovery™ — Mind Ur Mind Learning Lab™',
  description: 'Simply observe. Nothing more.',
}

// Discover Your Brain™ — Screen 3: Visual Discovery™. The entry into the
// first interactive challenge — production UI only, no challenge logic
// yet. Inherits the shared shell and MotionConfig from the parent
// discover-your-brain layout.
export default function VisualDiscoveryPage(): React.JSX.Element {
  return <VisualDiscoveryExperience />
}
