import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type FullChapterReadingScreenProps = {
  chapterFullText: string | null
  onFinished: () => void
}

// Reading Journey Experience™ (Sprint-5) — Screen 7: Full Chapter
// Reading. "The learner has already completed the preparation journey.
// Reading the original chapter should now feel easier." Real original
// text (`chapterFullText`, sourced from the Universal Learning Object's
// own real `LearningChunk.content` — see startIntelligentReadingSession.ts)
// — never fabricated, never re-summarized. Reuses the same comfortable
// reading-width typography the classic QSR reading view already
// established (`ReadingChunkViewer.tsx`), rather than inventing new
// reading typography for what is, at this point, real full-text reading.
export function FullChapterReadingScreen({ chapterFullText, onFinished }: FullChapterReadingScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <div className="space-y-1 text-center">
        <p className={TYPOGRAPHY.label}>Read</p>
        <p className={cn(TYPOGRAPHY.bodyLarge, 'text-foreground')}>You&rsquo;re prepared. Here&rsquo;s the full chapter.</p>
      </div>

      <div className="animate-in fade-in rounded-2xl border border-border bg-card p-6 duration-(--duration-base) sm:p-8">
        {chapterFullText ? (
          <p className="mx-auto max-w-[65ch] text-lg leading-relaxed whitespace-pre-wrap text-foreground sm:text-xl sm:leading-loose">{chapterFullText}</p>
        ) : (
          <p className={cn(TYPOGRAPHY.body, 'text-center text-muted-foreground')}>This chapter&rsquo;s original text isn&rsquo;t available right now.</p>
        )}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={onFinished}>
          I&rsquo;ve finished reading
        </Button>
      </div>
    </div>
  )
}
