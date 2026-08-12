'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { RsvpModePlayer, type RsvpModeResult } from '@/features/quantum-journey/readingModes/components/RsvpModePlayer'
import { computeDefaultTargetWpm } from '@/features/quantum-journey/readingModes/pacingMath'
import { computeTrueWpm } from '@/features/quantum-journey/trueWpm'
import type { JourneyLengthTier } from '@/features/quantum-journey/readingContent'
import { getPhaseForDay } from '../curriculumDatabase'
import type { CurriculumCheckpointResult } from '../curriculumProgress'

type CurriculumAssessmentCanvasProps = {
  day: number
  mostRecentTrueWpm: number | null
  onComplete: (result: CurriculumCheckpointResult) => void
}

// Own-copy paper-card + frosted-glass constant — same recipe every other
// flagship exercise in this project hand-copies (e.g.
// FluidEnergyBalancerCanvas.tsx's own CARD_CLASS_NAME); no shared export
// exists for it yet, so this follows the established convention rather
// than inventing a new one.
const CARD_CLASS_NAME = 'relative w-full rounded-3xl border-2 border-border/60 bg-[#FBF9F4]/95 p-2 shadow-sm backdrop-blur-md dark:bg-[#16171A]/95'

function lengthTierForDay(day: number): JourneyLengthTier {
  if (day === 1) return 'short'
  if (day === 30) return 'long'
  return 'medium'
}

function targetWpmWeekForDay(day: number): 1 | 2 | 3 {
  const phase = getPhaseForDay(day)
  return phase === 1 ? 1 : phase === 2 ? 2 : 3
}

// Reused for both the mandatory Day 1 baseline AND every later checkpoint
// (days 7/14/21/30) — deliberately reuses RsvpModePlayer itself, the same
// real, RSVP-paced (not self-timed) WPM engine the Baseline Reading Speed
// Diagnostic™ already proved out, rather than inventing a second reading
// runtime. Unlike that one-time diagnostic, this deliberately does NOT
// pass a `selectedSetOverride` — leaving RsvpModePlayer free to draw from
// the full 8-category rotation pool (with its own built-in anti-repeat
// logic), since this component gets reused 5 times across 30 days and
// needs real content variety. `lengthTier` steps up with the day (short
// baseline -> medium mid-course -> long final certification) and the
// starting pace anchors to the learner's own most recent real checkpoint
// WPM rather than a generic constant, mirroring computeDefaultTargetWpm's
// own "anchor to the user's real number" convention.
export function CurriculumAssessmentCanvas({ day, mostRecentTrueWpm, onComplete }: CurriculumAssessmentCanvasProps): React.JSX.Element {
  const [result, setResult] = useState<CurriculumCheckpointResult | null>(null)

  function handleRsvpComplete({ wpm, accuracyPercent }: RsvpModeResult): void {
    const trueWpm = computeTrueWpm(wpm, accuracyPercent)
    setResult({
      day,
      rawWpm: wpm,
      trueWpm,
      comprehensionAccuracyPercent: accuracyPercent,
      completedAt: new Date().toISOString(),
    })
  }

  return (
    <div className={CARD_CLASS_NAME} data-day={day} data-assessment-phase={result === null ? 'reading' : 'result'}>
      <BrandWatermark className="absolute top-4 left-6" />

      {result === null ? (
        <RsvpModePlayer
          lengthTier={lengthTierForDay(day)}
          initialTargetWpm={computeDefaultTargetWpm(targetWpmWeekForDay(day), mostRecentTrueWpm)}
          onComplete={handleRsvpComplete}
        />
      ) : (
        <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Checkpoint Complete™</p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Day {day} Assessment</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-4">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">True WPM</p>
              <p className="font-heading text-xl font-bold tabular-nums text-foreground" data-true-wpm={result.trueWpm}>
                {result.trueWpm} WPM
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Comprehension</p>
              <p className="font-heading text-xl font-bold tabular-nums text-foreground">{result.comprehensionAccuracyPercent}%</p>
            </div>
          </div>

          <Button onClick={() => onComplete(result)} size="lg" className="rounded-full" data-continue-button="true">
            Continue →
          </Button>
        </div>
      )}
    </div>
  )
}
