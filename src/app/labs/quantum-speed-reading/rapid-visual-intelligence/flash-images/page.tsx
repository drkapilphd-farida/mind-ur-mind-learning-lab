import type { Metadata } from 'next'
import { FlashImagesExperience } from '@/features/rapid-visual-intelligence/components/FlashImagesExperience'

export const metadata: Metadata = {
  title: 'Flash Icons™ — Rapid Visual Intelligence™',
  description: 'Identify visual symbols at high speed. Builds visual discrimination and shape memory.',
}

export default function FlashImagesPage(): React.JSX.Element {
  return <FlashImagesExperience />
}
