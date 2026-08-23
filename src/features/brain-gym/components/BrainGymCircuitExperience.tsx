'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { SACCADIC_EYE_JUMP_CONFIG } from '../configs/saccadicEyeJumpConfig'
import { PERIPHERAL_EXPANDING_CIRCLE_CONFIG } from '../configs/peripheralExpandingCircleConfig'
import { FAST_PATTERN_BLINKING_CONFIG } from '../configs/fastPatternBlinkingConfig'
import { CROSS_LATERAL_TAP_CONFIG } from '../configs/crossLateralTapConfig'

// Streamlined 2-Minute Brain Gym Circuit™ — the same 4 real drills, each
// shortened from their standalone 16 rounds down to 5 (still real,
// scored, honest attempts — just brief), chained into one fast circuit
// instead of 4 separate tedious full-length exercises. ~5 rounds ×
// ~4-5s/round × 4 drills ≈ the target 2 minutes.
const CIRCUIT_ROUND_COUNT = 5
const CIRCUIT_SEGMENTS = [
  { ...SACCADIC_EYE_JUMP_CONFIG, roundCount: CIRCUIT_ROUND_COUNT },
  { ...PERIPHERAL_EXPANDING_CIRCLE_CONFIG, roundCount: CIRCUIT_ROUND_COUNT },
  { ...FAST_PATTERN_BLINKING_CONFIG, roundCount: CIRCUIT_ROUND_COUNT },
  { ...CROSS_LATERAL_TAP_CONFIG, roundCount: CIRCUIT_ROUND_COUNT },
]

type BrainGymCircuitExperienceProps = {
  onComplete?: () => void
  // 30-Day Curriculum In-Page Master Player™ — additive, optional. When
  // supplied, replaces the intro screen's own previously-hardcoded
  // `/labs/quantum-speed-reading` exit link and gets forwarded to each
  // segment's own BrainGymDrillExperience, so a mid-drill exit never
  // dumps to the lab root while this is embedded in the wizard.
  onExit?: () => void
}

// 21-Day Transformation Journey™ — replaces 4 separate full-length Brain
// Gym pool slots with one combined circuit: an intro screen with a
// prominent Skip (skips the WHOLE circuit, not just one segment), then
// each of the 4 real drills in sequence at a shortened round count —
// each still ending in its own real, unmodified complete screen (genuine
// per-drill accuracy/streak), advanced via that screen's own "Continue
// Session →" action. Standalone usage of each individual drill (their
// own routes, full 16 rounds) is completely unaffected — this circuit
// only ever composes them via BrainGymDrillExperience's existing,
// unmodified props.
export function BrainGymCircuitExperience({ onComplete, onExit }: BrainGymCircuitExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('brain-gym-circuit', '/labs/quantum-speed-reading')
  const [hasStarted, setHasStarted] = useState(false)
  const [segmentIndex, setSegmentIndex] = useState(0)

  function handleSegmentComplete(): void {
    const nextIndex = segmentIndex + 1
    if (nextIndex >= CIRCUIT_SEGMENTS.length) {
      if (curriculumSession.isActiveStep) {
        curriculumSession.advance()
        return
      }
      onComplete?.()
      return
    }
    setSegmentIndex(nextIndex)
  }

  if (!hasStarted) {
    return (
      <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          >
            Exit
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          >
            Exit
          </Link>
        )}
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">2-Minute Brain Gym Circuit™</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            4 quick micro-drills back to back — Saccadic Eye Jump, Peripheral Expanding Circle, Fast Pattern Blinking, and
            Cross-Lateral Tap — about 2 minutes total. Real, scored, but fast.
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3">
          <button
            onClick={() => setHasStarted(true)}
            className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start
          </button>
          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Skip Brain Gym →
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 pt-4 text-xs text-muted-foreground">
        <span>
          Drill {segmentIndex + 1} of {CIRCUIT_SEGMENTS.length}
        </span>
        {onComplete && (
          <button type="button" onClick={onComplete} className="underline underline-offset-4 transition-colors hover:text-foreground">
            Skip Circuit →
          </button>
        )}
      </div>
      <BrainGymDrillExperience
        key={segmentIndex}
        config={CIRCUIT_SEGMENTS[segmentIndex]!}
        onComplete={handleSegmentComplete}
        {...(onExit !== undefined ? { onExit } : {})}
      />
    </div>
  )
}
