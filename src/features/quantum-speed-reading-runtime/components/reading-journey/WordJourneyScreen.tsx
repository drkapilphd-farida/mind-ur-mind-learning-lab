import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { WordAsset } from '@/core/universal-learning-engine/learning-assets'
import { OneAtATimeReveal } from './OneAtATimeReveal'

type WordJourneyScreenProps = {
  words: readonly WordAsset[]
  onFinished: () => void
}

// Reading Journey Experience™ (Sprint-5) — Screen 3: Word Journey.
// "Reader should immediately recognize vocabulary. Avoid looking like
// flashcards. Avoid looking like quizzes. This is preparation." — no
// score, no right/wrong framing, no timer, no speed controls (Sprint-4.5's
// own speed-multiplier UI is deliberately dropped here — a calmer,
// comfortably-paced reveal instead).
export function WordJourneyScreen({ words, onFinished }: WordJourneyScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-6 text-center">
      <div className="space-y-1">
        <p className={TYPOGRAPHY.label}>Explore</p>
        <p className={cn(TYPOGRAPHY.body, 'text-muted-foreground')}>The important words from this chapter.</p>
      </div>

      <OneAtATimeReveal
        items={words}
        onFinished={onFinished}
        emptyMessage="This chapter doesn't have standout vocabulary to explore — let's keep moving."
        renderItem={(word) => <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{word.word}</p>}
      />
    </div>
  )
}
