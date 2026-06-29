import type { Metadata } from 'next'
import { RsvpExperience } from '@/features/quantum-speed-reading/components/RsvpExperience'

export const metadata: Metadata = {
  title: 'RSVP — Quantum Speed Reading Lab™',
  description: "Let's practice recognizing single words at a fixed point, without moving your eyes.",
}

export default function RsvpPage(): React.JSX.Element {
  return <RsvpExperience />
}
