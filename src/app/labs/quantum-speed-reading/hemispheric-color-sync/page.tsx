import type { Metadata } from 'next'
import { HemisphericColorSyncExperience } from '@/features/hemispheric-color-sync/components/HemisphericColorSyncExperience'

export const metadata: Metadata = {
  title: 'Hemispheric Color-Word Sync Grid — Quantum Speed Reading Lab™',
}

// Hemispheric Color-Word Sync Grid™ — the third Right Brain Activation
// exercise, alongside Photographic Memory™ and High-Speed Pictorial
// Essence Sprint™. Deliberately its own route/folder, no collision with
// any existing V1 or V2 route.
export default function HemisphericColorSyncPage(): React.JSX.Element {
  return <HemisphericColorSyncExperience />
}
