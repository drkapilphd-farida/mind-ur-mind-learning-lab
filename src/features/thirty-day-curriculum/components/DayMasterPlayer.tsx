'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, PartyPopper, SkipForward, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CURRICULUM_CATEGORY_LABELS, getCurriculumExerciseById, type CurriculumCatalogExercise } from '../curriculumExerciseCatalog'
import { buildCurriculumDayPlan, isCheckpointDay } from '../curriculumDatabase'
import { buildSessionQueue, clearActiveCurriculumSession, loadActiveCurriculumSession, startCurriculumSessionAtStep } from '../curriculumSessionRunner'
import { setActiveWizardDay } from '../curriculumReturnRouting'
import { isCurriculumExerciseGated } from '../curriculumGatedExercises'
import { getEmbeddableComponent } from '../curriculumExerciseComponentRegistry'
import { markCurriculumDayComplete } from '../curriculumProgress'
import { EmbeddedExerciseProvider } from '../embeddedExerciseContext'

const CARD_CLASS_NAME = 'relative overflow-hidden rounded-3xl border-2 border-border/60 bg-[#FBF9F4]/95 shadow-sm backdrop-blur-md dark:bg-[#16171A]/95'

type WizardMode = 'playing' | 'celebrating' | 'ready-for-checkpoint'

type DayMasterPlayerProps = {
  day: number
  onExitToRoadmap: () => void
  onDayComplete: () => void
  onReadyForCheckpoint: () => void
}

// In-Page Step-by-Step Master Player™ — the guided wizard that replaced
// DaySessionRunner's old "navigate away to a real page for every
// exercise" flow. Every embeddable exercise (41 of the 57 catalog items —
// see curriculumGatedExercises.ts for the 16 that CAN'T be, because their
// own page.tsx runs a real Pro/sequential-unlock check this component
// must never bypass) is rendered directly, in-page, from
// curriculumExerciseComponentRegistry.tsx, advanced via plain React state
// (`stepIndex`) — no navigation, no sessionStorage, completely
// conflict-free with each component's own internal curriculum-session
// hook (which stays inert here since this wizard deliberately never
// populates that session while playing embeddable steps — see
// useCurriculumSessionCompletion.ts's own doc comment for why keeping
// both mechanisms active at once would fight each other).
//
// A gated step instead shows a clear hand-off card and does one real
// navigation to that exercise's own route — startCurriculumSessionAtStep
// seeds sessionStorage pointing at exactly that step first, so the
// exercise's own already-working smart exit/complete wiring (built for
// the previous, all-navigation version of this feature and left
// unchanged) correctly returns here afterward. On remount this component
// reads that resume point once, then immediately clears it and goes back
// to driving everything itself — sessionStorage is only ever a
// hand-off baton across a real navigation, never the source of truth
// while this component is playing.
//
// The header's "Skip Exercise" control reuses handleStepComplete
// directly — a skip and a real completion advance the wizard identically
// (including correctly triggering finishDay() if skipping happens to be
// the final step), the only difference is which UI element triggered it.
export function DayMasterPlayer({ day, onExitToRoadmap, onDayComplete, onReadyForCheckpoint }: DayMasterPlayerProps): React.JSX.Element {
  const router = useRouter()
  const plan = useMemo(() => buildCurriculumDayPlan(day), [day])
  const queueIds = useMemo(() => buildSessionQueue(plan.exercises), [plan])

  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<WizardMode>('playing')

  // Resolve the starting step exactly once per day: resume where a real
  // navigation to a gated exercise left off, else start fresh at step 0.
  useEffect(() => {
    const session = loadActiveCurriculumSession()
    if (session !== null && session.day === day) {
      clearActiveCurriculumSession()
      setStepIndex(Math.min(session.currentIndex, queueIds.length - 1))
    } else {
      setStepIndex(0)
    }
    setMode('playing')
  }, [day, queueIds.length])

  // See this component's own doc comment — makes even an embedded
  // exercise's own internal Exit/Escape affordance land back on this
  // day's view instead of the lab root, as a safety net behind the
  // wizard's own always-visible Exit control below.
  useEffect(() => {
    setActiveWizardDay(day)
    return () => setActiveWizardDay(null)
  }, [day])

  function finishDay(): void {
    if (isCheckpointDay(day)) {
      setMode('ready-for-checkpoint')
      return
    }
    markCurriculumDayComplete(day)
    setMode('celebrating')
  }

  // Shared by both real completion (each embedded exercise's own
  // onComplete) and the header's "Skip Exercise" button below — a skip is
  // just an early "this step's slot in the wizard is done," advancing the
  // exact same way, including correctly triggering finishDay() (with its
  // real checkpoint-vs-not branching) when skipping happens to be the
  // final step. The functional setState form means rapid double-clicks
  // (e.g. an accidental double "Skip") can only ever advance once per
  // actual state update, never skip two steps from one stale read.
  function handleStepComplete(): void {
    setStepIndex((current) => {
      if (current === null) return current
      const nextIndex = current + 1
      if (nextIndex >= queueIds.length) {
        finishDay()
        return current
      }
      return nextIndex
    })
  }

  function handleExitWizard(): void {
    clearActiveCurriculumSession()
    onExitToRoadmap()
  }

  function handleGatedHandoff(exercise: CurriculumCatalogExercise, index: number): void {
    startCurriculumSessionAtStep(day, index)
    router.push(exercise.href)
  }

  if (stepIndex === null) {
    return <div className={`${CARD_CLASS_NAME} flex min-h-[40vh] items-center justify-center p-6 text-sm text-muted-foreground`}>Loading today&apos;s session…</div>
  }

  if (mode === 'celebrating') {
    return (
      <div className={`${CARD_CLASS_NAME} flex flex-col items-center gap-4 p-8 text-center sm:p-12`}>
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden="true" />
        <div className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-500">
          <PartyPopper className="size-8" aria-hidden="true" />
        </div>
        <div className="relative">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Day {day} Complete</p>
          <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{plan.theme.title} — done!</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            All {queueIds.length} exercises complete. Day {day + 1} is now unlocked.
          </p>
        </div>
        <Button onClick={onDayComplete} size="lg" className="relative rounded-full" data-continue-to-roadmap="true">
          Back to Roadmap
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    )
  }

  if (mode === 'ready-for-checkpoint') {
    return (
      <div className={`${CARD_CLASS_NAME} flex flex-col items-center gap-4 p-8 text-center sm:p-12`}>
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-500">
          <Sparkles className="size-8" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">One More Step</p>
          <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Nice work today.</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            This is a checkpoint day — finish with a short, real WPM and comprehension check-in to complete Day {day}.
          </p>
        </div>
        <Button onClick={onReadyForCheckpoint} size="lg" className="rounded-full" data-start-checkpoint="true">
          Start Check-In
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    )
  }

  const currentExerciseId = queueIds[stepIndex]
  const exercise = currentExerciseId !== undefined ? getCurriculumExerciseById(currentExerciseId) : undefined

  if (currentExerciseId === undefined || exercise === undefined) {
    return <div className={`${CARD_CLASS_NAME} flex min-h-[40vh] items-center justify-center p-6 text-sm text-muted-foreground`}>Loading today&apos;s session…</div>
  }

  const isGated = isCurriculumExerciseGated(currentExerciseId)
  const EmbeddedComponent = isGated ? undefined : getEmbeddableComponent(currentExerciseId)

  return (
    // True Full-Screen Viewport Lock™ — fixed inset-0 so an active step
    // is always exactly one screen: this header + progress dots + the
    // embedded exercise's own content, never taller, never scrolling as
    // a page. This wizard is the ONLY chrome visible while playing — see
    // ThirtyDayCurriculumDayDetail.tsx, which hides its own back button
    // and Day Theme card while this is rendering, precisely so a second,
    // parent-level header can't stack underneath this one and force a
    // second screen's worth of height (that stacking was the mobile
    // scroll bug this fixes). overflow-hidden on the outer shell + a
    // flex-1 scrolling content region is the safety net if an embedded
    // exercise's own content ever runs taller than the remaining space —
    // the header/progress dots never scroll away regardless.
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background" data-day-master-player={day} data-wizard-step={stepIndex}>
      {/* No wizard-level BrandWatermark here — every embedded exercise
          (built for full-page standalone use) renders its own too; a
          second one on this wrapper only collided with the step header
          text and duplicated the embedded exercise's own watermark. */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase sm:text-[10px]">
            Step {stepIndex + 1} of {queueIds.length} · {CURRICULUM_CATEGORY_LABELS[exercise.category]}
          </p>
          <p className="truncate text-xs font-semibold text-foreground sm:text-sm">{exercise.title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handleStepComplete}
            className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground transition-[color,transform] active:scale-95 hover:text-foreground sm:px-3"
            data-skip-exercise="true"
          >
            <span className="hidden sm:inline">Skip Exercise</span>
            <span className="sm:hidden">Skip</span>
            <SkipForward className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleExitWizard}
            className="flex items-center gap-1 rounded-full border border-border/60 px-2 py-1.5 text-xs font-medium text-muted-foreground transition-[color,transform] active:scale-95 hover:text-foreground sm:px-3"
            data-exit-wizard="true"
            aria-label="Exit to Roadmap"
          >
            <X className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Exit to Roadmap</span>
          </button>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 px-3 pt-2 sm:gap-1.5 sm:px-6 sm:pt-3" aria-hidden="true">
        {queueIds.map((id, index) => (
          <div
            key={`${id}-${index}`}
            className={`h-1 flex-1 rounded-full transition-colors ${index < stepIndex ? 'bg-emerald-500' : index === stepIndex ? 'bg-primary' : 'bg-border'}`}
          />
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <EmbeddedExerciseProvider>
          {isGated ? (
            <GatedStepHandoff exercise={exercise} onContinue={() => handleGatedHandoff(exercise, stepIndex)} />
          ) : EmbeddedComponent !== undefined ? (
            <EmbeddedComponent key={`${currentExerciseId}-${stepIndex}`} onComplete={handleStepComplete} onExit={handleExitWizard} />
          ) : (
            <GatedStepHandoff exercise={exercise} onContinue={handleStepComplete} skipLabel="Skip this step" />
          )}
        </EmbeddedExerciseProvider>
      </div>
    </div>
  )
}

// Shown for the 16 server-gated exercises (real Pro/sequential-unlock
// checks live in their own page.tsx — see curriculumGatedExercises.ts)
// and, defensively, for the impossible case of a registry miss (labeled
// as a skip instead, so a learner is never stuck mid-wizard).
function GatedStepHandoff({
  exercise,
  onContinue,
  skipLabel = 'Continue in its own guided view',
}: {
  exercise: CurriculumCatalogExercise
  onContinue: () => void
  skipLabel?: string
}): React.JSX.Element {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-6" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">{exercise.title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This mission has its own guided flow with real progress tracking — it opens in its own focused view, then brings you straight back here.
        </p>
      </div>
      <Button onClick={onContinue} size="lg" className="rounded-full" data-gated-continue="true">
        {skipLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}

