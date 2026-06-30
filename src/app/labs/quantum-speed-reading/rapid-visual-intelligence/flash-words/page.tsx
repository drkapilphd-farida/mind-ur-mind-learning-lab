import type { Metadata } from 'next'
import { FlashWordsExperience } from '@/features/rapid-visual-intelligence/components/FlashWordsExperience'

export const metadata: Metadata = {
  title: 'Flash Words™ — Rapid Visual Intelligence™',
  description: 'Recognise single words at decreasing flash durations. Duration adapts to your accuracy.',
}

export default function FlashWordsPage(): React.JSX.Element {
  return <FlashWordsExperience />
}
