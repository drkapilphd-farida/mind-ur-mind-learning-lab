'use client'

import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { buildCurriculumDayPlan, getCurriculumPhase, isCheckpointDay } from '../curriculumDatabase'
import type { CurriculumProgress } from '../curriculumProgress'
import { DayMasterPlayer } from './DayMasterPlayer'

const CARD_CLASS_NAME = 'relative rounded-3xl border-2 border-border/60 bg-[#FBF9F4]/95 shadow-sm backdrop-blur-md dark:bg-[#16171A]/95'

type ThirtyDayCurriculumDayDetailProps = {
  day: number
  progress: CurriculumProgress
  justCompletedDay?: boolean
  onBack: () => void
  onLaunchAssessment: (day: number) => void
}

// Day Detail™ — now just a thin frame (theme header + celebration
// banner) around DayMasterPlayer, the in-page wizard that IS the day's
// content. The old plain multi-link exercise list and manual "Mark Day
// Complete" button are gone — bouncing across separate pages to click
// through a checklist was exactly the "critical UX bug" this
// restructuring set out to fix. Completion now only ever happens
// automatically, the instant the wizard's final step finishes (see
// DayMasterPlayer.tsx). On a checkpoint day, finishing the wizard's
// exercise queue hands off to the real assessment via
// `onReadyForCheckpoint` rather than completing the day itself — a
// checkpoint day's real completion condition is always the WPM +
// comprehension check-in, never bypassable by just clicking through
// exercises (see curriculumReturnRouting.ts's own doc comment on this).
export function ThirtyDayCurriculumDayDetail({
  day,
  progress,
  justCompletedDay = false,
  onBack,
  onLaunchAssessment,
}: ThirtyDayCurriculumDayDetailProps): React.JSX.Element {
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

      {justCompletedDay && (
        <div
          className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
          data-day-complete-celebration="true"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          Day {day} complete! Day {day + 1} is now unlocked.
        </div>
      )}

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

      {isCompleted ? (
        <div className={`${CARD_CLASS_NAME} p-6`}>
          {requiresCheckpoint && checkpoint !== undefined ? (
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
            <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">Day {day} complete — nice work.</p>
          )}
        </div>
      ) : (
        <DayMasterPlayer day={day} onExitToRoadmap={onBack} onDayComplete={onBack} onReadyForCheckpoint={() => onLaunchAssessment(day)} />
      )}
    </div>
  )
}
