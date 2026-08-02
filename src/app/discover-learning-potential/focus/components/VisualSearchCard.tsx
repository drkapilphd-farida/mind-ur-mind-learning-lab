'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { generateVisualSearchRound, VISUAL_SEARCH_ROUND_COUNT, type VisualSearchRound } from '@/features/focus-discovery/visualSearch'
import type { FocusObject } from '@/features/focus-discovery/focusObjects'
import { useFocusShield } from '@/features/focus-discovery/useFocusShield'
import { AdaptiveDifficultyController } from '@/features/focus-discovery/adaptiveDifficulty'
import type { FocusDiscoveryEvent } from '@/features/focus-discovery/types'
import { FocusExperimentLayout } from './FocusExperimentLayout'
import { FocusObjectButton } from './FocusObjectButton'
import { FocusShieldBadge } from './FocusShieldBadge'
import { DifficultyCommentaryLine } from './DifficultyCommentaryLine'

type VisualSearchResult = Extract<FocusDiscoveryEvent, { type: 'visual_search_result' }>

type VisualSearchCardProps = {
  seed: number
  onDone: (result: VisualSearchResult) => void
}

// Mission 2 — Visual Search™ (Visual Attention). Five real rounds (the
// real round COUNTER); a round ends the instant the real target is
// tapped — wrong taps don't end the round, they're just counted (a
// real, honest "kept looking" signal). Sprint-1.8 Adaptive Difficulty
// Engine™ — the real content DIFFICULTY LEVEL is a separate, real,
// performance-driven counter: a round with several real wrong taps
// (genuine searching difficulty, not just "one honest detour") holds
// the current real level for the next round instead of advancing it.
export function VisualSearchCard({ seed, onDone }: VisualSearchCardProps): React.JSX.Element {
  const [roundIndex, setRoundIndex] = useState(0)
  const [effectiveLevel, setEffectiveLevel] = useState(0)
  const [justStabilized, setJustStabilized] = useState(false)
  const [feedback, setFeedback] = useState<{ id: string; kind: 'correct' | 'wrong' } | null>(null)
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const roundStartRef = useRef(Date.now())
  const firstTapWasCorrectRef = useRef(true)
  const roundWrongTapsRef = useRef(0)
  const totalsRef = useRef({ correctFirstTapCount: 0, wrongTapsTotal: 0, searchTimesMs: [] as number[] })
  const adaptiveRef = useRef(new AdaptiveDifficultyController(VISUAL_SEARCH_ROUND_COUNT - 1))
  const { level: shieldLevel, recordOutcome } = useFocusShield()

  const round = useMemo<VisualSearchRound>(() => generateVisualSearchRound(effectiveLevel, seed + roundIndex * 307), [effectiveLevel, roundIndex, seed])

  const finishMission = useCallback((): void => {
    const totals = totalsRef.current
    const avgSearchMs = totals.searchTimesMs.length > 0 ? Math.round(totals.searchTimesMs.reduce((a, b) => a + b, 0) / totals.searchTimesMs.length) : 0
    onDone({
      type: 'visual_search_result',
      roundsCompleted: VISUAL_SEARCH_ROUND_COUNT,
      correctFirstTapCount: totals.correctFirstTapCount,
      wrongTapsTotal: totals.wrongTapsTotal,
      avgSearchMs,
      highestLevelReached: adaptiveRef.current.currentLevel,
      stabilizedRounds: adaptiveRef.current.stabilizedRounds,
    })
  }, [onDone])

  const handleTap = useCallback(
    (object: FocusObject): void => {
      if (object.id === round.targetId) {
        const searchMs = Date.now() - roundStartRef.current
        totalsRef.current.searchTimesMs.push(searchMs)
        if (firstTapWasCorrectRef.current) totalsRef.current.correctFirstTapCount += 1
        recordOutcome(true)
        // Sprint-1.6 FIX-01/FIX-06 — remove the found target immediately
        // (its own real exit animation plays via `AnimatePresence`)
        // rather than just dimming it in place.
        setResolvedId(object.id)
        // Sprint-1.8 AI Adaptive Observation™ — a real, forgiving read on
        // this round's own real search difficulty: one honest detour
        // still counts as strong; three or more real wrong taps reads as
        // genuine struggle.
        const accuracyRatio = Math.max(0, 1 - roundWrongTapsRef.current / 3)
        const levelBefore = adaptiveRef.current.currentLevel
        adaptiveRef.current.recordRoundOutcome(accuracyRatio)
        const stabilized = adaptiveRef.current.currentLevel === levelBefore
        window.setTimeout(() => {
          if (roundIndex + 1 >= VISUAL_SEARCH_ROUND_COUNT) {
            finishMission()
          } else {
            roundStartRef.current = Date.now()
            firstTapWasCorrectRef.current = true
            roundWrongTapsRef.current = 0
            setFeedback(null)
            setResolvedId(null)
            setJustStabilized(stabilized)
            setEffectiveLevel(adaptiveRef.current.currentLevel)
            setRoundIndex((index) => index + 1)
          }
        }, 260)
      } else {
        firstTapWasCorrectRef.current = false
        totalsRef.current.wrongTapsTotal += 1
        roundWrongTapsRef.current += 1
        recordOutcome(false)
        setFeedback({ id: object.id, kind: 'wrong' })
        window.setTimeout(() => setFeedback(null), 200)
      }
    },
    [round, roundIndex, finishMission, recordOutcome],
  )

  return (
    <FocusExperimentLayout maxWidthClassName="max-w-2xl">
      <FocusShieldBadge level={shieldLevel} />
      <DifficultyCommentaryLine levelIndex={effectiveLevel} justStabilized={justStabilized} triggerKey={roundIndex} />
      <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Find {round.targetLabel}.</p>
      <div className="relative mx-auto mt-8 aspect-[4/3] w-full max-w-xl">
        <AnimatePresence>
          {round.objects
            .filter((object) => object.id !== resolvedId)
            .map((object) => (
              <FocusObjectButton
                key={object.id}
                object={object}
                onTap={handleTap}
                isSmall={round.targetIsSmall && object.id === round.targetId}
                feedback={feedback?.id === object.id ? feedback.kind : null}
              />
            ))}
        </AnimatePresence>
      </div>
    </FocusExperimentLayout>
  )
}
