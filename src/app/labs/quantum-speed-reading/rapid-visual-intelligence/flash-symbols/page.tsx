import type { Metadata } from 'next'
import { FlashSymbolsExperience } from '@/features/rapid-visual-intelligence/components/FlashSymbolsExperience'

export const metadata: Metadata = {
  title: 'Flash Symbols™ — Rapid Visual Intelligence™',
  description: 'Distinguish visually similar letters and characters at speed. Trains visual precision.',
}

export default function FlashSymbolsPage(): React.JSX.Element {
  return <FlashSymbolsExperience />
}
