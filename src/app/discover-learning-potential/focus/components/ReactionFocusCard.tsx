'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { generateReactionFocusTrials, pickReactionFocusTarget, type ReactionFocusTrial } from '@/features/focus-discovery/reactionFocus'
import { FOCUS_COLOR_CLASS, FOCUS_SHAPE_GLYPH } from '@/features/focus-discovery/focusObjects'
import {
  REACTION_FOCUS_DECOY_DISPLAY_MS,
  REACTION_FOCUS_SECOND_DECOY_FROM_TRIAL,
  REACTION_FOCUS_TARGET_TIMEOUT_MS,
  REACTION_FOCUS_TIME_PRESSURE_FROM_TRIAL,
  REACTION_FOCUS_TRIAL_COUNT,
} from '@/features/focus-discovery/focusTimingConfig'
import { useFocusShield } from '@/features/focus-discovery/useFocusShield'
import type { FocusDiscoveryEvent } from '@/features/focus-discovery/types'
import { FocusExperimentLayout } from './FocusExperimentLayout'
import { FocusShieldBadge } from './FocusShieldBadge'
import { DifficultyCommentaryLine } from './DifficultyCommentaryLine'

type ReactionFocusResult = Extract<FocusDiscoveryEvent, { type: 'reaction_focus_result' }>

type ReactionFocusCardProps = {
  seed: number
  onDone: (result: ReactionFocusResult) => void
}

// 'decoy-gap' — waiting before the current real decoy appears.
// 'decoy-shown' — that real decoy is visible (must NOT be tapped).
// 'waiting' — the real final delay before the real target appears.
// 'target' / 'feedback' — unchanged from Sprint-1.
type TrialPhase = 'decoy-gap' | 'decoy-shown' | 'waiting' | 'target' | 'feedback'

// Mission 3 — Reaction Focus™ (Attention Speed), Sprint-1.5 FIX-04/
// FIX-09. One real, fixed target held for the whole mission; each real
// trial now runs a real, independently-randomized CHAIN of zero, one, or
// two real decoys (each with its own real gap) before the real target —
// "avoid fixed rhythms... the brain should react, not predict."
export function ReactionFocusCard({ seed, onDone }: ReactionFocusCardProps): React.JSX.Element {
  const target = useMemo(() => pickReactionFocusTarget(seed), [seed])
  const trials = useMemo(() => generateReactionFocusTrials(target, seed + 1), [target, seed])

  const [trialIndex, setTrialIndex] = useState(0)
  const [decoyIndex, setDecoyIndex] = useState(0)
  const [phase, setPhase] = useState<TrialPhase>(trials[0]!.decoys.length > 0 ? 'decoy-gap' : 'waiting')
  const [lastOutcome, setLastOutcome] = useState<'hit' | 'miss' | null>(null)
  const [decoyShake, setDecoyShake] = useState(false)
  const targetShownAtRef = useRef(0)
  const totalsRef = useRef({ hits: 0, prematureTaps: 0, missedTargets: 0, reactionTimesMs: [] as number[] })
  const { level: shieldLevel, recordOutcome } = useFocusShield()

  const finishMission = useCallback((): void => {
    const totals = totalsRef.current
    onDone({
      type: 'reaction_focus_result',
      trialsCompleted: REACTION_FOCUS_TRIAL_COUNT,
      hits: totals.hits,
      prematureTaps: totals.prematureTaps,
      missedTargets: totals.missedTargets,
      reactionTimesMs: totals.reactionTimesMs,
    })
  }, [onDone])

  const advanceTrial = useCallback((): void => {
    if (trialIndex + 1 >= REACTION_FOCUS_TRIAL_COUNT) {
      finishMission()
      return
    }
    const nextIndex = trialIndex + 1
    setTrialIndex(nextIndex)
    setDecoyIndex(0)
    setLastOutcome(null)
    setPhase(trials[nextIndex]!.decoys.length > 0 ? 'decoy-gap' : 'waiting')
  }, [trialIndex, trials, finishMission])

  const trial: ReactionFocusTrial = trials[trialIndex]!
  const currentDecoy = trial.decoys[decoyIndex]
  // Sprint-1.7 RULE-05 — a real, coarse difficulty level derived from
  // this exact trial's own real escalation thresholds (never a separate,
  // disconnected counter) — only changes at the same two real moments
  // `reactionFocus.ts` itself escalates at.
  const difficultyLevel =
    (trialIndex >= REACTION_FOCUS_SECOND_DECOY_FROM_TRIAL ? 1 : 0) + (trialIndex >= REACTION_FOCUS_TIME_PRESSURE_FROM_TRIAL ? 1 : 0)

  // Real phase choreography for this exact trial — a real decoy chain
  // (gap → shown → next decoy's own gap → ...) → the real final waiting
  // delay → target (real reaction window, real timeout if never tapped).
  useEffect(() => {
    if (phase === 'decoy-gap') {
      const timer = window.setTimeout(() => setPhase('decoy-shown'), currentDecoy!.gapBeforeMs)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'decoy-shown') {
      setDecoyShake(false)
      const timer = window.setTimeout(() => {
        const nextDecoyIndex = decoyIndex + 1
        if (nextDecoyIndex < trial.decoys.length) {
          setDecoyIndex(nextDecoyIndex)
          setPhase('decoy-gap')
        } else {
          setPhase('waiting')
        }
      }, REACTION_FOCUS_DECOY_DISPLAY_MS)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'waiting') {
      const timer = window.setTimeout(() => {
        targetShownAtRef.current = Date.now()
        setPhase('target')
      }, trial.delayMs)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'target') {
      const timer = window.setTimeout(() => {
        totalsRef.current.missedTargets += 1
        recordOutcome(false)
        setLastOutcome('miss')
        setPhase('feedback')
      }, REACTION_FOCUS_TARGET_TIMEOUT_MS)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'feedback') {
      const timer = window.setTimeout(advanceTrial, 500)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [phase, decoyIndex, currentDecoy, trial, advanceTrial, recordOutcome])

  const handleTap = useCallback((): void => {
    if (phase === 'decoy-shown') {
      // Sprint-1.6 FIX-02 — "wrong objects should never disappear...
      // tiny shake, soft red highlight, return to normal." The real
      // decoy stays fully visible; only a brief, self-clearing shake
      // marks the tap as premature.
      totalsRef.current.prematureTaps += 1
      recordOutcome(false)
      setDecoyShake(true)
      window.setTimeout(() => setDecoyShake(false), 200)
      return
    }
    if (phase === 'decoy-gap' || phase === 'waiting') {
      totalsRef.current.prematureTaps += 1
      recordOutcome(false)
      return
    }
    if (phase === 'target') {
      const reactionMs = Date.now() - targetShownAtRef.current
      totalsRef.current.hits += 1
      totalsRef.current.reactionTimesMs.push(reactionMs)
      recordOutcome(true)
      setLastOutcome('hit')
      setPhase('feedback')
    }
  }, [phase, recordOutcome])

  return (
    <FocusExperimentLayout maxWidthClassName="max-w-lg">
      <FocusShieldBadge level={shieldLevel} />
      <DifficultyCommentaryLine levelIndex={difficultyLevel} />
      <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Tap the moment you see it. Ignore anything else.</p>
      <div className="relative mx-auto mt-10 flex h-56 w-full max-w-xs items-center justify-center">
        <AnimatePresence>
          {phase === 'decoy-shown' && currentDecoy !== undefined && (
            <motion.button
              key="decoy"
              type="button"
              onClick={handleTap}
              aria-label="decoy"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: decoyShake ? [0, -6, 6, -6, 0] : 0,
                backgroundColor: decoyShake ? ['rgba(239,68,68,0)', 'rgba(239,68,68,0.3)', 'rgba(239,68,68,0)'] : 'rgba(0,0,0,0)',
              }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`rounded-full text-6xl leading-none sm:text-7xl ${FOCUS_COLOR_CLASS[currentDecoy.color]}`}
            >
              {FOCUS_SHAPE_GLYPH[currentDecoy.shape]}
            </motion.button>
          )}
          {phase === 'target' && (
            <motion.button
              key="target"
              type="button"
              onClick={handleTap}
              aria-label={`${target.color} ${target.shape}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              exit={{ scale: 1.2, opacity: 0, transition: { duration: 0.15 } }}
              className={`rounded-full text-6xl leading-none sm:text-7xl ${FOCUS_COLOR_CLASS[target.color]}`}
            >
              {FOCUS_SHAPE_GLYPH[target.shape]}
            </motion.button>
          )}
          {phase === 'feedback' && (
            <motion.p
              key="feedback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-medium text-muted-foreground"
            >
              {lastOutcome === 'hit' ? '⚡ Nice.' : 'Next one.'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </FocusExperimentLayout>
  )
}
