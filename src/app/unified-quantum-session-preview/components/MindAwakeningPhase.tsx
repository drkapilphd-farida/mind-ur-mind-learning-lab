'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SkipForward } from 'lucide-react'
import { useSoundPreference } from '@/hooks/exercises/useSoundPreference'
import {
  playClickChime,
  startFocusAmbient,
  stopFocusAmbient,
  startMeditativeBreathDrone,
  stopMeditativeBreathDrone,
  updateMeditativeBreathSwell,
} from './soundEngine'

const PHASE_DURATION_MS = 120_000
// Box Breathing (4-4-4-4)™ — 4 equal phases (inhale, hold, exhale, hold),
// each 4 seconds, matching the standard box-breathing technique. Only
// ever reached via QuantumJourneySession.tsx (Days 1-7) or the standalone
// /unified-quantum-session-preview route — both habit-domain-exclusive
// per src/middleware.ts's DOMAIN_ROUTES, so no runtime appDomain check is
// needed here to keep this off the QSR app experience; it's structurally
// unreachable from there already.
const BOX_BREATH_PHASE_MS = 4_000
const BOX_BREATH_CYCLE_MS = BOX_BREATH_PHASE_MS * 4
// Not `as const` — framer-motion's `transition.times` prop is typed as a
// mutable `number[]`, and a readonly tuple isn't assignable to it.
const BOX_BREATH_KEYFRAME_TIMES: number[] = [0, 0.25, 0.5, 0.75, 1]
const BOX_BREATH_PHASE_LABELS = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'] as const
const TICK_MS = 1_000

// Breath-Synced Haptics™ — Breathe In gets a dense pulse-rest flutter
// sized to exactly span its 4s phase (same technique as
// ThetaBreathingAnchor.tsx's own HAPTIC_PATTERN, computed locally here
// since this is a 4-phase box breath, not that component's 2-phase
// cycle — no shared haptics wrapper exists anywhere in this app, and
// this file follows that same established convention). Breathe Out gets
// a deliberately sparser, slower cadence — distinct enough to feel
// different from Breathe In, and NOT silent (unlike ThetaBreathingAnchor's
// 2-phase design where exhale is silent — this is a different exercise,
// and the product spec explicitly asks for a felt cue on Breathe Out
// too). Hold gets one short, firm single pulse.
const HAPTIC_PULSE_ON_MS = 100
const HAPTIC_PULSE_OFF_MS = 150
const HAPTIC_BREATHE_IN_PULSE_COUNT = Math.floor(BOX_BREATH_PHASE_MS / (HAPTIC_PULSE_ON_MS + HAPTIC_PULSE_OFF_MS))
const HAPTIC_BREATHE_IN_PATTERN: readonly number[] = Array.from({ length: HAPTIC_BREATHE_IN_PULSE_COUNT }, () => [
  HAPTIC_PULSE_ON_MS,
  HAPTIC_PULSE_OFF_MS,
]).flat()
const HAPTIC_BREATHE_OUT_PATTERN: readonly number[] = [150, 300, 150, 300, 150, 300, 150, 300]
const HAPTIC_HOLD_PULSE_MS = 20

type MindAwakeningPhaseProps = {
  onComplete: () => void
  // 21-Day Transformation Journey™ — additive, optional, defaults to true
  // (today's exact standalone behavior in UnifiedQuantumSession). The
  // Journey's own first 7 days (Days 1-7, see isMandatoryBreathingDay)
  // pass `false` here — building the calming habit deliberately means no
  // early-out during that mandatory window; every later day (Day 8+)
  // still gets Skip, just one step earlier (a prep screen before this
  // component ever mounts — see QuantumJourneySession).
  allowSkip?: boolean
}

// Phase 1 — a 2-minute breathing circle, purely time-driven: the visual
// animation is one continuous CSS/Framer keyframe loop (never restarted
// by React state), while a separate 1-second ticker only tracks elapsed
// time for the "time remaining" label and the auto-advance at 120s. An
// explicit Skip button lets advanced users move on immediately instead
// of waiting out the full warm-up.
export function MindAwakeningPhase({ onComplete, allowSkip = true }: MindAwakeningPhaseProps): React.JSX.Element {
  const [elapsedMs, setElapsedMs] = useState(0)
  const isMountedRef = useRef(true)
  const hasCompletedRef = useRef(false)
  const lastPhaseIndexRef = useRef<number | null>(null)
  const [soundEnabled] = useSoundPreference()

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (elapsedMs >= PHASE_DURATION_MS) {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete()
      }
      return
    }
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return
      setElapsedMs(Math.min(PHASE_DURATION_MS, elapsedMs + TICK_MS))
    }, TICK_MS)
    return () => clearTimeout(timeout)
  }, [elapsedMs, onComplete])

  // Meditative Soundscape™ — swaps Focus Ambient (the flat drone the
  // parent QuantumJourneySession started for the whole session) for a
  // breath-reactive Meditative Breath Drone for exactly the duration of
  // this exercise, restoring Focus Ambient on Skip, natural completion,
  // or navigating away mid-breath. `soundEnabled` in the dependency array
  // means flipping the in-session audio toggle mid-breathing actually
  // starts/stops audio live rather than waiting for a remount — the
  // underlying start*/stop* functions each re-check the real persisted
  // preference at call time, so a stale `soundEnabled` value here only
  // ever triggers a redundant no-op, never an incorrect one.
  useEffect(() => {
    stopFocusAmbient()
    startMeditativeBreathDrone()
    return () => {
      stopMeditativeBreathDrone()
      startFocusAmbient()
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(0)
    }
  }, [soundEnabled])

  function handleSkip(): void {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    playClickChime()
    onComplete()
  }

  const remainingMs = PHASE_DURATION_MS - elapsedMs
  const remainingSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const boxBreathPhaseIndex = Math.floor((elapsedMs % BOX_BREATH_CYCLE_MS) / BOX_BREATH_PHASE_MS)
  const breathLabel = BOX_BREATH_PHASE_LABELS[boxBreathPhaseIndex]

  // Breath-Synced Haptics + Swell™ — fires exactly once per phase index
  // change (guarded by lastPhaseIndexRef, since elapsedMs itself ticks
  // every second within the same phase). Breathe In/Out drive both a
  // distinct vibration pattern and the meditative drone's swell/rest
  // target; Hold gets a haptic pulse only (the drone holds its current
  // gain through both Hold phases, matching the breath's own physical
  // pause).
  useEffect(() => {
    if (lastPhaseIndexRef.current === boxBreathPhaseIndex) return
    lastPhaseIndexRef.current = boxBreathPhaseIndex

    const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

    if (boxBreathPhaseIndex === 0) {
      if (canVibrate) navigator.vibrate([...HAPTIC_BREATHE_IN_PATTERN])
      updateMeditativeBreathSwell('swell')
    } else if (boxBreathPhaseIndex === 2) {
      if (canVibrate) navigator.vibrate([...HAPTIC_BREATHE_OUT_PATTERN])
      updateMeditativeBreathSwell('rest')
    } else if (canVibrate) {
      navigator.vibrate(HAPTIC_HOLD_PULSE_MS)
    }
  }, [boxBreathPhaseIndex])

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mind Awakening</p>
      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Box Breathing — 4-4-4-4</h2>

      <div className="relative flex size-56 items-center justify-center">
        {/* Glow layer — synced to the exact same 4-phase keyframes as the
            circle below, so the glow visibly peaks through both hold
            phases rather than pulsing independently of the breath. */}
        <motion.div
          animate={{ scale: [0.6, 1, 1, 0.6, 0.6], opacity: [0.35, 0.9, 0.9, 0.35, 0.35] }}
          transition={{ duration: BOX_BREATH_CYCLE_MS / 1000, times: BOX_BREATH_KEYFRAME_TIMES, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/40 via-violet-500/25 to-teal-500/40 blur-md"
        />
        <motion.div
          animate={{ scale: [0.6, 1, 1, 0.6, 0.6], opacity: [0.45, 0.85, 0.85, 0.45, 0.45] }}
          transition={{ duration: BOX_BREATH_CYCLE_MS / 1000, times: BOX_BREATH_KEYFRAME_TIMES, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-teal-500/30"
        />
        <motion.div
          animate={{ scale: [0.7, 1, 1, 0.7, 0.7] }}
          transition={{ duration: BOX_BREATH_CYCLE_MS / 1000, times: BOX_BREATH_KEYFRAME_TIMES, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-6 rounded-full border-2 border-indigo-500/40"
        />
        <span className="relative font-heading text-lg font-semibold text-foreground">{breathLabel}</span>
      </div>

      {/* Box phase indicator — 4 dots, one per phase, the active one lit
          to make the "4-4-4-4" structure legible at a glance, not just
          felt through the animation timing. */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {BOX_BREATH_PHASE_LABELS.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className={`size-2 rounded-full transition-colors duration-500 ${
              index === boxBreathPhaseIndex ? 'bg-indigo-500' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <p className="text-sm font-medium tabular-nums text-muted-foreground">
        {minutes}:{String(seconds).padStart(2, '0')} remaining
      </p>

      {allowSkip && (
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
        >
          Skip
          <SkipForward className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
