import Link from 'next/link'
import { Button } from '@/components/ui/button'

type JourneyHeroProps = {
  greeting: string
  currentStageTitle: string | null
  currentStageIcon: string | null
  currentStageNumber: number | null
  totalStageCount: number
  missionSupportingLine: string | null
  estimatedTime: string | null
  // Only populated when the current stage has more than one exercise and
  // one is already in progress — e.g. "Word Flash" / "Step 2 of 5".
  currentExerciseTitle: string | null
  exercisePosition: { index: number; total: number } | null
  continueHref: string
  isJourneyComplete: boolean
  // Quantum Speed Reading Paywall™ — true when the current stage itself
  // requires Pro (every stage but Visual Activation™, for a free user).
  // `continueHref` still points at the real stage — its own page is the
  // real enforcement boundary — this only changes the button's label and
  // destination so a free user isn't told "Continue" into a page that's
  // actually going to turn them away.
  currentStageRequiresPro?: boolean
  // SPRINT-2A — Reading Preparation™ is optional, so its "current stage"
  // screen offers a second, quieter path straight into Core Reading
  // Journey™ instead of the one mandatory CTA every other stage has.
  // Absent/null everywhere else — deliberately not a second primary action.
  secondaryHref?: string | null
  secondaryLabel?: string
}

// Sprint-12F — Founder Journey Redesign™. The ONE hero on Lab Home — it now
// absorbs what used to be duplicated in JourneyTimeline's expanding
// current-stage card (exercise title, step position) so there is exactly
// one place showing "what am I doing right now" and exactly one CTA on
// the whole page. Deliberately minimal: one short supporting line instead
// of a benefit bullet list + a separate outcome paragraph — per the
// brief's own example ("Visual Activation™ / Stage 1 of 5 / Brain
// Awakening / Ready to Begin / Continue Journey"), everything not needed
// to decide "should I continue right now" was removed.
export function JourneyHero({
  greeting,
  currentStageTitle,
  currentStageIcon,
  currentStageNumber,
  totalStageCount,
  missionSupportingLine,
  estimatedTime,
  currentExerciseTitle,
  exercisePosition,
  continueHref,
  isJourneyComplete,
  currentStageRequiresPro = false,
  secondaryHref,
  secondaryLabel,
}: JourneyHeroProps): React.JSX.Element {
  return (
    <div className="animate-in fade-in rounded-3xl border bg-card p-8 text-center shadow-md duration-(--duration-slow) ease-out sm:p-10">
      <p className="text-sm text-muted-foreground">{greeting}</p>
      <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Quantum Speed Reading™
      </h1>

      {isJourneyComplete || currentStageTitle === null ? (
        <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-foreground/80">
          Your Brain Transformation™ journey is complete. Revisit any stage below whenever you like.
        </p>
      ) : (
        <>
          {currentStageNumber !== null && (
            <p className="mt-3 text-sm text-muted-foreground">
              Stage {currentStageNumber} of {totalStageCount} — your brain is evolving.
            </p>
          )}

          <p className="mt-8 text-5xl" aria-hidden="true">{currentStageIcon}</p>
          <p className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">{currentStageTitle}</p>

          {missionSupportingLine !== null && (
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-foreground/80">{missionSupportingLine}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {currentExerciseTitle !== null && exercisePosition !== null && (
              <span>{currentExerciseTitle} · Step {exercisePosition.index} of {exercisePosition.total}</span>
            )}
            {estimatedTime !== null && <span>Estimated Time · {estimatedTime}</span>}
          </div>

          <Button asChild size="lg" className="mt-8 min-w-[220px] rounded-full shadow-sm">
            <Link href={currentStageRequiresPro ? '/pricing#family-pro' : continueHref}>
              {currentStageRequiresPro ? 'Upgrade to Pro' : 'Continue Your Journey™'}
            </Link>
          </Button>

          {secondaryHref !== null && secondaryHref !== undefined && (
            <p className="mt-3">
              <Link href={secondaryHref} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                {secondaryLabel ?? 'Skip →'}
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}
