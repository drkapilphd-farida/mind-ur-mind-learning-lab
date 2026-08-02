import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { ReadingStyle } from '../resolveReadingStyle'

type AssessmentCompleteScreenProps = {
  overallWpm: number
  readingStyle: ReadingStyle
  recommendationReason: string
  onEnterHub: () => void
}

// Reading Assessment Engine™ — Step 6's real reveal. Layout/animation
// shell adapted from `CompletedSessionScreen.tsx` (icon zoom-in, fade-in
// Card, `TYPOGRAPHY` tokens) — same premium, calm confirmation pattern,
// no `SessionSnapshot` dependency carried over (this screen's data is
// entirely assessment-specific). Every figure shown is real: the same
// `overall_wpm`/`reading_style`/`recommendation_reason` this screen's
// caller just persisted via `saveReadingAssessment`. Never a percentage
// grade or judgmental language — "the user must never feel judged," per
// this brief's own UX rule.
export function AssessmentCompleteScreen({ overallWpm, readingStyle, recommendationReason, onEnterHub }: AssessmentCompleteScreenProps): React.JSX.Element {
  return (
    <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
      <Card>
        <CardContent className="space-y-6 text-center">
          <div className="animate-in zoom-in-95 mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 duration-(--duration-slow)">
            <Sparkles className={`${ICON_SIZE.lg} text-primary`} aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h1 className={TYPOGRAPHY.h2}>Your Reading Profile is ready</h1>
            <p className={TYPOGRAPHY.small}>Here&rsquo;s how you naturally read.</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-left">
            <div>
              <dt className={TYPOGRAPHY.caption}>Comfortable Reading Speed</dt>
              <dd className="text-sm font-medium tabular-nums text-foreground">{overallWpm} WPM</dd>
            </div>
            <div>
              <dt className={TYPOGRAPHY.caption}>Current Reading Style</dt>
              <dd className="text-sm font-medium text-foreground">{readingStyle}</dd>
            </div>
          </dl>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-left">
            <p className={TYPOGRAPHY.caption}>Recommended Starting Point</p>
            <p className={TYPOGRAPHY.small}>{recommendationReason}</p>
          </div>

          <Button onClick={onEnterHub}>Start Reading</Button>
        </CardContent>
      </Card>
    </div>
  )
}
