'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CURRICULUM_CATEGORY_LABELS, getCurriculumExerciseById, type CurriculumExerciseCategory } from '../curriculumExerciseCatalog'
import { buildCurriculumDayPlan, type CurriculumDayExercises } from '../curriculumDatabase'
import { getCurrentSessionExerciseHref, loadActiveCurriculumSession, startCurriculumSession } from '../curriculumSessionRunner'

const CATEGORY_ORDER: readonly CurriculumExerciseCategory[] = ['brain-gym', 'right-brain-intuition', 'visualization', 'reading-intelligence']

type DaySessionRunnerProps = {
  day: number
}

function flattenQueueIds(exercises: CurriculumDayExercises): readonly string[] {
  const groups: Record<CurriculumExerciseCategory, readonly { id: string }[]> = {
    'brain-gym': exercises.brainGym,
    'right-brain-intuition': exercises.rightBrainIntuition,
    visualization: exercises.visualization,
    'reading-intelligence': exercises.readingIntelligence,
  }
  return CATEGORY_ORDER.flatMap((category) => groups[category].map((exercise) => exercise.id))
}

// Immersive Daily Session Playlist™ — the guided launch surface for a
// curriculum day. Real full-page navigations chain the actual exercises
// together (see curriculumSessionRunner.ts/curriculumReturnRouting.ts's
// own doc comments for why — every exercise is its own standalone
// route/engine, there's no single embeddable "play all" component), so
// this component's job is narrower than the name might suggest: show the
// day's real playlist, start (or resume) the session, and hand off to
// the first (or current) exercise's real route. Everything after that —
// advancing between exercises, and marking the day complete on the
// final one — happens inside each exercise's own smart exit/complete
// wiring, transparently to this component.
export function DaySessionRunner({ day }: DaySessionRunnerProps): React.JSX.Element {
  const router = useRouter()
  const plan = buildCurriculumDayPlan(day)
  const queueIds = flattenQueueIds(plan.exercises)

  const [resumeIndex, setResumeIndex] = useState<number | null>(null)

  useEffect(() => {
    const activeSession = loadActiveCurriculumSession()
    if (activeSession !== null && activeSession.day === day) {
      setResumeIndex(activeSession.currentIndex)
    } else {
      setResumeIndex(null)
    }
  }, [day])

  function handleBegin(): void {
    const session = startCurriculumSession(day)
    const firstHref = getCurrentSessionExerciseHref(session)
    if (firstHref !== null) router.push(firstHref)
  }

  function handleResume(): void {
    const activeSession = loadActiveCurriculumSession()
    if (activeSession === null) {
      handleBegin()
      return
    }
    const href = getCurrentSessionExerciseHref(activeSession)
    if (href !== null) router.push(href)
  }

  const isResuming = resumeIndex !== null && resumeIndex > 0

  return (
    <div className="rounded-3xl border-2 border-border/60 bg-[#FBF9F4]/95 p-6 shadow-sm backdrop-blur-md dark:bg-[#16171A]/95" data-day-session-runner={day}>
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Immersive Daily Session
      </p>
      <h2 className="mt-1 font-heading text-lg font-bold tracking-tight text-foreground">Today&apos;s Playlist</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One guided sequence — Brain Gym, Right-Brain, Visualization, then Reading Intelligence. Finishing the last exercise automatically completes the day.
      </p>

      <ol className="mt-4 flex flex-col gap-2">
        {queueIds.map((exerciseId, index) => {
          const exercise = getCurriculumExerciseById(exerciseId)
          if (exercise === undefined) return null
          const isDone = resumeIndex !== null && index < resumeIndex
          const isCurrent = resumeIndex !== null && index === resumeIndex
          return (
            <li
              key={`${exerciseId}-${index}`}
              data-playlist-step={index}
              data-playlist-step-status={isDone ? 'done' : isCurrent ? 'current' : 'pending'}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
                isCurrent ? 'border-primary/60 bg-primary/5 font-semibold text-foreground' : 'border-border/60 bg-card/60 text-foreground'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden="true" />
              ) : (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/60 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{exercise.title}</span>
              <span className="shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{CURRICULUM_CATEGORY_LABELS[exercise.category]}</span>
            </li>
          )
        })}
      </ol>

      <Button onClick={isResuming ? handleResume : handleBegin} size="lg" className="mt-5 w-full rounded-full" data-begin-session="true">
        <Play className="size-4" aria-hidden="true" />
        {isResuming ? `Resume at Exercise ${resumeIndex! + 1} of ${queueIds.length}` : 'Begin Immersive Session →'}
      </Button>
    </div>
  )
}
