import type { Metadata } from 'next'
import { FlashNumbersExperience } from '@/features/rapid-visual-intelligence/components/FlashNumbersExperience'

export const metadata: Metadata = {
  title: 'Flash Numbers™ — Rapid Visual Intelligence™',
  description: 'Register multi-digit numbers in a single glance. Digit count increases with accuracy.',
}

export default function FlashNumbersPage(): React.JSX.Element {
  return <FlashNumbersExperience />
}
