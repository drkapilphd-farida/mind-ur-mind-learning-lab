'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Crown, Flame, RotateCcw, Sparkles, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MindAwakeningPhase } from './MindAwakeningPhase'
import { RotatingVisualActivationPhase } from './RotatingVisualActivationPhase'
import { RotatingQuantumReadingSprintPhase, type QsrCircuitReadingCompletion } from './RotatingQuantumReadingSprintPhase'
import type { QuantumReadingSprintResult } from './QuantumReadingSprintPhase'
import { RetentionCheckPhase } from './RetentionCheckPhase'
import { RewardPopup } from './RewardPopup'
import { LiveMasterclassWaitlistCard } from './LiveMasterclassWaitlistCard'
import { playClickChime, playLevelCompleteChime, playSessionCompleteChime } from './soundEngine'
import { computeReadingXp, computeRetentionXp } from './quantumReadingSprintDataset'
import { pickPhase2ExerciseId, pickPhase3ExerciseId, type Phase2PoolExerciseId, type Phase3PoolExerciseId } from './qsrProCircuitRotation'
import { saveDailyQuantumSession } from '../actions/saveDailyQuantumSession'
import { getDailyQuantumSessionHistory, type DailyQuantumSessionRecord } from '../actions/getDailyQuantumSessionHistory'
import { computeDailyQuantumStreak, computePersonalBestWpm } from './dailyQuantumSessionTracking'
import { getMindScoreRank } from '@/lib/exercises/mindScore'

// Flat award for Level 1 — a calm breathing warm-up has no accuracy
// concept to scale a reward off of, unlike Levels 2-4, which all earn a
// performance-scaled amount instead of a fixed number.
const MIND_AWAKENING_XP_AWARD = 50

type Phase = 1 | 2 | 3 | 4 | 'complete'
type EntryMode = 'full-session' | 'replay'
type ReplayablePhase = 2 | 3 | 4

type PhaseMeta = { id: 1 | 2 | 3 | 4; name: string }

const PHASES: readonly PhaseMeta[] = [
  { id: 1, name: 'Mind Awakening' },
  { id: 2, name: 'Right-Brain Activation' },
  { id: 3, name: 'Quantum Reading Sprint' },
  { id: 4, name: 'Retention Check' },
]

const REPLAY_LABELS: Record<ReplayablePhase, string> = {
  2: 'Right-Brain Activation',
  3: 'Quantum Reading Sprint',
  4: 'Retention Check',
}

type PendingReward = { title: string; statLine?: string; xpAwarded: number; nextPhase: Phase }
type JustCompletedSummary = { totalXp: number; streak: number; wpm: number; isPersonalBest: boolean }

type UnifiedQuantumSessionProps = {
  onReturnHome: () => void
  // QSR Pro Circuit™ — free users always get today's exact classic
  // 4-phase flow (zero regression risk); Pro users rotate Phases 2/3
  // across the full exercise pool (see qsrProCircuitRotation.ts).
  isPro: boolean
  userId: string
  // Real Mind Score (0-1000), computed server-side by page.tsx the same
  // way /progress does — used only to surface a rank band on the
  // completion screen (see getMindScoreRank), never recomputed here.
  mindScore: number
}

// QSR Pro Circuit™ (formerly "Daily Quantum Session") — one linear
// wrapper chaining a guided daily mastery flow (Mind Awakening →
// Right-Brain/Intuition Kick → Quantum Reading Sprint → Retention Check)
// into a single guided session, with a micro-reward popup and a chime
// after every level so momentum never breaks. Two pieces of navigation
// state drive everything: `phase` (which level is active) and
// `entryMode` (whether this is the normal guided sequence or a single-
// level "Practice Again" replay from the completion screen). Persisted
// growth tracking (WPM history, streak, lifetime XP) reuses the same
// daily_quantum_sessions table/Server Actions already built for this
// flow — untouched by the Pro rotation.
//
// Retention Check only pairs with the bespoke Quantum Reading Sprint
// drill (it needs a real passage + quiz, which only that drill
// produces) — on a Pro rotation day where Phase 3 lands on one of the 5
// other reading exercises, the session is 3 steps instead of 4 and
// finalizes straight from Phase 3, mirroring the exact accommodation
// QuantumJourneySession.tsx already makes for its own rotating Dynamic
// Chunking day.
export function UnifiedQuantumSession({ onReturnHome, isPro, userId, mindScore }: UnifiedQuantumSessionProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>(1)
  const [entryMode, setEntryMode] = useState<EntryMode>('full-session')
  const [pendingReward, setPendingReward] = useState<PendingReward | null>(null)

  // Decided once per mount — see qsrProCircuitRotation.ts's own comment
  // on why this is deterministic per user per calendar day, not random.
  const [phase2ExerciseId] = useState<Phase2PoolExerciseId>(() => (isPro ? pickPhase2ExerciseId(userId) : 'visual-activation'))
  const [phase3ExerciseId] = useState<Phase3PoolExerciseId>(() => (isPro ? pickPhase3ExerciseId(userId) : 'quantum-reading-sprint'))
  const supportsRetentionCheck = phase3ExerciseId === 'quantum-reading-sprint'
  const totalSteps = supportsRetentionCheck ? 4 : 3

  const [readingResult, setReadingResult] = useState<QuantumReadingSprintResult | null>(null)
  const [totalXpEarned, setTotalXpEarned] = useState(0)
  const [sessionHistory, setSessionHistory] = useState<readonly DailyQuantumSessionRecord[]>([])
  const [justCompleted, setJustCompleted] = useState<JustCompletedSummary | null>(null)

  const hasFinalizedFullSessionRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    void getDailyQuantumSessionHistory().then((history) => {
      if (!cancelled) setSessionHistory(history)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (phase === 'complete') playSessionCompleteChime()
  }, [phase])

  function startReplay(targetPhase: ReplayablePhase): void {
    playClickChime()
    setEntryMode('replay')
    setPhase(targetPhase)
  }

  function showRewardThenGoTo(title: string, statLine: string | undefined, xpAwarded: number, normalNextPhase: Phase): void {
    playLevelCompleteChime()
    const nextPhase = entryMode === 'replay' ? 'complete' : normalNextPhase
    setPendingReward({ title, ...(statLine !== undefined ? { statLine } : {}), xpAwarded, nextPhase })
  }

  function handleRewardDismiss(): void {
    if (pendingReward === null) return
    const { nextPhase } = pendingReward
    setPendingReward(null)
    if (entryMode === 'replay') setEntryMode('full-session')
    setPhase(nextPhase)
  }

  function handlePhase1Complete(): void {
    if (entryMode === 'full-session') setTotalXpEarned((xp) => xp + MIND_AWAKENING_XP_AWARD)
    showRewardThenGoTo('Mind Calmed', undefined, MIND_AWAKENING_XP_AWARD, 2)
  }

  function handlePhase2Complete(xpEarned: number, statLine: string | undefined, title: string): void {
    if (entryMode === 'full-session') setTotalXpEarned((prev) => prev + xpEarned)
    showRewardThenGoTo(title, statLine, xpEarned, 3)
  }

  function handlePhase3Complete(completion: QsrCircuitReadingCompletion): void {
    if (completion.supportsRetention) {
      setReadingResult(completion.result)
      const xp = computeReadingXp(completion.result.score)
      if (entryMode === 'full-session') setTotalXpEarned((prev) => prev + xp)
      showRewardThenGoTo('Sprint Complete', `${completion.result.wpm} WPM • ${completion.result.accuracyPercent}% Accuracy`, xp, 4)
      return
    }
    void finalizeCircuitWithoutRetention(completion)
  }

  // Mirrors handlePhase4Complete's own save/streak/personal-best pipeline
  // below exactly — the only real difference is there is no retention
  // score to fold in, since this pick never produced retention questions.
  async function finalizeCircuitWithoutRetention(completion: Extract<QsrCircuitReadingCompletion, { supportsRetention: false }>): Promise<void> {
    if (entryMode === 'replay') {
      showRewardThenGoTo('Sprint Complete', completion.statLine, completion.xpEarned, 'complete')
      return
    }

    if (hasFinalizedFullSessionRef.current) return
    hasFinalizedFullSessionRef.current = true

    const finalTotalXp = totalXpEarned + completion.xpEarned
    setTotalXpEarned(finalTotalXp)

    const previousBestWpm = computePersonalBestWpm(sessionHistory)

    const saveResult = await saveDailyQuantumSession({
      readingWpm: completion.wpm,
      accuracyPercent: completion.accuracyPercent,
      readingScore: completion.readingScore,
      xpEarned: finalTotalXp,
    })

    const newRecord: DailyQuantumSessionRecord = {
      readingWpm: completion.wpm,
      accuracyPercent: completion.accuracyPercent,
      readingScore: completion.readingScore,
      xpEarned: finalTotalXp,
      occurredAt: new Date().toISOString(),
    }
    const updatedHistory = saveResult.success ? [newRecord, ...sessionHistory] : sessionHistory
    setSessionHistory(updatedHistory)

    setJustCompleted({
      totalXp: finalTotalXp,
      streak: computeDailyQuantumStreak(updatedHistory),
      wpm: completion.wpm,
      isPersonalBest: previousBestWpm === null || completion.wpm > previousBestWpm,
    })

    showRewardThenGoTo('Sprint Complete', completion.statLine, completion.xpEarned, 'complete')
  }

  async function handlePhase4Complete(correctCount: number, totalCount: number): Promise<void> {
    const xp = computeRetentionXp(correctCount, totalCount)
    const statLine = `${correctCount}/${totalCount} Correct`

    if (entryMode === 'replay') {
      showRewardThenGoTo('Retention Locked In', statLine, xp, 'complete')
      return
    }

    if (hasFinalizedFullSessionRef.current) return
    hasFinalizedFullSessionRef.current = true

    const finalTotalXp = totalXpEarned + xp
    setTotalXpEarned(finalTotalXp)

    const wpm = readingResult?.wpm ?? 0
    const accuracyPercent = readingResult?.accuracyPercent ?? 0
    const readingScore = readingResult?.score ?? 0
    const previousBestWpm = computePersonalBestWpm(sessionHistory)

    const saveResult = await saveDailyQuantumSession({ readingWpm: wpm, accuracyPercent, readingScore, xpEarned: finalTotalXp })

    const newRecord: DailyQuantumSessionRecord = {
      readingWpm: wpm,
      accuracyPercent,
      readingScore,
      xpEarned: finalTotalXp,
      occurredAt: new Date().toISOString(),
    }
    const updatedHistory = saveResult.success ? [newRecord, ...sessionHistory] : sessionHistory
    setSessionHistory(updatedHistory)

    setJustCompleted({
      totalXp: finalTotalXp,
      streak: computeDailyQuantumStreak(updatedHistory),
      wpm,
      isPersonalBest: previousBestWpm === null || wpm > previousBestWpm,
    })

    showRewardThenGoTo('Retention Locked In', statLine, xp, 'complete')
  }

  function handleReturnHome(): void {
    playClickChime()
    onReturnHome()
  }

  const currentPhaseMeta = phase === 'complete' ? null : (PHASES.find((meta) => meta.id === phase) ?? null)
  const progressPercent = phase === 'complete' ? 100 : currentPhaseMeta !== null ? (currentPhaseMeta.id / totalSteps) * 100 : 0
  const replayablePhases: readonly ReplayablePhase[] = supportsRetentionCheck ? [2, 3, 4] : [2, 3]
  const mindScoreRank = getMindScoreRank(mindScore)

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-12">
      <div className="w-full max-w-lg">
        {phase !== 'complete' && currentPhaseMeta !== null && (
          <div className="mb-12">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                Level {currentPhaseMeta.id} of {totalSteps}: {currentPhaseMeta.name}
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
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.div
              key="phase-1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <MindAwakeningPhase onComplete={handlePhase1Complete} />
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="phase-2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <RotatingVisualActivationPhase pickedId={phase2ExerciseId} onComplete={handlePhase2Complete} />
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="phase-3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <RotatingQuantumReadingSprintPhase pickedId={phase3ExerciseId} onComplete={handlePhase3Complete} />
            </motion.div>
          )}

          {phase === 4 && readingResult !== null && (
            <motion.div
              key="phase-4"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <RetentionCheckPhase
                readingSet={readingResult.selectedSet}
                onComplete={(correctCount, totalCount) => void handlePhase4Complete(correctCount, totalCount)}
              />
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 text-white"
              >
                <Sparkles className="size-8" aria-hidden="true" />
              </motion.div>

              <div className="flex flex-col items-center gap-2">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  QSR Pro Circuit Complete!
                </h2>
                <div className="flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.06] px-3 py-1">
                  <Crown className="size-3.5 text-violet-500" aria-hidden="true" />
                  <span className="text-xs font-semibold text-foreground">{mindScoreRank.rank}</span>
                </div>
              </div>

              {justCompleted !== null && (
                <div className="grid w-full max-w-sm grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-4">
                    <p className="font-heading text-xl font-bold tabular-nums text-foreground">+{justCompleted.totalXp} XP</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card/60 p-4">
                    <Flame className="size-4 text-orange-500" aria-hidden="true" />
                    <p className="font-heading text-lg font-bold text-foreground">{justCompleted.streak}-Day</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card/60 p-4">
                    <p className="font-heading text-lg font-bold tabular-nums text-foreground">{justCompleted.wpm} WPM</p>
                    {justCompleted.isPersonalBest && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                        <Trophy className="size-3" aria-hidden="true" />
                        Personal Best
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2">
                {replayablePhases.map((replayPhase) => (
                  <button
                    key={replayPhase}
                    type="button"
                    onClick={() => startReplay(replayPhase)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3.5 py-2 text-xs font-medium text-muted-foreground',
                      'transition-colors duration-200 hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    <RotateCcw className="size-3" aria-hidden="true" />
                    Practice Again: {REPLAY_LABELS[replayPhase]}
                  </button>
                ))}
              </div>

              {isPro && (
                <div className="w-full max-w-sm">
                  <LiveMasterclassWaitlistCard />
                </div>
              )}

              <motion.button
                type="button"
                onClick={handleReturnHome}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={cn(
                  'group flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-primary px-8 py-4',
                  'text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25',
                  'transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                Return to Home
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {pendingReward !== null && (
          <RewardPopup
            title={pendingReward.title}
            {...(pendingReward.statLine !== undefined ? { statLine: pendingReward.statLine } : {})}
            xpAwarded={pendingReward.xpAwarded}
            onDismiss={handleRewardDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
