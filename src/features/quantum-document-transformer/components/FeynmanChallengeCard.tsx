import { Lightbulb } from 'lucide-react'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
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
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-4">
      <div className="flex items-center gap-1.5">
        <Lightbulb className="size-3.5 text-amber-500" aria-hidden="true" />
        <p className={TYPOGRAPHY.label}>Feynman Challenge™</p>
      </div>
      <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{challenge.topic}</p>
      <p className="mt-1.5 text-sm text-foreground">{challenge.prompt}</p>
    </div>
  )
}
