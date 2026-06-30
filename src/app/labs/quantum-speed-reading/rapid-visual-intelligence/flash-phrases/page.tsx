import type { Metadata } from 'next'
import { FlashPhrasesExperience } from '@/features/rapid-visual-intelligence/components/FlashPhrasesExperience'

export const metadata: Metadata = {
  title: 'Flash Phrases™ — Rapid Visual Intelligence™',
  description: 'Process short phrases in a single glance. Phrase length increases as recognition improves.',
}

export default function FlashPhrasesPage(): React.JSX.Element {
  return <FlashPhrasesExperience />
}
