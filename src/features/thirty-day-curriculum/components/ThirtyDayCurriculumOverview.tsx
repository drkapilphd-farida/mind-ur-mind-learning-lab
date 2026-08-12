'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Lock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { CHECKPOINT_DAYS, CURRICULUM_PHASES, TOTAL_CURRICULUM_DAYS, getCurriculumDayTheme, type CurriculumPhaseId } from '../curriculumDatabase'
import {
  computeBrainDevelopmentScore,
  computeConsistencyPercent,
  computeVisualizationDepthPercent,
  isCurriculumDayUnlocked,
  loadCurriculumProgress,
  type CurriculumProgress,
} from '../curriculumProgress'

const CARD_CLASS_NAME = 'rounded-3xl border-2 border-border/60 bg-[#FBF9F4]/95 shadow-sm backdrop-blur-md dark:bg-[#16171A]/95'

type ThirtyDayCurriculumOverviewProps = {
  onSelectDay: (day: number) => void
  refreshKey: number
}

function metricLabel(value: number | null, suffix: string): string {
  return value === null ? '—' : `${value}${suffix}`
}

export function ThirtyDayCurriculumOverview({ onSelectDay, refreshKey }: ThirtyDayCurriculumOverviewProps): React.JSX.Element {
  // Client-only load — same SSR-hydration-mismatch reasoning every other
  // localStorage-backed exercise in this project already follows.
  const [progress, setProgress] = useState<CurriculumProgress | null>(null)
  const [visualizationDepthPercent, setVisualizationDepthPercent] = useState<number | null>(null)

  useEffect(() => {
    setProgress(loadCurriculumProgress())
    setVisualizationDepthPercent(computeVisualizationDepthPercent())
  }, [refreshKey])

  if (progress === null) return <div className="min-h-[60vh]" />

  const brainScore = computeBrainDevelopmentScore(progress)
  const consistencyPercent = computeConsistencyPercent(progress)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="relative rounded-3xl border-2 border-border/60 bg-[#FBF9F4]/95 p-6 shadow-sm backdrop-blur-md dark:bg-[#16171A]/95">
        <BrandWatermark className="absolute top-4 left-6" />
        <div className="mt-8 flex flex-col gap-2 sm:mt-6">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">30-Day Quantum Speed Reading Mastery Curriculum™</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your Daily Roadmap</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            30 sequential days across 4 phases, blending Brain Gym, Right-Brain/Intuition, Visualization, and Core Reading Intelligence into one
            balanced circuit — with real WPM and comprehension checkpoints along the way.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MetricTile label="Brain Score" value={brainScore === null ? '—' : String(brainScore.score)} />
          <MetricTile label="Reading Growth" value={metricLabel(brainScore?.readingGrowthPercent ?? null, '%')} />
          <MetricTile label="Comprehension" value={metricLabel(brainScore?.comprehensionAveragePercent ?? null, '%')} />
          <MetricTile label="Consistency" value={`${consistencyPercent}%`} />
          <MetricTile label="Visualization Depth" value={metricLabel(visualizationDepthPercent, '%')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CURRICULUM_PHASES.map((phase) => (
          <PhaseCard key={phase.id} phaseId={phase.id} progress={progress} />
        ))}
      </div>

      <div className={`${CARD_CLASS_NAME} p-6`}>
        <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">All 30 Days</h2>
        <p className="mt-1 text-xs text-muted-foreground">Day N unlocks once Day N-1 is complete. Star days are real WPM + comprehension checkpoints.</p>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-10">
          {Array.from({ length: TOTAL_CURRICULUM_DAYS }, (_, index) => index + 1).map((day) => (
            <DayCell key={day} day={day} progress={progress} onSelectDay={onSelectDay} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricTile({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-3 text-center">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-heading text-lg font-bold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function PhaseCard({ phaseId, progress }: { phaseId: CurriculumPhaseId; progress: CurriculumProgress }): React.JSX.Element {
  const phase = CURRICULUM_PHASES.find((candidate) => candidate.id === phaseId)!
  const [start, end] = phase.dayRange
  const totalDaysInPhase = end - start + 1
  const completedDaysInPhase = progress.completedDays.filter((day) => day >= start && day <= end).length

  return (
    <Card className={CARD_CLASS_NAME}>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-widest text-primary uppercase">
            Phase {phase.id} · Days {start}-{end}
          </p>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {completedDaysInPhase}/{totalDaysInPhase}
          </Badge>
        </div>
        <h3 className="font-heading text-base font-bold tracking-tight text-foreground">{phase.title}</h3>
        <p className="text-sm text-muted-foreground">{phase.description}</p>
      </CardContent>
    </Card>
  )
}

function DayCell({ day, progress, onSelectDay }: { day: number; progress: CurriculumProgress; onSelectDay: (day: number) => void }): React.JSX.Element {
  const unlocked = isCurriculumDayUnlocked(day, progress)
  const completed = progress.completedDays.includes(day)
  const isCheckpoint = CHECKPOINT_DAYS.includes(day)
  const theme = getCurriculumDayTheme(day)

  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={() => onSelectDay(day)}
      title={theme.title}
      data-day={day}
      data-day-unlocked={unlocked}
      data-day-completed={completed}
      className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-xs font-semibold tabular-nums transition-colors ${
        completed
          ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : unlocked
            ? 'border-border/60 bg-card/60 text-foreground hover:bg-accent/20'
            : 'cursor-not-allowed border-border/30 bg-muted/30 text-muted-foreground/50'
      }`}
    >
      {isCheckpoint && <Sparkles className="absolute top-1 right-1 size-2.5 text-amber-500" aria-hidden="true" />}
      {completed ? (
        <CheckCircle2 className="size-4" aria-hidden="true" />
      ) : unlocked ? (
        <span>{day}</span>
      ) : (
        <Lock className="size-3.5" aria-hidden="true" />
      )}
      {(completed || unlocked) && <span className="text-[9px] font-normal opacity-70">Day {day}</span>}
    </button>
  )
}
