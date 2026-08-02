import Link from 'next/link'
import { PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type CelebrationScreenProps = {
  projectId: string
  hasNextChapter: boolean
  onNextChapter: () => void
}

// Reading Journey Experience™ (Sprint-5) — End Experience. Replaces the
// old, plain "Chapter Complete" screen with a genuinely satisfying close
// — real, disclosed language, never a fabricated achievement (no invented
// score/streak claim; the celebration is about the real journey just
// completed, nothing more).
export function CelebrationScreen({ projectId, hasNextChapter, onNextChapter }: CelebrationScreenProps): React.JSX.Element {
  return (
    <div className="animate-in fade-in zoom-in-95 mx-auto max-w-lg space-y-8 py-10 text-center duration-(--duration-base)">
      <div className="flex flex-col items-center gap-3">
        <span className="flex size-16 items-center justify-center rounded-full bg-success/10">
          <PartyPopper className="size-7 text-success" aria-hidden="true" />
        </span>
        <h1 className={TYPOGRAPHY.h1}>Excellent.</h1>
        <p className={cn(TYPOGRAPHY.bodyLarge, 'text-muted-foreground')}>Your brain has now explored this chapter. You&rsquo;re ready to remember it much more effectively.</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        {hasNextChapter && (
          <Button size="lg" onClick={onNextChapter} className="w-full sm:w-auto">
            Continue to Next Chapter
          </Button>
        )}
        <Button variant={hasNextChapter ? 'ghost' : 'default'} size={hasNextChapter ? 'default' : 'lg'} asChild className={hasNextChapter ? '' : 'w-full sm:w-auto'}>
          <Link href={`/preview/learning-projects/${projectId}`}>Return to Library</Link>
        </Button>
      </div>
    </div>
  )
}
