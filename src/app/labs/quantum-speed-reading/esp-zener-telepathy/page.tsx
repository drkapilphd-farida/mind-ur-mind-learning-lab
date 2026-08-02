import type { Metadata } from 'next'
import { EspZenerTelepathyExperience } from '@/features/esp-zener-telepathy/components/EspZenerTelepathyExperience'

export const metadata: Metadata = {
  title: 'ESP Zener Card Telepathy Sprint — Quantum Speed Reading Lab™',
}

// ESP Zener Card Telepathy Sprint™ — the first Intuition Development
// exercise, distinct from every Reading Mode and every other advanced
// training exercise (a gamified gut-feeling guessing sprint, not paced
// reading or a click-search drill). Deliberately its own route/folder, no
// collision with any existing V1 or V2 route.
export default function EspZenerTelepathyPage(): React.JSX.Element {
  return <EspZenerTelepathyExperience />
}
