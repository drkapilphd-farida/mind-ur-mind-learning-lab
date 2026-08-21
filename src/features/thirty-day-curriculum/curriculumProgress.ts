// 30-Day Quantum Speed Reading Mastery Curriculum™ — client-only
// (localStorage) progress engine. Deliberately separate from the
// existing 21-Day Quantum Journey's Supabase-backed tables/components —
// this feature never reads or writes journey_baseline_diagnostics or any
// `daily_quantum_sessions` row, so the two features can never collide.
//
// Day-unlocking here is genuinely sequential (day N unlocks only once
// day N-1 is marked complete), unlike the 21-Day Journey's
// paywall-only `isDayUnlocked` — see ThirtyDayCurriculumOverview.tsx for
// where this is enforced in the UI. `isDevUnlockEnabled()` — the same
// platform-wide dev/test bypass every other gated flow already uses
// (Reading Hub sequences, the 21-Day Journey's own Pro gate, etc.) —
// additionally unlocks all 30 days for launch-day testing/review,
// evaluating true only in local development or when a real deployment
// deliberately opts in via NEXT_PUBLIC_DEV_UNLOCK; production users keep
// the real sequential gate.
import { loadBestColorSceneTransformationStats } from '@/features/color-scene-transformation/colorSceneTransformationLocalHistory'
import { loadBestFluidEnergyBalancerStats } from '@/features/fluid-energy-balancer/fluidEnergyBalancerLocalHistory'
import { loadBestQuantumMentalRotationStats } from '@/features/quantum-mental-rotation/quantumMentalRotationLocalHistory'
import { loadBestSensoryHologramBuilderStats } from '@/features/sensory-hologram-builder/sensoryHologramBuilderLocalHistory'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
import { TOTAL_CURRICULUM_DAYS } from './curriculumDatabase'

export const CURRICULUM_PROGRESS_STORAGE_KEY = 'qsr-thirty-day-curriculum-progress'

export type CurriculumCheckpointResult = {
  day: number
  rawWpm: number
  trueWpm: number
  comprehensionAccuracyPercent: number
  completedAt: string
}

export type CurriculumProgress = {
  completedDays: readonly number[]
  checkpoints: Readonly<Record<number, CurriculumCheckpointResult>>
}

const EMPTY_PROGRESS: CurriculumProgress = { completedDays: [], checkpoints: {} }

function isValidCheckpointResult(value: unknown): value is CurriculumCheckpointResult {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.day === 'number' &&
    typeof record.rawWpm === 'number' &&
    typeof record.trueWpm === 'number' &&
    typeof record.comprehensionAccuracyPercent === 'number' &&
    typeof record.completedAt === 'string'
  )
}

export function loadCurriculumProgress(): CurriculumProgress {
  if (typeof window === 'undefined') return EMPTY_PROGRESS
  try {
    const raw = localStorage.getItem(CURRICULUM_PROGRESS_STORAGE_KEY)
    if (!raw) return EMPTY_PROGRESS
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_PROGRESS
    const record = parsed as { completedDays?: unknown; checkpoints?: unknown }

    const completedDays = Array.isArray(record.completedDays)
      ? record.completedDays.filter((day): day is number => typeof day === 'number' && day >= 1 && day <= TOTAL_CURRICULUM_DAYS)
      : []

    const checkpoints: Record<number, CurriculumCheckpointResult> = {}
    if (typeof record.checkpoints === 'object' && record.checkpoints !== null) {
      for (const [key, value] of Object.entries(record.checkpoints as Record<string, unknown>)) {
        const day = Number(key)
        if (Number.isInteger(day) && isValidCheckpointResult(value)) {
          checkpoints[day] = value
        }
      }
    }

    return { completedDays, checkpoints }
  } catch {
    return EMPTY_PROGRESS
  }
}

function saveCurriculumProgress(progress: CurriculumProgress): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CURRICULUM_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage full or blocked — fail silently, progress just resets next visit
  }
}

// 30-Day Masterclass Paywall™ — every one of the 30 days requires real
// Pro access now (`isPro`, resolved server-side via
// hasQuantumSpeedReadingProAccess and threaded down as a prop — see
// ThirtyDayCurriculumExperience.tsx). Day 1 is no longer a free
// exception the way it used to be. The sequential "day N needs day N-1
// complete" structure is kept underneath that gate, for a paying
// learner — this isn't a change to the program's pacing design, only to
// who can enter it at all.
export function isCurriculumDayUnlocked(day: number, progress: CurriculumProgress, isPro: boolean): boolean {
  if (isDevUnlockEnabled()) return true
  if (!isPro) return false
  if (day === 1) return true
  return progress.completedDays.includes(day - 1)
}

// The highest day the learner has progressed to by real completion —
// day N+1 once day N is complete, capped at TOTAL_CURRICULUM_DAYS. A
// pure content-sequencing display helper (the dashboard hero card's
// "Continue Day N" label), deliberately decoupled from isPro/paywall
// status — it answers "where did they leave off," not "can they enter
// right now." The real gate is isCurriculumDayUnlocked, enforced where
// a day is actually opened.
export function getHighestUnlockedDay(progress: CurriculumProgress): number {
  let highest = 1
  for (let day = 2; day <= TOTAL_CURRICULUM_DAYS; day++) {
    if (progress.completedDays.includes(day - 1)) highest = day
    else break
  }
  return highest
}

export function markCurriculumDayComplete(day: number): CurriculumProgress {
  const previous = loadCurriculumProgress()
  const completedDays = previous.completedDays.includes(day) ? previous.completedDays : [...previous.completedDays, day].sort((a, b) => a - b)
  const next: CurriculumProgress = { completedDays, checkpoints: previous.checkpoints }
  saveCurriculumProgress(next)
  return next
}

// Records a checkpoint's real, measured result and marks its day
// complete in the same write — a checkpoint day's assessment IS that
// day's completion condition, there is no separate "mark complete" step.
export function recordCurriculumCheckpoint(result: CurriculumCheckpointResult): CurriculumProgress {
  const previous = loadCurriculumProgress()
  const checkpoints = { ...previous.checkpoints, [result.day]: result }
  const completedDays = previous.completedDays.includes(result.day)
    ? previous.completedDays
    : [...previous.completedDays, result.day].sort((a, b) => a - b)
  const next: CurriculumProgress = { completedDays, checkpoints }
  saveCurriculumProgress(next)
  return next
}

function getOrderedCheckpoints(progress: CurriculumProgress): readonly CurriculumCheckpointResult[] {
  return Object.values(progress.checkpoints).sort((a, b) => a.day - b.day)
}

// Real average of every recorded checkpoint's comprehension score — null
// (never a fabricated number) until at least one checkpoint exists.
export function computeComprehensionAveragePercent(progress: CurriculumProgress): number | null {
  const checkpoints = getOrderedCheckpoints(progress)
  if (checkpoints.length === 0) return null
  const total = checkpoints.reduce((sum, checkpoint) => sum + checkpoint.comprehensionAccuracyPercent, 0)
  return Math.round(total / checkpoints.length)
}

// Growth needs two real data points (a baseline and a later re-measure)
// to mean anything — null until then, clamped at 0 so a temporary dip
// never shows as a nonsensical negative "growth" percent.
export function computeReadingGrowthPercent(progress: CurriculumProgress): number | null {
  const checkpoints = getOrderedCheckpoints(progress)
  if (checkpoints.length < 2) return null
  const baseline = checkpoints[0]!
  const latest = checkpoints[checkpoints.length - 1]!
  if (baseline.trueWpm <= 0) return null
  const growth = Math.round(((latest.trueWpm - baseline.trueWpm) / baseline.trueWpm) * 100)
  return Math.max(0, growth)
}

export function computeConsistencyPercent(progress: CurriculumProgress): number {
  return Math.round((progress.completedDays.length / TOTAL_CURRICULUM_DAYS) * 100)
}

type VisualizationStatsLoader = () => { bestScorePercent: number }

// Cross-reads the 4 Visualization Hub exercises' own already-public
// local-history loaders — the same pattern VisualizationHubModeCard.tsx
// itself uses to read across exercises it doesn't own. Averages only the
// ones the learner has actually attempted (bestScorePercent/bestAccuracyPercent > 0,
// matching this project's "0 means untouched" sentinel convention);
// returns null rather than a fabricated number if none have been attempted yet.
const VISUALIZATION_STATS_LOADERS: readonly VisualizationStatsLoader[] = [
  () => {
    const stats = loadBestQuantumMentalRotationStats('qsr-quantum-mental-rotation-best')
    return { bestScorePercent: stats.bestAccuracyPercent }
  },
  () => {
    const stats = loadBestColorSceneTransformationStats('qsr-color-scene-transformation-best')
    return { bestScorePercent: stats.bestAccuracyPercent }
  },
  () => loadBestSensoryHologramBuilderStats('qsr-sensory-hologram-builder-best'),
  () => loadBestFluidEnergyBalancerStats('qsr-fluid-energy-balancer-best'),
]

export function computeVisualizationDepthPercent(): number | null {
  const attemptedScores = VISUALIZATION_STATS_LOADERS.map((loadStats) => loadStats().bestScorePercent).filter((score) => score > 0)
  if (attemptedScores.length === 0) return null
  return Math.round(attemptedScores.reduce((sum, score) => sum + score, 0) / attemptedScores.length)
}

export type CurriculumBrainDevelopmentScore = {
  score: number
  readingGrowthPercent: number
  comprehensionAveragePercent: number
  consistencyPercent: number
}

// 40% reading growth / 30% comprehension average / 30% consistency —
// computed purely from this curriculum's own checkpoint + completion
// data. Deliberately does NOT fold in visualization depth (that stays a
// separate, honestly-labeled metric on the dashboard) — reaching into
// 15+ other exercises' own storage to blend into one opaque composite
// would be fragile coupling for a number nobody could audit.
export function computeBrainDevelopmentScore(progress: CurriculumProgress): CurriculumBrainDevelopmentScore | null {
  const readingGrowthPercent = computeReadingGrowthPercent(progress)
  const comprehensionAveragePercent = computeComprehensionAveragePercent(progress)
  if (readingGrowthPercent === null || comprehensionAveragePercent === null) return null
  const consistencyPercent = computeConsistencyPercent(progress)
  const score = Math.round(readingGrowthPercent * 0.4 + comprehensionAveragePercent * 0.3 + consistencyPercent * 0.3)
  return { score, readingGrowthPercent, comprehensionAveragePercent, consistencyPercent }
}
