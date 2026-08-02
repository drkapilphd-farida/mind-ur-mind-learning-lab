'use client'

import { useEffect, useState } from 'react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useMicroVictoryReveal } from '@/hooks/exercises/useMicroVictoryReveal'
import { cn } from '@/lib/utils'

type BreathPhase = 'inhale' | 'hold' | 'exhale'

const PHASE_ORDER: readonly BreathPhase[] = ['inhale', 'hold', 'exhale']
const PHASE_DURATION_MS: Record<BreathPhase, number> = { inhale: 4000, hold: 2000, exhale: 6000 }
const PHASE_LABEL: Record<BreathPhase, string> = { inhale: 'Breathe In', hold: 'Hold', exhale: 'Breathe Out' }

const CYCLE_SECONDS = 12 // 4 + 2 + 6
export const BREATH_TOTAL_SECONDS = 120 // 2 minutes = exactly 10 cycles
const TOTAL_CYCLES = BREATH_TOTAL_SECONDS / CYCLE_SECONDS

// UX Sprint 1 — Breath Awareness™ 2.0. Fixed, non-interactive duration of
// the completion beat — reuses useMicroVictoryReveal's generic reveal-timer
// mechanic (Sprint 47) rather than a second bespoke timer hook. onComplete()
// still fires with zero required user action, only delayed by this fixed
// amount; the real 120s breathing budget above is untouched.
const COMPLETION_BEAT_MS = 1800

// UX Sprint 1 — this app's --primary/--accent design tokens are neutral
// grayscale (oklch(... 0 0), zero chroma — confirmed by reading globals.css)
// and no blue token exists anywhere in the design system. The brief
// explicitly and repeatedly asks for a "soft blue gradient," so this orb
// uses a scoped, local blue (Tailwind's sky-400/sky-300/blue-500 tones) —
// not a redesign of the app's color system, just this one component's own
// calming visual treatment.
const ORB_BLUE = { deep: '37, 99, 235', soft: '96, 165, 250', light: '191, 219, 254' }

// UX Sprint (Motion Rebuild, refined in 2.1) — the animation duration/
// percentages below are driven entirely by CSS @keyframes in globals.css
// (breath-awareness-*), computed from PHASE_DURATION_MS above
// (4000+2000+6000 = 12000ms/cycle) — see that file for the full rationale
// and the 2.1 amplitude/synchronization changes. The animation runs
// independently of React re-renders; only the text label below still reads
// `phase` state from the unchanged timer effects. RING_DELAY_MS staggers
// the glow layer so it visibly trails the orb — a ripple, not mechanical
// lockstep — expressed as animation-delay, not transition-delay.
const RING_DELAY_MS = 100
const CYCLE_ANIMATION_DURATION = `${CYCLE_SECONDS}s`

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

type BreathAwarenessScreenProps = {
  onComplete: () => void
}

// The animated breathing circle — a real 2-minute timer (10 cycles of
// 4s inhale / 2s hold / 6s exhale), no video. Reduced-motion users get the
// identical real timer and correct phase text/countdown, just no animated
// motion (every animated layer is conditionally applied only when
// !prefersReducedMotion, on top of globals.css's own blanket reduced-motion
// safety net).
export function BreathAwarenessScreen({ onComplete }: BreathAwarenessScreenProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(BREATH_TOTAL_SECONDS)
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const prefersReducedMotion = usePrefersReducedMotion()
  const isComplete = remainingSeconds <= 0

  // Overall session clock — the single source of truth for "has the real
  // 120s breathing budget elapsed," unchanged from before.
  useEffect(() => {
    if (isComplete) return
    const tickTimer = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000)
    return () => clearTimeout(tickTimer)
  }, [remainingSeconds, isComplete])

  // Breath phase clock — cycles inhale -> hold -> exhale -> inhale...
  // unchanged from before; drives only the text label now (the visual
  // motion below runs on its own independent CSS timeline, see globals.css).
  useEffect(() => {
    if (isComplete) return
    const phaseTimer = setTimeout(() => {
      setPhase((p) => PHASE_ORDER[(PHASE_ORDER.indexOf(p) + 1) % PHASE_ORDER.length]!)
    }, PHASE_DURATION_MS[phase])
    return () => clearTimeout(phaseTimer)
  }, [phase, isComplete])

  // The fixed, automatic completion beat (UX Sprint 1) — unchanged.
  const isCompletionBeatRevealed = useMicroVictoryReveal(COMPLETION_BEAT_MS, isComplete)
  useEffect(() => {
    if (isComplete && isCompletionBeatRevealed) onComplete()
  }, [isComplete, isCompletionBeatRevealed, onComplete])

  const elapsedSeconds = BREATH_TOTAL_SECONDS - remainingSeconds
  const currentCycle = Math.min(TOTAL_CYCLES, Math.floor(elapsedSeconds / CYCLE_SECONDS) + 1)

  if (isComplete) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'relative mx-auto flex w-full max-w-md flex-col items-center gap-3 overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-20 text-center',
          !prefersReducedMotion && 'animate-in fade-in duration-(--duration-slow)',
        )}
      >
        <p className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your mind is ready.</p>
        <p className="max-w-xs text-base leading-relaxed text-foreground/80">Let&rsquo;s begin today&rsquo;s reading journey.</p>
        <p className="mt-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">Continuing…</p>
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-8 overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-12 text-center">
      {/* Ambient lighting — a wide, very soft wash that subtly brightens on
          inhale and dims on exhale, behind everything else. */}
      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle, rgba(${ORB_BLUE.soft}, 0.5) 0%, rgba(${ORB_BLUE.soft}, 0) 65%)`,
            animation: `breath-awareness-ambient-cycle ${CYCLE_ANIMATION_DURATION} infinite`,
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-2">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Breath Awareness™</p>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Prepare Your Mind</h1>
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Relax your eyes. Calm your breathing. Prepare your attention.
        </p>
      </div>

      {/* Floating wrapper — 2.1: now synced to the same breath-cycle
          timeline as every other layer (previously an independent, slower
          drift) — the orb rises while inhaling, settles while exhaling, so
          floating reinforces the breath rather than running against it. */}
      <div
        className="relative z-10 flex size-48 items-center justify-center"
        style={
          !prefersReducedMotion
            ? { animation: `breath-awareness-float ${CYCLE_ANIMATION_DURATION} infinite` }
            : undefined
        }
      >
        {/* Outer aura — the gentle, wide, heavily-blurred halo. */}
        <div
          className="absolute inset-0 m-auto size-48 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, rgba(${ORB_BLUE.soft}, 0.35) 0%, rgba(${ORB_BLUE.soft}, 0) 70%)`,
            transform: prefersReducedMotion ? 'scale(1)' : undefined,
            opacity: prefersReducedMotion ? 0.28 : undefined,
            animation: !prefersReducedMotion ? `breath-awareness-aura-cycle ${CYCLE_ANIMATION_DURATION} infinite` : undefined,
          }}
          aria-hidden="true"
        />

        {/* Diffused glow — trails the orb by RING_DELAY_MS, brightens and
            softens (larger blur radius) on inhale, contracts and tightens on
            exhale. 2.1: blur radius is now keyframe-animated too, not a
            static Tailwind class, so it genuinely breathes with the rest of
            the layer instead of staying visually fixed. Never flickers:
            opacity/scale/blur move together along one continuous timeline. */}
        <div
          className="absolute inset-0 m-auto size-36 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(${ORB_BLUE.soft}, 0.55) 0%, rgba(${ORB_BLUE.soft}, 0) 75%)`,
            transform: prefersReducedMotion ? 'scale(1)' : undefined,
            opacity: prefersReducedMotion ? 0.65 : undefined,
            filter: prefersReducedMotion ? 'blur(30px)' : undefined,
            animation: !prefersReducedMotion
              ? `breath-awareness-glow-cycle ${CYCLE_ANIMATION_DURATION} infinite`
              : undefined,
            animationDelay: !prefersReducedMotion ? `${RING_DELAY_MS}ms` : undefined,
          }}
          aria-hidden="true"
        />

        {/* The orb — a soft, multi-stop radial gradient (offset highlight)
            for a volumetric, calm presence. A single continuous animation
            drives it end to end, eliminating the discrete-transition
            handoff that previously read as "grow, stop, shrink, stop." 2.1
            widened the scale range dramatically (0.62 exhale <-> 1.4 inhale)
            so the size change itself reads as breathing, not scaling. */}
        <div
          className="relative size-28 rounded-full shadow-lg"
          style={{
            background: `radial-gradient(circle at 35% 30%, rgba(${ORB_BLUE.light}, 0.95) 0%, rgba(${ORB_BLUE.soft}, 0.85) 45%, rgba(${ORB_BLUE.soft}, 0.65) 70%, rgba(${ORB_BLUE.deep}, 0.55) 100%)`,
            transform: prefersReducedMotion ? 'scale(1)' : undefined,
            animation: !prefersReducedMotion ? `breath-awareness-orb-cycle ${CYCLE_ANIMATION_DURATION} infinite` : undefined,
          }}
          aria-hidden="true"
        />

        {/* Warm-light overlay (2.1, new) — a small warm-white radial
            gradient on top of the orb whose opacity rises on inhale and
            falls on exhale, reading as "slightly brighter, slightly
            warmer" without animating the orb's own gradient color stops
            directly. Reduced-motion users don't need this purely
            atmospheric layer — the text label already conveys phase. */}
        {!prefersReducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 m-auto size-28 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 30%, rgba(255, 247, 230, 0.9) 0%, rgba(255, 247, 230, 0) 60%)',
              animation: `breath-awareness-warmth-cycle ${CYCLE_ANIMATION_DURATION} infinite`,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-1" aria-live="polite">
        <p
          key={phase}
          className={cn(
            'font-heading text-xl font-semibold tracking-tight text-foreground',
            !prefersReducedMotion && 'animate-in fade-in duration-500',
          )}
        >
          {PHASE_LABEL[phase]}
        </p>
        <p className="text-xs text-muted-foreground">
          Cycle {currentCycle} of {TOTAL_CYCLES}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-6">
        <ProgressRing
          progress={elapsedSeconds / BREATH_TOTAL_SECONDS}
          size={64}
          label={formatTime(remainingSeconds)}
          accessibleLabel={`${formatTime(remainingSeconds)} remaining`}
        />
      </div>
    </div>
  )
}
