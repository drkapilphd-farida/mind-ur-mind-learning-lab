import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { PhraseAsset } from '@/core/universal-learning-engine/learning-assets'
import { OneAtATimeReveal } from './OneAtATimeReveal'

type PhraseJourneyScreenProps = {
  phrases: readonly PhraseAsset[]
  onFinished: () => void
}

// Reading Journey Experience™ (Sprint-5) — Screen 4: Phrase Journey.
// "Never split natural language" — each `PhraseAsset.phrase` is rendered
// whole, exactly as Sprint-2's own Phrase Assets already preserve it.
// "Display one phrase at a time. Beautiful transitions." — reuses the
// same calm OneAtATimeReveal pattern as Keyword Warm-up/Word Journey.
export function PhraseJourneyScreen({ phrases, onFinished }: PhraseJourneyScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-6 text-center">
      <div className="space-y-1">
        <p className={TYPOGRAPHY.label}>Explore</p>
        <p className={cn(TYPOGRAPHY.body, 'text-muted-foreground')}>Meaningful phrases from this chapter.</p>
      </div>

      <OneAtATimeReveal
        items={phrases}
        onFinished={onFinished}
        emptyMessage="This chapter doesn't have standout phrases to explore — let's keep moving."
        renderItem={(phrase) => <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{phrase.phrase}</p>}
      />
    </div>
  )
}
