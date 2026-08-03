import { Lightbulb } from 'lucide-react'
import type { FeynmanChallenge } from '../types'

type FeynmanChallengeCardProps = {
  challenge: FeynmanChallenge
}

// Feynman Challenge™ — a real, document-specific prompt inviting the
// learner to explain the core concept back in their own words. Display
// only: there's no answer field to check here (that's the whole point of
// the technique — the learner explains it to themselves), so this card
// just presents the challenge clearly, no input/submit affordance.
export function FeynmanChallengeCard({ challenge }: FeynmanChallengeCardProps): React.JSX.Element {
  return (
    <div className="quantum-section-card p-4">
      <div className="flex items-center gap-2">
        <div className="quantum-icon-chip" aria-hidden="true">
          <Lightbulb className="size-3.5 text-amber-500" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-foreground">Feynman Challenge™</p>
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{challenge.topic}</p>
      <p className="mt-1.5 text-sm text-foreground">{challenge.prompt}</p>
    </div>
  )
}
