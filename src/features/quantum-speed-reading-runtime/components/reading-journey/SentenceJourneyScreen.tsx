import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { SentenceAsset } from '@/core/universal-learning-engine/learning-assets'

type SentenceJourneyScreenProps = {
  sentences: readonly SentenceAsset[]
  onFinished: () => void
}

// Reading Journey Experience™ (Sprint-5) — Screen 5: Sentence Journey.
// "Comfortable width. Excellent readability. Minimal distractions. The
// learner should naturally begin reading faster." Deliberately NOT a
// one-at-a-time reveal (unlike Keyword/Word/Phrase) — a comfortable,
// generously-spaced passage bridges the earlier fragment-level warm-up
// toward the full chapter that follows. No numbering, no technical
// markers — just real sentences, in the Reading Session's own real order.
export function SentenceJourneyScreen({ sentences, onFinished }: SentenceJourneyScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-xl space-y-8 py-6">
      <div className="space-y-1 text-center">
        <p className={TYPOGRAPHY.label}>Explore</p>
        <p className={cn(TYPOGRAPHY.body, 'text-muted-foreground')}>The key sentences from this chapter.</p>
      </div>

      <div className="space-y-6">
        {sentences.map((sentence, index) => (
          <p
            key={sentence.keySentence}
            style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}
            className="animate-in fade-in slide-in-from-bottom-1 text-center text-xl leading-relaxed text-foreground duration-(--duration-base) fill-mode-both sm:text-2xl"
          >
            {sentence.keySentence}
          </p>
        ))}
        {sentences.length === 0 && <p className={cn(TYPOGRAPHY.body, 'text-center text-muted-foreground')}>This chapter is short enough to read in full right away.</p>}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={onFinished}>
          Continue
        </Button>
      </div>
    </div>
  )
}
