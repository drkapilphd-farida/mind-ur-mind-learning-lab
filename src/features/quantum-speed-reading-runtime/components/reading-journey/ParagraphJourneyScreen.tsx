import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { ParagraphAsset } from '@/core/universal-learning-engine/learning-assets'

type ParagraphJourneyScreenProps = {
  paragraphs: readonly ParagraphAsset[]
  onFinished: () => void
}

// Real, disclosed threshold — the same one Sprint-4.5 established,
// applied against each paragraph's own real, already-computed
// `importance` (0–1), never fabricated.
const IMPORTANT_THRESHOLD = 0.75

// Reading Journey Experience™ (Sprint-5) — Screen 6: Key Paragraph
// Journey. "These are the most important ideas from this chapter" —
// "avoid dense walls of text" — each card shows this paragraph's own
// real extractive summary (Sprint-2's own disclosed design: the Bundle
// stores no fuller paragraph text), never a fabricated excerpt.
export function ParagraphJourneyScreen({ paragraphs, onFinished }: ParagraphJourneyScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-xl space-y-8 py-6">
      <div className="space-y-1 text-center">
        <p className={TYPOGRAPHY.label}>Reflect</p>
        <p className={cn(TYPOGRAPHY.bodyLarge, 'text-foreground')}>These are the most important ideas from this chapter.</p>
      </div>

      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          const isImportant = paragraph.importance >= IMPORTANT_THRESHOLD
          return (
            <div
              key={paragraph.paragraphId}
              style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}
              className={cn(
                'animate-in fade-in slide-in-from-bottom-1 rounded-2xl border p-6 duration-(--duration-base) fill-mode-both sm:p-7',
                isImportant ? 'border-primary/30 bg-primary/5' : 'border-border bg-card',
              )}
            >
              <p className="text-lg leading-relaxed text-foreground sm:text-xl">{paragraph.summary}</p>
            </div>
          )
        })}
        {paragraphs.length === 0 && <p className={cn(TYPOGRAPHY.body, 'text-center text-muted-foreground')}>Every idea in this chapter carries similar weight.</p>}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={onFinished}>
          Continue
        </Button>
      </div>
    </div>
  )
}
