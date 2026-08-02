'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  ReadingPlayerExerciseOutcome,
  ReadingPlayerMode,
  ReadingPlayerPhase,
  ReadingPlayerSessionSummary,
} from '../types'
import { WelcomeAnimation } from './WelcomeAnimation'
import { DailyMissionBanner } from './DailyMissionBanner'
import { ReadingObjectiveCard } from './ReadingObjectiveCard'
import { ExerciseTransition } from './ExerciseTransition'
import { ExitConfirmationDialog } from './ExitConfirmationDialog'
import { ReadingPlayerSummaryScreen } from './ReadingPlayerSummaryScreen'

type PremiumReadingPlayerProps = {
  mode: ReadingPlayerMode
  stageTitle: string
  exerciseTitle: string
  missionText: string
  objectiveText: string
  estimatedTime: string | null
  exitHref: string
  progressLabel: string | null
  // The caller mounts the actual, unmodified engine for this mode
  // (UniversalExercisePlayer for flash/chunk, RsvpExperience for streaming)
  // and must call the given callback when it reports completion. This
  // feature contains zero flash/chunk/streaming rendering logic of its own.
  renderActiveExperience: (onExerciseComplete: (outcome: ReadingPlayerExerciseOutcome) => void) => React.ReactNode
  // Supplied once the caller has loaded fresh reading-intelligence data and
  // composed it via buildReadingPlayerSessionSummary — null while pending.
  sessionSummary: ReadingPlayerSessionSummary | null
}

// The single orchestration layer that presents the reading session: Welcome
// -> Daily Mission Banner + Reading Objective -> Exercise Transition -> the
// caller-supplied active experience (untouched, existing engine) -> Session
// Summary. Never rewrites, wraps the internals of, or intercepts the exit/
// pause controls already built into the child engines — see this feature's
// root index.ts header for the exact reasoning and known limitations.
export function PremiumReadingPlayer({
  mode,
  stageTitle,
  exerciseTitle,
  missionText,
  objectiveText,
  estimatedTime,
  exitHref,
  progressLabel,
  renderActiveExperience,
  sessionSummary,
}: PremiumReadingPlayerProps): React.JSX.Element {
  const [phase, setPhase] = useState<ReadingPlayerPhase>('welcome')
  const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false)
  const phaseContentRef = useRef<HTMLDivElement | null>(null)

  // Sprint 51 — accessibility polish. A keyboard/screen-reader user's focus
  // otherwise stays wherever it was as the whole screen changes underneath
  // them on each phase transition. Moving focus to the phase content on
  // change is the standard SPA step-transition pattern; `outline-none` keeps
  // this invisible under normal (mouse) use, matching "no visual redesign."
  useEffect(() => {
    phaseContentRef.current?.focus()
  }, [phase])

  function handleExerciseComplete(_outcome: ReadingPlayerExerciseOutcome): void {
    setPhase('completed')
  }

  return (
    <div className="relative min-h-[100dvh]">
      {phase !== 'completed' && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            aria-label="Exit session"
            onClick={() => setIsExitConfirmationOpen(true)}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Exit
          </button>
        </div>
      )}

      <div ref={phaseContentRef} tabIndex={-1} className="outline-none">
        {phase === 'welcome' && (
          <WelcomeAnimation
            mode={mode}
            stageTitle={stageTitle}
            exerciseTitle={exerciseTitle}
            onContinue={() => setPhase('mission')}
          />
        )}

        {phase === 'mission' && (
          <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
            <DailyMissionBanner missionText={missionText} />
            <ReadingObjectiveCard objectiveText={objectiveText} estimatedTime={estimatedTime} />
            <ExerciseTransition exerciseTitle={exerciseTitle} onComplete={() => setPhase('active')} />
          </div>
        )}

        {phase === 'active' && renderActiveExperience(handleExerciseComplete)}

        {phase === 'completed' && sessionSummary !== null && (
          <ReadingPlayerSummaryScreen summary={sessionSummary} progressLabel={progressLabel} labHref={exitHref} />
        )}

        {phase === 'completed' && sessionSummary === null && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-sm text-muted-foreground">Saving your progress…</p>
          </div>
        )}
      </div>

      <ExitConfirmationDialog
        open={isExitConfirmationOpen}
        exerciseTitle={exerciseTitle}
        onCancel={() => setIsExitConfirmationOpen(false)}
        onConfirmExit={() => {
          window.location.href = exitHref
        }}
      />
    </div>
  )
}
