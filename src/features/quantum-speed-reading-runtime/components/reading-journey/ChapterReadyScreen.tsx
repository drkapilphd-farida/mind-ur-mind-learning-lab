import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type ChapterReadyScreenProps = {
  chapterTitle: string
  estimatedDurationSeconds: number
  keywordCount: number
  phraseCount: number
  sentenceCount: number
  paragraphCount: number
  onStart: () => void
}

function formatMinutes(totalSeconds: number): string {
  const minutes = Math.round(Math.max(0, totalSeconds) / 60)
  return minutes < 1 ? 'under a minute' : `${minutes} min`
}

// Reading Journey Experience™ (Sprint-5) — Screen 1: Chapter Ready. The
// learner's first impression that "an expert reading coach has already
// studied this chapter" — every number shown is real, already computed
// by the Reading Experience Engine (word/phrase/sentence/paragraph asset
// counts, real estimated duration); nothing here is fabricated or newly
// computed. No technical vocabulary ("Reading Session," "stage," "asset")
// ever appears in the copy.
export function ChapterReadyScreen({ chapterTitle, estimatedDurationSeconds, keywordCount, phraseCount, sentenceCount, paragraphCount, onStart }: ChapterReadyScreenProps): React.JSX.Element {
  const stats = [
    { label: 'Keywords', value: keywordCount },
    { label: 'Phrases', value: phraseCount },
    { label: 'Key sentences', value: sentenceCount },
    { label: 'Important ideas', value: paragraphCount },
  ]

  return (
    <div className="animate-in fade-in mx-auto max-w-lg space-y-8 py-6 text-center duration-(--duration-base)">
      <div className="flex flex-col items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-6 text-primary" aria-hidden="true" />
        </span>
        <p className={TYPOGRAPHY.label}>Ready for you</p>
        <h1 className={TYPOGRAPHY.h1}>{chapterTitle}</h1>
        <p className={cn(TYPOGRAPHY.bodyLarge, 'text-muted-foreground')}>Everything is ready. Let&rsquo;s prepare your brain before reading.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className={cn(TYPOGRAPHY.h2, 'tabular-nums')}>{stat.value}</p>
            <p className={TYPOGRAPHY.caption}>{stat.label}</p>
          </div>
        ))}
      </div>

      <p className={TYPOGRAPHY.caption}>About {formatMinutes(estimatedDurationSeconds)} to prepare</p>

      <Button size="lg" onClick={onStart} className="w-full sm:w-auto">
        Start Reading Journey
      </Button>
    </div>
  )
}
