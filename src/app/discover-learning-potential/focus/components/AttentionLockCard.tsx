'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { generateAttentionLockRound, ATTENTION_LOCK_ROUND_COUNT, type AttentionLockRound } from '@/features/focus-discovery/attentionLock'
import type { FocusObject } from '@/features/focus-discovery/focusObjects'
import { useFocusShield } from '@/features/focus-discovery/useFocusShield'
import { AdaptiveDifficultyController } from '@/features/focus-discovery/adaptiveDifficulty'
import type { FocusDiscoveryEvent } from '@/features/focus-discovery/types'
import { FocusExperimentLayout } from './FocusExperimentLayout'
import { FocusObjectButton } from './FocusObjectButton'
import { FocusShieldBadge } from './FocusShieldBadge'
import { RemainingTargetsIndicator } from './RemainingTargetsIndicator'
import { DifficultyCommentaryLine } from './DifficultyCommentaryLine'

type AttentionLockResult = Extract<FocusDiscoveryEvent, { type: 'attention_lock_result' }>

type AttentionLockCardProps = {
  seed: number
  onDone: (result: AttentionLockResult) => void
}

function displayShape(shape: FocusObject['shape']): string {
  return shape[0]!.toUpperCase() + shape.slice(1)
}

function displayColor(color: FocusObject['color']): string {
  return color[0]!.toUpperCase() + color.slice(1)
}

// Mission 1 — Attention Lock™ (Selective Attention). Five real rounds
// (the real round COUNTER — always ends the mission after exactly 5).
// Sprint-1.8 Adaptive Difficulty Engine™ — the real content DIFFICULTY
// LEVEL fed into `generateAttentionLockRound` is now a separate, real,
// performance-driven counter (`AdaptiveDifficultyController`): a round
// with real accuracy at or below the real stabilize threshold holds the
// current real level for the next round instead of advancing it.
export function AttentionLockCard({ seed, onDone }: AttentionLockCardProps): React.JSX.Element {
  const [roundIndex, setRoundIndex] = useState(0)
  const [effectiveLevel, setEffectiveLevel] = useState(0)
  const [justStabilized, setJustStabilized] = useState(false)
  const [tappedIds, setTappedIds] = useState<readonly string[]>([])
  const [feedback, setFeedback] = useState<{ id: string; kind: 'correct' | 'wrong' } | null>(null)
  const roundStartRef = useRef(Date.now())
  const roundFalseTapsRef = useRef(0)
  const totalsRef = useRef({ totalTargets: 0, correctTaps: 0, falseTaps: 0, reactionTimesMs: [] as number[] })
  const adaptiveRef = useRef(new AdaptiveDifficultyController(ATTENTION_LOCK_ROUND_COUNT - 1))
  const { level: shieldLevel, recordOutcome } = useFocusShield()

  const round = useMemo<AttentionLockRound>(() => generateAttentionLockRound(effectiveLevel, seed + roundIndex * 211), [effectiveLevel, roundIndex, seed])

  const finishMission = useCallback((): void => {
    const totals = totalsRef.current
    const avgReactionMs = totals.reactionTimesMs.length > 0 ? Math.round(totals.reactionTimesMs.reduce((a, b) => a + b, 0) / totals.reactionTimesMs.length) : 0
    onDone({
      type: 'attention_lock_result',
      roundsCompleted: ATTENTION_LOCK_ROUND_COUNT,
      totalTargets: totals.totalTargets,
      correctTaps: totals.correctTaps,
      falseTaps: totals.falseTaps,
      avgReactionMs,
      highestLevelReached: adaptiveRef.current.currentLevel,
      stabilizedRounds: adaptiveRef.current.stabilizedRounds,
    })
  }, [onDone])

  // Sprint-1.6 FIX-01/FIX-06 — a correct tap removes the real target
  // IMMEDIATELY (synchronously, in the same tick as the tap) by
  // excluding it from what's rendered below; `AnimatePresence` then
  // plays `FocusObjectButton`'s own real scale-down/fade-out/glow exit
  // automatically. The remaining-targets count (FIX-03) updates in that
  // same instant, never waiting for the exit animation to finish.
  const handleTap = useCallback(
    (object: FocusObject): void => {
      const isTarget = round.targetIds.includes(object.id)
      if (isTarget) {
        const reactionMs = Date.now() - roundStartRef.current
        totalsRef.current.correctTaps += 1
        totalsRef.current.totalTargets += 1
        totalsRef.current.reactionTimesMs.push(reactionMs)
        recordOutcome(true)
        setTappedIds((current) => {
          const next = [...current, object.id]
          if (next.length >= round.targetIds.length) {
            // Sprint-1.8 AI Adaptive Observation™ — this real round's
            // own real accuracy (targets found vs. real false taps along
            // the way) decides whether the NEXT round advances or holds.
            const accuracyRatio = round.targetIds.length / (round.targetIds.length + roundFalseTapsRef.current)
            const levelBefore = adaptiveRef.current.currentLevel
            adaptiveRef.current.recordRoundOutcome(accuracyRatio)
            const stabilized = adaptiveRef.current.currentLevel === levelBefore
            window.setTimeout(() => {
              if (roundIndex + 1 >= ATTENTION_LOCK_ROUND_COUNT) {
                finishMission()
              } else {
                roundStartRef.current = Date.now()
                roundFalseTapsRef.current = 0
                setTappedIds([])
                setFeedback(null)
                setJustStabilized(stabilized)
                setEffectiveLevel(adaptiveRef.current.currentLevel)
                setRoundIndex((index) => index + 1)
              }
            }, 260)
          }
          return next
        })
      } else {
        totalsRef.current.falseTaps += 1
        roundFalseTapsRef.current += 1
        recordOutcome(false)
        setFeedback({ id: object.id, kind: 'wrong' })
        window.setTimeout(() => setFeedback(null), 200)
      }
    },
    [round, roundIndex, finishMission, recordOutcome],
  )

  const targetCountLabel = round.targetIds.length > 1 ? 'every' : 'only the'
  const remaining = round.targetIds.length - tappedIds.length

  return (
    <FocusExperimentLayout maxWidthClassName="max-w-2xl">
      <FocusShieldBadge level={shieldLevel} />
      <DifficultyCommentaryLine levelIndex={effectiveLevel} justStabilized={justStabilized} triggerKey={roundIndex} />
      <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
        Tap {targetCountLabel} {displayColor(round.targetColor)} {displayShape(round.targetShape)}
        {round.targetIds.length > 1 ? 's' : ''}.
      </p>
      <RemainingTargetsIndicator remaining={remaining} total={round.targetIds.length} />
      <div className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-xl">
        <AnimatePresence>
          {round.objects
            .filter((object) => !tappedIds.includes(object.id))
            .map((object) => (
              <FocusObjectButton
                key={object.id}
                object={object}
                onTap={handleTap}
                isMoving={round.movingIds.includes(object.id)}
                isSmall={round.smallIds.includes(object.id)}
                isBlinking={round.blinkingIds.includes(object.id)}
                feedback={feedback?.id === object.id ? feedback.kind : null}
              />
            ))}
        </AnimatePresence>
      </div>
    </FocusExperimentLayout>
  )
}
