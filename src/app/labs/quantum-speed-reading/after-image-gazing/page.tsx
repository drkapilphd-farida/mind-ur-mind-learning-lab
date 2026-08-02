import type { Metadata } from 'next'
import { AfterImageGazingExperience } from '@/features/after-image-gazing/components/AfterImageGazingExperience'

export const metadata: Metadata = {
  title: 'After-Image / Complementary Color Gazing — Quantum Speed Reading Lab™',
}

// After-Image / Complementary Color Gazing™ — the fourth Right Brain
// Activation exercise, alongside Photographic Memory™, High-Speed
// Pictorial Essence Sprint™, and Hemispheric Color-Word Sync Grid™.
// Deliberately its own route/folder, no collision with any existing V1
// or V2 route.
export default function AfterImageGazingPage(): React.JSX.Element {
  return <AfterImageGazingExperience />
}
