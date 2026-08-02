'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  generateCognitiveFlexibilityRound,
  matchesRule,
  COGNITIVE_FLEXIBILITY_ROUND_COUNT,
  type CognitiveFlexibilityRound,
  type CognitiveFlexibilityRule,
} from '@/features/focus-discovery/cognitiveFlexibility'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import type { FocusObject } from '@/features/focus-discovery/focusObjects'
import { useFocusShield } from '@/features/focus-discovery/useFocusShield'
import { AdaptiveDifficultyController } from '@/features/focus-discovery/adaptiveDifficulty'
import type { FocusDiscoveryEvent } from '@/features/focus-discovery/types'
import { FocusExperimentLayout } from './FocusExperimentLayout'
import { FocusObjectButton } from './FocusObjectButton'
import { FocusShieldBadge } from './FocusShieldBadge'
import { RemainingTargetsIndicator } from './RemainingTargetsIndicator'
import { DifficultyCommentaryLine } from './DifficultyCommentaryLine'

type CognitiveFlexibilityResult = Extract<FocusDiscoveryEvent, { type: 'cognitive_flexibility_result' }>

type CognitiveFlexibilityCardProps = {
  seed: number
  onDone: (result: CognitiveFlexibilityResult) => void
}

// A generous real cutoff — long enough that a genuinely adapting user
// always finishes comfortably, short enough that a round can honestly
// register a real "missed target" rather than waiting forever.
const ROUND_TIMEOUT_MS = 8000

function displayShape(shape: FocusObject['shape']): string {
  return shape[0]!.toUpperCase() + shape.slice(1)
}

function displayColor(color: FocusObject['color']): string {
  return color[0]!.toUpperCase() + color.slice(1)
}

function ruleLabel(rule: CognitiveFlexibilityRule): string {
  if (rule.kind === 'color') return `Tap ${displayColor(rule.value)}.`
  if (rule.kind === 'exclude-color') return `Ignore ${displayColor(rule.value)}. Tap everything else.`
  if (rule.kind === 'shape') return `Tap ${displayShape(rule.value)}s.`
  return 'Tap only Moving Objects.'
}

// Mission 5 — Cognitive Flexibility™ (Mental Adaptability). Five real
// rounds (the real round COUNTER), each a genuinely different rule —
// "the user must adapt quickly." A tap that would have matched the
// PREVIOUS round's own real rule but not this one is a real, honest
// perseveration signal (`incorrectHabitResponses`). Sprint-1.8 Adaptive
// Difficulty Engine™ — the real object-count DIFFICULTY LEVEL is a
// separate, real, performance-driven counter: a round with real
// perseveration errors or misses holds the current real level for the
// next round instead of advancing it (rule-kind freshness itself is
// untouched — a real switch every real round either way).
export function CognitiveFlexibilityCard({ seed, onDone }: CognitiveFlexibilityCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const [roundIndex, setRoundIndex] = useState(0)
  const [effectiveLevel, setEffectiveLevel] = useState(0)
  const [justStabilized, setJustStabilized] = useState(false)
  const [tappedIds, setTappedIds] = useState<readonly string[]>([])
  const [feedback, setFeedback] = useState<{ id: string; kind: 'correct' | 'wrong' } | null>(null)
  const roundStartRef = useRef(Date.now())
  const firstCorrectAtRef = useRef<number | null>(null)
  const roundIncorrectRef = useRef(0)
  const previousRoundRef = useRef<CognitiveFlexibilityRound | null>(null)
  const totalsRef = useRef({ correctTaps: 0, incorrectHabitResponses: 0, missedTargets: 0, adaptationTimesMs: [] as number[] })
  const adaptiveRef = useRef(new AdaptiveDifficultyController(COGNITIVE_FLEXIBILITY_ROUND_COUNT - 1))
  const { level: shieldLevel, recordOutcome } = useFocusShield()

  const round: CognitiveFlexibilityRound = useMemo(
    () => generateCognitiveFlexibilityRound(effectiveLevel, roundIndex, previousRoundRef.current?.rule ?? null, seed, prefersReducedMotion),
    [effectiveLevel, roundIndex, seed, prefersReducedMotion],
  )
  const previousRound = previousRoundRef.current

  const finishMission = useCallback((): void => {
    const totals = totalsRef.current
    const avgAdaptationMs =
      totals.adaptationTimesMs.length > 0 ? Math.round(totals.adaptationTimesMs.reduce((a, b) => a + b, 0) / totals.adaptationTimesMs.length) : 0
    onDone({
      type: 'cognitive_flexibility_result',
      roundsCompleted: COGNITIVE_FLEXIBILITY_ROUND_COUNT,
      correctTaps: totals.correctTaps,
      incorrectHabitResponses: totals.incorrectHabitResponses,
      missedTargets: totals.missedTargets,
      avgAdaptationMs,
      highestLevelReached: adaptiveRef.current.currentLevel,
      stabilizedRounds: adaptiveRef.current.stabilizedRounds,
    })
  }, [onDone])

  const advanceRound = useCallback(
    (currentTappedIds: readonly string[]): void => {
      const missedThisRound = round.targetIds.filter((id) => !currentTappedIds.includes(id)).length
      totalsRef.current.missedTargets += missedThisRound

      // Sprint-1.8 AI Adaptive Observation™ — this real round's own real
      // accuracy (targets found vs. real perseveration errors and real
      // misses) decides whether the NEXT round advances or holds.
      const accuracyRatio = currentTappedIds.length / (currentTappedIds.length + roundIncorrectRef.current + missedThisRound)
      const levelBefore = adaptiveRef.current.currentLevel
      adaptiveRef.current.recordRoundOutcome(accuracyRatio)
      const stabilized = adaptiveRef.current.currentLevel === levelBefore

      previousRoundRef.current = round
      if (roundIndex + 1 >= COGNITIVE_FLEXIBILITY_ROUND_COUNT) {
        finishMission()
      } else {
        roundStartRef.current = Date.now()
        firstCorrectAtRef.current = null
        roundIncorrectRef.current = 0
        setTappedIds([])
        setFeedback(null)
        setJustStabilized(stabilized)
        setEffectiveLevel(adaptiveRef.current.currentLevel)
        setRoundIndex((index) => index + 1)
      }
    },
    [round, roundIndex, finishMission],
  )

  // A real, generous per-round cutoff — never lets a round wait forever.
  useEffect(() => {
    const timer = window.setTimeout(() => advanceRound(tappedIds), ROUND_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-armed only when the round itself changes, not on every tap
  }, [roundIndex])

  const handleTap = useCallback(
    (object: FocusObject): void => {
      const isCorrect = round.targetIds.includes(object.id)
      if (isCorrect) {
        if (firstCorrectAtRef.current === null) {
          firstCorrectAtRef.current = Date.now()
          totalsRef.current.adaptationTimesMs.push(firstCorrectAtRef.current - roundStartRef.current)
        }
        totalsRef.current.correctTaps += 1
        recordOutcome(true)
        setTappedIds((current) => {
          const next = [...current, object.id]
          if (next.length >= round.targetIds.length) window.setTimeout(() => advanceRound(next), 260)
          return next
        })
      } else {
        if (previousRound !== null && matchesRule(object, previousRound.rule, previousRound.movingIds)) {
          totalsRef.current.incorrectHabitResponses += 1
          roundIncorrectRef.current += 1
        }
        recordOutcome(false)
        setFeedback({ id: object.id, kind: 'wrong' })
        window.setTimeout(() => setFeedback(null), 200)
      }
    },
    [round, previousRound, advanceRound, recordOutcome],
  )

  const remaining = round.targetIds.length - tappedIds.length

  return (
    <FocusExperimentLayout maxWidthClassName="max-w-2xl">
      <FocusShieldBadge level={shieldLevel} />
      <DifficultyCommentaryLine levelIndex={effectiveLevel} justStabilized={justStabilized} triggerKey={roundIndex} />
      <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">{ruleLabel(round.rule)}</p>
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
                isMoving={!prefersReducedMotion && round.movingIds.includes(object.id)}
                feedback={feedback?.id === object.id ? feedback.kind : null}
              />
            ))}
        </AnimatePresence>
      </div>
    </FocusExperimentLayout>
  )
}
