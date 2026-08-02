'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
import { playClickChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import { MindAwakeningPhase } from '@/app/unified-quantum-session-preview/components/MindAwakeningPhase'
import { QuantumReadingSprintPhase, type QuantumReadingSprintResult } from '@/app/unified-quantum-session-preview/components/QuantumReadingSprintPhase'
import { RetentionCheckPhase } from '@/app/unified-quantum-session-preview/components/RetentionCheckPhase'
import { computeReadingXp, computeRetentionXp, computeReadingPowerScore } from '@/app/unified-quantum-session-preview/components/quantumReadingSprintDataset'
import { saveDailyQuantumSession } from '@/app/unified-quantum-session-preview/actions/saveDailyQuantumSession'
import { ProgressiveChunkReadingExperience } from '@/features/progressive-chunk-reading/components/ProgressiveChunkReadingExperience'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import { EyeWarmupExperience } from '@/features/quantum-speed-reading/components/EyeWarmupExperience'
import { SchulteGridDrillExperience } from '@/features/schulte-grid-drill/components/SchulteGridDrillExperience'
import { WordFlashExperience } from '@/features/flash-intelligence/components/WordFlashExperience'
import { BrainGymCircuitExperience } from '@/features/brain-gym/components/BrainGymCircuitExperience'
import { EspZenerTelepathyExperience } from '@/features/esp-zener-telepathy/components/EspZenerTelepathyExperience'
import { PhotographicMemoryExperience } from '@/features/photographic-memory/components/PhotographicMemoryExperience'
import { HemisphericColorSyncExperience } from '@/features/hemispheric-color-sync/components/HemisphericColorSyncExperience'
import { ColorSceneTransformationExperience } from '@/features/color-scene-transformation/components/ColorSceneTransformationExperience'
import { QuantumMentalRotationExperience } from '@/features/quantum-mental-rotation/components/QuantumMentalRotationExperience'
import { JourneyReadingModePlayer, type JourneyReadingModeResult } from './JourneyReadingModePlayer'
import { PreSessionBriefingScreen } from './PreSessionBriefingScreen'
import { GrandCelebrationScreen } from './GrandCelebrationScreen'
import { ReadingModeSelector } from '../readingModes/components/ReadingModeSelector'
import { GuidingLinePacerPlayer, type GuidingLinePacerResult } from '../readingModes/components/GuidingLinePacerPlayer'
import { RsvpModePlayer, type RsvpModeResult } from '../readingModes/components/RsvpModePlayer'
import { getDefaultPresentationChoice, computeDefaultTargetWpm, type ReadingPresentationChoice } from '../readingModes/pacingMath'
import { getMilestoneHitExactly } from '../streakMotivation'
import {
  getStep1AndStep2,
  getWeaknessDrill,
  canInjectWeaknessDrill,
  getWeekNumber,
  getWeekTheme,
  getReadingMode,
  getReadingLengthTier,
  isMandatoryBreathingDay,
  type JourneyStepExercise,
  type ReadingMode,
} from '../quantumJourneyLevels'
import { computeAutoPacedSpeedMultiplier } from '../adaptivePacing'
import { computeTrueWpm } from '../trueWpm'
import { recordDomainPerformance, type RecordableJourneyDomain } from '../actions/recordDomainPerformance'
import { generateCoachFeedback } from '../actions/generateCoachFeedback'
import type { WeakestDomainResult } from '../queries/getWeakestDomain'
import { JOURNEY_DOMAIN_LABELS } from '../types'

type QuantumJourneySessionProps = {
  day: number
  weakestDomain: WeakestDomainResult
  previousReadingAccuracyPercent: number | null
  // The real streak as of page load — BEFORE today's session. Per
  // computeDailyQuantumStreak's own "alive through today" semantics, a
  // freshly-saved today's session always extends this by exactly +1,
  // regardless of any prior gap — see the completion screen below.
  currentStreak: number
  // Baseline Test™ — the user's own real Day-1 WPM (null before it
  // exists yet), and whether *today* is that very first session.
  baselineWpm: number | null
  isBaselineDay: boolean
  // Pre-Session AI Coach Welcome & Briefing™ — the real WPM/gap from the
  // user's own last session (null before any session exists), and their
  // first name for personalization.
  studentFirstName: string
  previousReadingWpm: number | null
  daysSinceLastSession: number | null
}

type LevelState = 'briefing' | 1 | 2 | 3 | 4 | 'complete'
type DayReadingSummary = { wpm: number; accuracyPercent: number }

// Full Reading Sprint Variety™ — a display label for each of the 6
// rotating reading modes (see getReadingMode in quantumJourneyLevels.ts).
const READING_MODE_STEP_LABELS: Record<ReadingMode, string> = {
  'quantum-reading-sprint': 'Core Reading & Chunking Sprint',
  phrase: 'Phrase Reading™',
  'vertical-word': 'Vertical Word Reading™',
  sentence: 'Sentence Reading™',
  paragraph: 'Paragraph Reading™',
  'dynamic-chunking': 'Dynamic Chunking™',
}

function WarmupPrepScreen({ exerciseTitle, onStart, onSkip }: { exerciseTitle: string; onStart: () => void; onSkip: () => void }): React.JSX.Element {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Zap className="size-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Today&rsquo;s Warm-up</p>
        <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">{exerciseTitle}</h2>
      </div>
      <div className="flex w-full flex-col items-center gap-3">
        <Button type="button" size="lg" className="w-full max-w-xs rounded-full" onClick={onStart}>
          Start Warm-up
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Skip Warm-up →
        </button>
      </div>
    </div>
  )
}

// 21-Day Transformation Journey™ — a world-class adaptive daily session.
// Targeted Breathing Schedule™: Step 1 is a mandatory 2-minute
// breath-awareness warm-up (MindAwakeningPhase, Skip disabled) only on
// Days 1, 3, 5, 7, 10, 14, 18, 20 (see isMandatoryBreathingDay) — every
// other day, Step 1 is skippable via a prep screen, Skip button front
// and center for anyone who just wants to get to the real exercises.
// Steps 1-2 draw from that week's real curriculum pool (see
// quantumJourneyLevels.ts), with Step 1 dynamically replaced by a
// targeted drill from the user's weakest domain when Smart Weakness
// Targeting™ detects genuine struggle — never in a way that breaks that
// week's own theme (canInjectWeaknessDrill). Step 3 rotates through all
// 6 reading modes (Full Reading Sprint Variety™) and grows in length
// week over week (Progressive Reading™ — see getReadingLengthTier);
// Step 4 (Retention Check) pairs with every mode except Dynamic
// Chunking, whose separate content-engine can't produce
// ReadingSet-shaped retention questions (see getReadingMode's own
// comment). Metric separation is structural throughout: only the
// reading step's result ever produces a WPM figure or feeds
// `daily_quantum_sessions`; Steps 1-2's accuracy feeds only
// `domain_performance_sessions`, and only for the 3 tracked, non-reading
// domains. Sprint 3™ — Baseline Test, True WPM, AI Smart Coach: Day 1's
// first-ever reading result becomes the user's real baseline (see
// adaptivePacing.ts's getBaselineSession), auto-pacing scales relative to
// that real number instead of a generic constant, every WPM this
// component ever persists or displays is comprehension-penalized
// (computeTrueWpm — raw pace with poor comprehension is honestly not
// "fast reading"), and the completion screen shows one real,
// Claude-generated coaching message grounded only in that day's actual
// numbers (generateCoachFeedback.ts). Visual Pacing & RSVP Modes™: Step 3
// always opens with a mode selector (ReadingModeSelector) letting the
// user choose Standard Text (today's rotation-assigned mode, unchanged),
// Guiding Line Pacer, or RSVP Mode, plus a live 200-600 WPM slider —
// Week 1 recommends the pacer, Weeks 2-3 recommend RSVP (Progressive
// Scaling™ also raises the *suggested* default WPM each week), but every
// option is always user-selectable. Both new modes reuse the same real
// content database and funnel into the exact same Retention Check +
// True WPM + save pipeline as every other reading mode — see
// readingModes/pacingMath.ts.
export function QuantumJourneySession({
  day,
  weakestDomain,
  previousReadingAccuracyPercent,
  currentStreak,
  baselineWpm,
  isBaselineDay,
  studentFirstName,
  previousReadingWpm,
  daysSinceLastSession,
}: QuantumJourneySessionProps): React.JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isFoundationBreathingDay = isMandatoryBreathingDay(day)
  const readingMode = useMemo(() => getReadingMode(day), [day])
  const readingLengthTier = useMemo(() => getReadingLengthTier(day), [day])
  const week = useMemo(() => getWeekNumber(day), [day])

  // Visual Pacing & RSVP Modes™ — Week 1 Integration recommends the
  // Guiding Line Pacer, Weeks 2-3 recommend RSVP Mode (see pacingMath.ts's
  // getDefaultPresentationChoice), and Progressive Scaling™ raises the
  // *suggested* target WPM each week — always just a default the mode
  // selector's own live slider lets the user override in either direction.
  const defaultPresentationChoice = useMemo(() => getDefaultPresentationChoice(week), [week])
  const defaultTargetWpm = useMemo(() => computeDefaultTargetWpm(week, baselineWpm), [week, baselineWpm])
  const [readingPresentationChoice, setReadingPresentationChoice] = useState<ReadingPresentationChoice | null>(null)
  const [targetWpm, setTargetWpm] = useState(defaultTargetWpm)

  // Retention Check pairs with every reading mode except Dynamic Chunking
  // (see getReadingMode's own comment on why that mode's content-engine
  // can't produce ReadingSet-shaped retention questions) — but Guiding
  // Line Pacer and RSVP Mode always draw from the same real, retention-
  // compatible content database regardless of which day's rotation they
  // override, so choosing either always restores the 4th step.
  const isStandardDynamicChunkingDay = (readingPresentationChoice === null || readingPresentationChoice === 'standard') && readingMode === 'dynamic-chunking'
  const totalSteps = isStandardDynamicChunkingDay ? 3 : 4

  const { step1: weekStep1, step2 } = useMemo(() => getStep1AndStep2(day), [day])
  // Clean 3-Week Phased Curriculum — Smart Weakness Targeting™ can never
  // override a week's own theme (canInjectWeaknessDrill's own comment
  // explains exactly which domains each week allows).
  const isWeaknessInjected =
    weakestDomain !== null && weakestDomain.domain !== 'reading' && canInjectWeaknessDrill(weakestDomain.domain, day)
  const step1 = useMemo(() => {
    if (weakestDomain !== null && weakestDomain.domain !== 'reading' && canInjectWeaknessDrill(weakestDomain.domain, day)) {
      return getWeaknessDrill(weakestDomain.domain, step2.exerciseId)
    }
    return weekStep1
  }, [weakestDomain, step2.exerciseId, weekStep1, day])

  const speedMultiplier = useMemo(
    () => computeAutoPacedSpeedMultiplier(previousReadingAccuracyPercent, baselineWpm),
    [previousReadingAccuracyPercent, baselineWpm],
  )
  const [chunkingSeed] = useState(() => Date.now())

  // Dev/Test Mode™ — a `?level=` override so QA can preview Steps 1-3
  // directly (also skipping the Pre-Session Briefing™). Step 4 depends on
  // Step 3's real result (the passage it quizzes on), so it's
  // deliberately excluded — reaching it means actually completing Step 3,
  // same as a real user. Everyone else always starts at the new
  // Pre-Session AI Coach Welcome & Briefing™ screen, before Step 1 ever
  // mounts.
  const [level, setLevel] = useState<LevelState>(() => {
    if (!isDevUnlockEnabled()) return 'briefing'
    const requestedLevel = Number(searchParams.get('level'))
    return requestedLevel >= 1 && requestedLevel <= 3 ? (requestedLevel as LevelState) : 'briefing'
  })
  const [hasStartedWarmup, setHasStartedWarmup] = useState(false)
  // Full Reading Sprint Variety™ — the classic Quantum Reading Sprint, the
  // 4 JourneyReadingModePlayer modes, and the 2 new pacing-style players
  // (Guiding Line Pacer, RSVP Mode) all produce structurally identical
  // result shapes (wpm/accuracyPercent/score/selectedSet), so one state
  // slot and one completion path serve every Retention-Check-eligible
  // reading experience.
  const [readingResult, setReadingResult] = useState<
    QuantumReadingSprintResult | JourneyReadingModeResult | GuidingLinePacerResult | RsvpModeResult | null
  >(null)
  const [dayReadingSummary, setDayReadingSummary] = useState<DayReadingSummary | null>(null)
  const [isSavingDay, setIsSavingDay] = useState(false)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)

  function advance(): void {
    playClickChime()
    setLevel((current) => (typeof current === 'number' ? ((current + 1) as LevelState) : current))
  }

  // Pre-Session AI Coach Welcome & Briefing™ — the briefing screen's own
  // CTA is never gated behind the AI message finishing (see
  // PreSessionBriefingScreen.tsx's own comment); this just moves into the
  // exact same Step 1 flow that already existed before this feature.
  function handleStartSession(): void {
    playClickChime()
    setLevel(1)
  }

  // Smart Weakness Targeting™ — the one place accuracy ever leaves Steps
  // 1-2: only a real accuracy% (never undefined/never Word Flash/Schulte
  // Grid, which have no accuracy% concept) and only for one of the 3
  // tracked, non-reading domains ever gets persisted here.
  function handleAuxiliaryComplete(exercise: JourneyStepExercise, accuracyPercent?: number): void {
    if (exercise.domain !== null && exercise.domain !== 'reading' && accuracyPercent !== undefined) {
      void recordDomainPerformance({
        domain: exercise.domain as RecordableJourneyDomain,
        exerciseId: exercise.exerciseId,
        accuracyPercent,
      })
    }
    advance()
  }

  function handleReadingComplete(result: QuantumReadingSprintResult | JourneyReadingModeResult | GuidingLinePacerResult | RsvpModeResult): void {
    playClickChime()
    setReadingResult(result)
    setLevel(4)
  }

  const step1DisplayTitle = isFoundationBreathingDay ? 'Mind Awakening™ (Breathing)' : step1.title
  const weaknessDomainLabel = isWeaknessInjected && weakestDomain !== null ? JOURNEY_DOMAIN_LABELS[weakestDomain.domain] : null

  // Daily Streak Reminders & Motivation System™ — milestoneReachedToday
  // uses the POST-save streak (currentStreak + 1, computed inline here
  // since `resultingStreak` below isn't declared yet at this point in the
  // render) since that's the real number this exact session produces;
  // isComebackDay uses the PRE-save streak (currentStreak, as of page
  // load) since a comeback is about the gap the user walked in with, not
  // the day they're about to complete.
  const milestoneReachedToday = getMilestoneHitExactly(currentStreak + 1)
  const isComebackDay = currentStreak === 0 && !isBaselineDay

  // AI Smart Coach™ — fired alongside the DB save (Promise.all), never
  // blocking it: a slow/failed AI call must never delay or break
  // real progress being recorded. generateCoachFeedback itself never
  // throws (falls back to a calm static message on any failure).
  async function requestCoachFeedback(trueWpm: number, comprehensionAccuracyPercent: number): Promise<string> {
    return generateCoachFeedback({
      day,
      weekTheme: getWeekTheme(day),
      trueWpm,
      comprehensionAccuracyPercent,
      streak: resultingStreak,
      step1Title: step1DisplayTitle,
      step2Title: step2.title,
      isBaselineDay,
      weakestDomainLabel: weaknessDomainLabel,
      milestoneReachedToday,
      isComebackDay,
    })
  }

  async function handleRetentionComplete(correctCount: number, totalCount: number): Promise<void> {
    if (readingResult === null) return
    playClickChime()
    setIsSavingDay(true)
    const trueWpm = computeTrueWpm(readingResult.wpm, readingResult.accuracyPercent)
    const readingXp = computeReadingXp(readingResult.score)
    const retentionXp = computeRetentionXp(correctCount, totalCount)
    const [, coach] = await Promise.all([
      saveDailyQuantumSession({
        readingWpm: trueWpm,
        accuracyPercent: readingResult.accuracyPercent,
        readingScore: readingResult.score,
        xpEarned: readingXp + retentionXp,
      }),
      requestCoachFeedback(trueWpm, readingResult.accuracyPercent),
    ])
    setIsSavingDay(false)
    setDayReadingSummary({ wpm: trueWpm, accuracyPercent: readingResult.accuracyPercent })
    setCoachMessage(coach)
    setLevel('complete')
  }

  // Dynamic Chunking™ days have no Retention Check to pair with (see
  // getReadingMode's own comment) — this exercise's own real result IS
  // the day's reading proof, so it saves and completes directly.
  async function handleChunkingComplete(result: RuntimeResult, estimatedWpm: number): Promise<void> {
    playClickChime()
    setIsSavingDay(true)
    const accuracyPercent = result.metrics.accuracyPercent
    const trueWpm = computeTrueWpm(estimatedWpm, accuracyPercent)
    const readingScore = computeReadingPowerScore(trueWpm, accuracyPercent)
    const readingXp = computeReadingXp(readingScore)
    const [, coach] = await Promise.all([
      saveDailyQuantumSession({ readingWpm: trueWpm, accuracyPercent, readingScore, xpEarned: readingXp }),
      requestCoachFeedback(trueWpm, accuracyPercent),
    ])
    setIsSavingDay(false)
    setDayReadingSummary({ wpm: trueWpm, accuracyPercent })
    setCoachMessage(coach)
    setLevel('complete')
  }

  function renderAuxiliaryExercise(exercise: JourneyStepExercise): React.JSX.Element {
    const onDone = (): void => handleAuxiliaryComplete(exercise)
    const onAccuracyDone = (accuracyPercent: number): void => handleAuxiliaryComplete(exercise, accuracyPercent)

    switch (exercise.exerciseId) {
      case 'eye-warm-up':
        return <EyeWarmupExperience onComplete={onDone} completionActionLabel="Continue Session →" />
      case 'schulte-grid-drill':
        return <SchulteGridDrillExperience onComplete={onDone} />
      case 'word-flash':
        return <WordFlashExperience onComplete={onDone} />
      case 'brain-gym-circuit':
        return <BrainGymCircuitExperience onComplete={onDone} />
      case 'esp-zener-telepathy':
        return <EspZenerTelepathyExperience onComplete={onAccuracyDone} />
      case 'photographic-memory':
        return <PhotographicMemoryExperience onComplete={onAccuracyDone} />
      case 'hemispheric-color-sync':
        return <HemisphericColorSyncExperience onComplete={onAccuracyDone} />
      case 'color-scene-transformation':
        return <ColorSceneTransformationExperience onComplete={onAccuracyDone} />
      case 'quantum-mental-rotation':
        return <QuantumMentalRotationExperience onComplete={onAccuracyDone} />
    }
  }

  function renderLevel(): React.JSX.Element | null {
    if (level === 'briefing') {
      return (
        <PreSessionBriefingScreen
          studentName={studentFirstName}
          day={day}
          weekTheme={getWeekTheme(day)}
          isBaselineDay={isBaselineDay}
          previousWpm={previousReadingWpm}
          previousAccuracyPercent={previousReadingAccuracyPercent}
          daysSinceLastSession={daysSinceLastSession}
          currentStreak={currentStreak}
          onStart={handleStartSession}
        />
      )
    }
    if (level === 1) {
      if (isFoundationBreathingDay) {
        return <MindAwakeningPhase onComplete={advance} allowSkip={false} />
      }
      if (!hasStartedWarmup) {
        return <WarmupPrepScreen exerciseTitle={step1.title} onStart={() => setHasStartedWarmup(true)} onSkip={advance} />
      }
      return renderAuxiliaryExercise(step1)
    }
    if (level === 2) return renderAuxiliaryExercise(step2)
    if (level === 3) {
      // UI Controls & Mode Selector™ — shown once per day, before any
      // reading content renders, regardless of which underlying mode
      // today's rotation assigned.
      if (readingPresentationChoice === null) {
        return (
          <ReadingModeSelector
            standardModeLabel={READING_MODE_STEP_LABELS[readingMode]}
            defaultChoice={defaultPresentationChoice}
            defaultTargetWpm={defaultTargetWpm}
            onConfirm={(choice, wpm) => {
              playClickChime()
              setReadingPresentationChoice(choice)
              setTargetWpm(wpm)
            }}
          />
        )
      }
      if (readingPresentationChoice === 'guiding-line') {
        return <GuidingLinePacerPlayer lengthTier={readingLengthTier} initialTargetWpm={targetWpm} onComplete={handleReadingComplete} />
      }
      if (readingPresentationChoice === 'rsvp') {
        return <RsvpModePlayer lengthTier={readingLengthTier} initialTargetWpm={targetWpm} onComplete={handleReadingComplete} />
      }
      if (readingMode === 'quantum-reading-sprint') {
        return <QuantumReadingSprintPhase speedMultiplier={speedMultiplier} onComplete={handleReadingComplete} />
      }
      if (readingMode === 'dynamic-chunking') {
        return (
          <ProgressiveChunkReadingExperience
            initialSeed={chunkingSeed}
            onComplete={(result, estimatedWpm) => void handleChunkingComplete(result, estimatedWpm)}
          />
        )
      }
      return (
        <JourneyReadingModePlayer
          mode={readingMode}
          lengthTier={readingLengthTier}
          speedMultiplier={speedMultiplier}
          onComplete={handleReadingComplete}
        />
      )
    }
    if (level === 4 && readingResult !== null) {
      return <RetentionCheckPhase readingSet={readingResult.selectedSet} onComplete={(correct, total) => void handleRetentionComplete(correct, total)} />
    }
    return null
  }

  // Visual Pacing & RSVP Modes™ — once the user has chosen a pacing
  // style, it (not today's underlying rotation mode) is what actually
  // ran, so every label downstream of the reading step should reflect it.
  const readingStepLabel =
    readingPresentationChoice === 'guiding-line'
      ? 'Guiding Line Pacer™'
      : readingPresentationChoice === 'rsvp'
        ? 'RSVP Mode™'
        : READING_MODE_STEP_LABELS[readingMode]

  const currentExerciseTitle =
    level === 1 ? (isFoundationBreathingDay ? 'Mind Awakening™ (Breathing)' : step1.title) : level === 2 ? step2.title : null
  const stepLabel =
    level === 3
      ? readingStepLabel
      : level === 4
        ? 'Retention Check'
        : level === 1 && isWeaknessInjected && !isFoundationBreathingDay
          ? 'Targeted Practice'
          : getWeekTheme(day)
  const progressPercent = level === 'complete' ? 100 : typeof level === 'number' ? (level / totalSteps) * 100 : 0
  // The real, resulting streak once today's session actually saves — see
  // the `currentStreak` prop's own doc comment for why +1 is always
  // correct here, not an estimate.
  const resultingStreak = currentStreak + 1

  return (
    <div>
      {level !== 'complete' && level !== 'briefing' && (
        <div className="mx-auto max-w-2xl px-6 pt-8">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              Day {day} — Step {level} of {totalSteps}: {stepLabel}
            </span>
            <span className="tabular-nums">{Math.round(progressPercent)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
            />
          </div>
          {currentExerciseTitle !== null && <p className="mt-1 text-[11px] text-muted-foreground/70">{currentExerciseTitle}</p>}
          {level === 1 && isWeaknessInjected && !isFoundationBreathingDay && weakestDomain !== null && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <Target className="size-3.5 shrink-0" aria-hidden="true" />
              <span>You&rsquo;ve been finding {JOURNEY_DOMAIN_LABELS[weakestDomain.domain]} tough lately — here&rsquo;s some extra practice.</span>
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {level !== 'complete' ? (
          <motion.div
            key={`level-${level}`}
            initial={{ opacity: 0, rotateY: -12, x: 24 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: 12, x: -24 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ transformPerspective: 1200 }}
          >
            {renderLevel()}
            {isSavingDay && (
              <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
                Saving today&rsquo;s progress…
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={day === 21 && dayReadingSummary !== null ? undefined : 'mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-20 text-center'}
          >
          {day === 21 && dayReadingSummary !== null ? (
            <GrandCelebrationScreen
              studentFirstName={studentFirstName}
              baselineWpm={baselineWpm}
              day21Wpm={dayReadingSummary.wpm}
              day21AccuracyPercent={dayReadingSummary.accuracyPercent}
              resultingStreak={resultingStreak}
            />
          ) : (
            <>
            <motion.div
              animate={{ boxShadow: ['0 0 0px 0px rgba(99,102,241,0.4)', '0 0 24px 8px rgba(99,102,241,0.25)', '0 0 0px 0px rgba(99,102,241,0.4)'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex size-16 items-center justify-center rounded-full"
            >
              <LivingBrainLogo size={56} />
            </motion.div>

            <div>
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Week {getWeekNumber(day)} — {getWeekTheme(day)}
              </p>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Day {day} Complete!</h2>
              {isBaselineDay && (
                <p className="mt-1 text-xs font-medium text-primary">🎯 Baseline Test™ set — every day from here measures real growth against this.</p>
              )}
            </div>

            <p className="max-w-sm text-sm text-muted-foreground">
              {isFoundationBreathingDay ? 'Mind Awakening™' : step1.title} → {step2.title} →{' '}
              {isStandardDynamicChunkingDay ? readingStepLabel : `${readingStepLabel} → Retention Check`}{' '}
              — real progress recorded across every step.
            </p>

            {/* AI Smart Coach™ — a real Claude-generated message grounded
                only in this session's actual numbers (see
                generateCoachFeedback.ts's own prompt-building comment). */}
            {coachMessage !== null && (
              <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/60 p-4 text-left">
                <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">AI Coach</p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">{coachMessage}</p>
              </div>
            )}

            {/* Metric Separation — the only WPM/accuracy figures shown on
                this aggregate summary come directly from the reading
                step's real result. Nothing from Steps 1-2's own accuracy
                or reaction-time metrics is blended in here. */}
            <div className="flex w-full max-w-xs flex-col gap-3">
              {dayReadingSummary !== null && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-4">
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">True Reading Speed</p>
                    <p className="font-heading text-xl font-bold tabular-nums text-foreground">{dayReadingSummary.wpm} WPM</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Comprehension</p>
                    <p className="font-heading text-xl font-bold tabular-nums text-foreground">{dayReadingSummary.accuracyPercent}%</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
                <Flame className="size-4 text-orange-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">{resultingStreak}-Day Streak</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              {day < 21 && (
                <Button asChild size="lg" className="rounded-full">
                  <Link href={`/labs/quantum-speed-reading/journey/${day + 1}`}>Start Day {day + 1} →</Link>
                </Button>
              )}
              <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
