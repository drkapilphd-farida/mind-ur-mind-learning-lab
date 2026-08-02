import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { WordAsset } from '@/core/universal-learning-engine/learning-assets'
import { OneAtATimeReveal } from './OneAtATimeReveal'

type KeywordWarmupScreenProps = {
  words: readonly WordAsset[]
  onFinished: () => void
}

// Real, disclosed cap — a calm taste of the chapter's own most real-
// important terms (already-real `priority`, never re-derived), not the
// full list — the full pass happens next, in the Word Journey.
const WARMUP_KEYWORD_COUNT = 5

// Reading Journey Experience™ (Sprint-5) — Screen 2: Keyword Warm-up.
// "Activate recognition before reading" — no timer, no pressure, replay
// allowed (see OneAtATimeReveal). Shows only the chapter's own most real-
// important keywords, one at a time, in large calm typography.
export function KeywordWarmupScreen({ words, onFinished }: KeywordWarmupScreenProps): React.JSX.Element {
  const topKeywords = [...words].sort((a, b) => b.priority - a.priority).slice(0, WARMUP_KEYWORD_COUNT)

  return (
    <div className="mx-auto max-w-lg space-y-8 py-6 text-center">
      <div className="space-y-1">
        <p className={TYPOGRAPHY.label}>Warm-up</p>
        <p className={cn(TYPOGRAPHY.body, 'text-muted-foreground')}>A few words to get familiar with first.</p>
      </div>

      <OneAtATimeReveal
        items={topKeywords}
        onFinished={onFinished}
        continueLabel="I'm ready"
        emptyMessage="This chapter doesn't need a warm-up — let's go straight in."
        renderItem={(word) => <p className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">{word.word}</p>}
      />
    </div>
  )
}
