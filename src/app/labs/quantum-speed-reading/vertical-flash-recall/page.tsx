import type { Metadata } from 'next'
import { VerticalFlashRecallExperience } from '@/features/vertical-flash-recall/components/VerticalFlashRecallExperience'

export const metadata: Metadata = {
  title: 'Vertical Flash Recall & Retention Sprint — Quantum Speed Reading Lab™',
}

// Vertical Flash Recall & Retention Sprint™ — the vertical-column RSVP
// companion to Flash Recall & Retention Sprint™. Its own route/folder, no
// collision with any existing route.
export default function VerticalFlashRecallPage(): React.JSX.Element {
  return <VerticalFlashRecallExperience />
}
