import type { Metadata } from 'next'
import { DiscoveryUploadBridgeScreen } from './components/DiscoveryUploadBridgeScreen'

export const metadata: Metadata = {
  title: 'Your Learning Profile Is Ready — Quantum Mind Learning Lab™',
  description: 'The bridge from your Discovery results to your first real learning document.',
}

// Discovery → Upload Bridge™ (ALS-14 Sprint-1) — the emotional bridge
// between Discover Your Learning Potential™ and AI Learning Studio™.
// Reachable pre-signup, matching every Discovery screen before it; the
// real sign-in gate still lives at `/preview`'s own protected layout,
// unchanged by this screen.
export default function UploadBridgePage(): React.JSX.Element {
  return <DiscoveryUploadBridgeScreen />
}
