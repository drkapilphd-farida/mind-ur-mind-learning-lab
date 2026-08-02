'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  generateSustainedFocusTick,
  nextSustainedFocusTickDelayMs,
  pickSustainedFocusDurationMs,
  pickSustainedFocusTargetShape,
  sustainedFocusStageFor,
  type SustainedFocusTick,
} from '@/features/focus-discovery/sustainedFocus'
import { SUSTAINED_FOCUS_TICK_WINDOW_MS } from '@/features/focus-discovery/focusTimingConfig'
import type { FocusObject } from '@/features/focus-discovery/focusObjects'
import { useFocusShield } from '@/features/focus-discovery/useFocusShield'
import type { FocusDiscoveryEvent } from '@/features/focus-discovery/types'
import { FocusExperimentLayout } from './FocusExperimentLayout'
import { FocusObjectButton } from './FocusObjectButton'
import { FocusShieldBadge } from './FocusShieldBadge'
import { DifficultyCommentaryLine } from './DifficultyCommentaryLine'

type SustainedFocusResult = Extract<FocusDiscoveryEvent, { type: 'sustained_focus_result' }>

type SustainedFocusCardProps = {
  seed: number
  onDone: (result: SustainedFocusResult) => void
}

type TickPhase = 'gap' | 'active'

type ThirdBucket = { correct: number; total: number }

function thirdIndexFor(elapsedMs: number, durationMs: number): 0 | 1 | 2 {
  const fraction = elapsedMs / durationMs
  if (fraction < 1 / 3) return 0
  if (fraction < 2 / 3) return 1
  return 2
}

// Mission 4 — Sustained Focus™ (Long-Term Attention), Sprint-1.5 FIX-05.
// A real, continuous ~30-45s Go/No-Go rhythm: one real target shape held
// for the whole mission, real ticks appear at a real, progressively
// faster cadence, and real distraction dimensions (movement → colour
// changes → blinking → high clutter) ramp in one at a time across 7 real
// equal stages — never several new dimensions introduced at once.
// Accuracy uses the same real hit/miss/false-alarm/correct-rejection
// logic every classic sustained-attention task uses, split into three
// real equal thirds for a real, honest fatigue pattern.
export function SustainedFocusCard({ seed, onDone }: SustainedFocusCardProps): React.JSX.Element {
  const targetShape = useMemo(() => pickSustainedFocusTargetShape(seed), [seed])
  const durationMs = useMemo(() => pickSustainedFocusDurationMs(seed + 1), [seed])

  const [tickIndex, setTickIndex] = useState(0)
  const [phase, setPhase] = useState<TickPhase>('gap')
  const [tick, setTick] = useState<SustainedFocusTick | null>(null)
  const [tapFeedback, setTapFeedback] = useState<{ id: string; kind: 'correct' | 'wrong' } | null>(null)
  const [stage, setStage] = useState(0)
  const startTimeRef = useRef(Date.now())
  const tappedRef = useRef({ target: false, any: false })
  const totalsRef = useRef({ correctHits: 0, missedTargets: 0, falseTaps: 0, totalTicks: 0 })
  const { level: shieldLevel, recordOutcome } = useFocusShield()
  const thirdsRef = useRef<[ThirdBucket, ThirdBucket, ThirdBucket]>([
    { correct: 0, total: 0 },
    { correct: 0, total: 0 },
    { correct: 0, total: 0 },
  ])

  const finishMission = useCallback((): void => {
    const totals = totalsRef.current
    const [early, mid, late] = thirdsRef.current
    const ratio = (bucket: ThirdBucket): number => (bucket.total > 0 ? bucket.correct / bucket.total : 1)
    onDone({
      type: 'sustained_focus_result',
      totalTicks: totals.totalTicks,
      correctHits: totals.correctHits,
      missedTargets: totals.missedTargets,
      falseTaps: totals.falseTaps,
      earlyAccuracy: ratio(early),
      midAccuracy: ratio(mid),
      lateAccuracy: ratio(late),
    })
  }, [onDone])

  // Real gap → real active window choreography, driven purely by real
  // elapsed time against the real, randomly-picked session duration —
  // never a fixed tick count.
  useEffect(() => {
    if (phase === 'gap') {
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed >= durationMs) {
        finishMission()
        return undefined
      }
      const delayMs = nextSustainedFocusTickDelayMs(seed + 2, tickIndex, elapsed / durationMs)
      const timer = window.setTimeout(() => {
        const nextElapsed = Date.now() - startTimeRef.current
        const nextFraction = nextElapsed / durationMs
        tappedRef.current = { target: false, any: false }
        setTick(generateSustainedFocusTick(targetShape, tickIndex, nextFraction, seed + 3))
        setStage(sustainedFocusStageFor(nextFraction))
        setPhase('active')
      }, delayMs)
      return () => window.clearTimeout(timer)
    }

    // 'active' — the real tick's own tappable window.
    const timer = window.setTimeout(() => {
      const elapsed = Date.now() - startTimeRef.current
      const bucket = thirdsRef.current[thirdIndexFor(elapsed, durationMs)]
      const wasTarget = tick?.isTarget ?? false
      totalsRef.current.totalTicks += 1
      bucket.total += 1
      if (wasTarget) {
        if (tappedRef.current.target) {
          totalsRef.current.correctHits += 1
          bucket.correct += 1
          recordOutcome(true)
        } else {
          totalsRef.current.missedTargets += 1
          recordOutcome(false)
        }
      } else {
        if (tappedRef.current.any) {
          totalsRef.current.falseTaps += 1
          recordOutcome(false)
        } else {
          bucket.correct += 1
          recordOutcome(true)
        }
      }
      setTick(null)
      setTapFeedback(null)
      setPhase('gap')
      setTickIndex((index) => index + 1)
    }, SUSTAINED_FOCUS_TICK_WINDOW_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick is read via a snapshot at timeout-fire time, not a reactive dependency
  }, [phase, tickIndex, durationMs, finishMission, seed, targetShape, recordOutcome])

  // Sprint-1.6 FIX-02/FIX-05 — an immediate, real, in-place reaction the
  // instant a tick is tapped (the object itself still disappears on its
  // own real timing regardless of the tap — only the visual
  // acknowledgment is new here).
  const handleTap = useCallback((object: FocusObject, isTargetObject: boolean): void => {
    tappedRef.current.any = true
    if (isTargetObject) tappedRef.current.target = true
    setTapFeedback({ id: object.id, kind: isTargetObject ? 'correct' : 'wrong' })
  }, [])

  return (
    <FocusExperimentLayout maxWidthClassName="max-w-lg">
      <FocusShieldBadge level={shieldLevel} />
      <DifficultyCommentaryLine levelIndex={stage} />
      <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
        Tap only the {targetShape[0]!.toUpperCase() + targetShape.slice(1)}. Ignore everything else.
      </p>
      <div className="relative mx-auto mt-8 aspect-[4/3] w-full max-w-xl">
        {phase === 'active' && tick !== null && (
          <>
            <FocusObjectButton
              object={tick.object}
              onTap={(object) => handleTap(object, tick.isTarget)}
              isMoving={tick.isMoving}
              isBlinking={tick.isBlinking}
              midTickColor={tick.midTickColor}
              feedback={tapFeedback?.id === tick.object.id ? tapFeedback.kind : null}
            />
            {tick.clutterObject !== undefined && (
              <FocusObjectButton
                object={tick.clutterObject}
                onTap={(object) => handleTap(object, false)}
                isMoving={tick.isMoving}
                isBlinking={tick.isBlinking}
                feedback={tapFeedback?.id === tick.clutterObject.id ? tapFeedback.kind : null}
              />
            )}
          </>
        )}
      </div>
    </FocusExperimentLayout>
  )
}
