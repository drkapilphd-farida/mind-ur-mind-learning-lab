'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { CURRICULUM_CATEGORY_LABELS, type CurriculumCatalogExercise, type CurriculumExerciseCategory } from '../curriculumExerciseCatalog'
import { buildCurriculumDayPlan, getCurriculumPhase, isCheckpointDay, type CurriculumDayExercises } from '../curriculumDatabase'
import type { CurriculumProgress } from '../curriculumProgress'

const CARD_CLASS_NAME = 'relative rounded-3xl border-2 border-border/60 bg-[#FBF9F4]/95 shadow-sm backdrop-blur-md dark:bg-[#16171A]/95'

type ThirtyDayCurriculumDayDetailProps = {
  day: number
  progress: CurriculumProgress
  onBack: () => void
  onMarkComplete: (day: number) => void
  onLaunchAssessment: (day: number) => void
}

const CATEGORY_ORDER: readonly CurriculumExerciseCategory[] = ['brain-gym', 'right-brain-intuition', 'visualization', 'reading-intelligence']

export function ThirtyDayCurriculumDayDetail({ day, progress, onBack, onMarkComplete, onLaunchAssessment }: ThirtyDayCurriculumDayDetailProps): React.JSX.Element {
  const plan = buildCurriculumDayPlan(day)
  const phase = getCurriculumPhase(plan.phase)
  const isCompleted = progress.completedDays.includes(day)
  const checkpoint = progress.checkpoints[day]
  const requiresCheckpoint = isCheckpointDay(day)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All 30 Days
      </button>

      <div className={`${CARD_CLASS_NAME} p-6`}>
        <BrandWatermark className="absolute top-4 left-6" />
        <div className="mt-8 flex flex-col gap-2 sm:mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              Phase {phase.id} · Day {day}
            </Badge>
            {requiresCheckpoint && (
              <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                <Sparkles className="size-3" aria-hidden="true" />
                Checkpoint Day
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                Completed
              </Badge>
            )}
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{plan.theme.title}</h1>
          <p className="text-sm text-muted-foreground">{plan.theme.focus}</p>
        </div>
      </div>

      <ExerciseCategoryList exercises={plan.exercises} />

      <div className={`${CARD_CLASS_NAME} p-6`}>
        {requiresCheckpoint ? (
          checkpoint !== undefined ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">Checkpoint Recorded</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-4">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">True WPM</p>
                  <p className="font-heading text-xl font-bold tabular-nums text-foreground">{checkpoint.trueWpm} WPM</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Comprehension</p>
                  <p className="font-heading text-xl font-bold tabular-nums text-foreground">{checkpoint.comprehensionAccuracyPercent}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                This is a checkpoint day — complete a short, real, RSVP-paced WPM and comprehension check to mark Day {day} complete.
              </p>
              <Button onClick={() => onLaunchAssessment(day)} size="lg" className="rounded-full" data-launch-assessment="true">
                Start Checkpoint Assessment →
              </Button>
            </div>
          )
        ) : isCompleted ? (
          <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">Day {day} complete — nice work.</p>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">Work through today&apos;s exercises above, then mark the day complete to unlock Day {day + 1}.</p>
            <Button onClick={() => onMarkComplete(day)} size="lg" className="rounded-full" data-mark-complete="true">
              Mark Day {day} Complete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ExerciseCategoryList({ exercises }: { exercises: CurriculumDayExercises }): React.JSX.Element {
  const groups: Record<CurriculumExerciseCategory, readonly CurriculumCatalogExercise[]> = {
    'brain-gym': exercises.brainGym,
    'right-brain-intuition': exercises.rightBrainIntuition,
    visualization: exercises.visualization,
    'reading-intelligence': exercises.readingIntelligence,
  }

  return (
    <div className={`${CARD_CLASS_NAME} p-6`}>
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">Today&apos;s Circuit</h2>
      <div className="mt-4 flex flex-col gap-4">
        {CATEGORY_ORDER.map((category) => (
          <div key={category} className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{CURRICULUM_CATEGORY_LABELS[category]}</p>
            <div className="flex flex-col gap-1.5">
              {groups[category].map((exercise) => (
                <Link
                  key={exercise.id}
                  href={exercise.href}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/20"
                >
                  {exercise.title}
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
