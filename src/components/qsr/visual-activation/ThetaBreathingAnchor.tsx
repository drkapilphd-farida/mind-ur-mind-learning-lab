'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, SkipForward, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VisualActivationExerciseProps } from './types'

// Theta Breathing & Focal Anchor™ — Exercise 1 of the Visual Activation
// Suite. An alpha/theta-state warm-up: a slow, paced breath cycle with
// three synchronized channels — a scaling glass-morphism glow orb
// (visual), a gentle rhythmic vibration strictly on inhale (haptic), and
// a native Web Audio tone that glides up in pitch on inhale and back
// down on exhale (audio) — so the whole nervous system settles into the
// same pace before the eyes ever start working.
const INHALE_MS = 4_000
const EXHALE_MS = 4_000
const CYCLE_MS = INHALE_MS + EXHALE_MS
const EXERCISE_DURATION_MS = 90_000
// How often the phase scheduler checks for a transition — cheap (5
// ticks/sec) and only ever drives side-effect scheduling, never the
// visual animation itself (that's one continuous framer-motion loop
// declared once, interpolated off the JS thread for real 60fps).
const PHASE_TICK_MS = 200

// A gentle, consonant glide (a perfect fifth) rather than a jarring pitch
// sweep — genuinely calming, not an alarm.
const LOW_FREQ_HZ = 220 // A3
const HIGH_FREQ_HZ = 330 // E4
const PEAK_GAIN = 0.05 // deliberately quiet — an ambient tone, not music
const AUDIO_FADE_IN_S = 1.5

// A soothing pulse-rest pattern (never a continuous buzz), sized to
// exactly span one inhale — computed from INHALE_MS so the two can never
// drift out of sync if the timing constants above ever change.
const HAPTIC_PULSE_ON_MS = 180
const HAPTIC_PULSE_OFF_MS = 320
const HAPTIC_PULSE_COUNT = Math.floor(INHALE_MS / (HAPTIC_PULSE_ON_MS + HAPTIC_PULSE_OFF_MS))
const HAPTIC_PATTERN: readonly number[] = Array.from({ length: HAPTIC_PULSE_COUNT }, () => [HAPTIC_PULSE_ON_MS, HAPTIC_PULSE_OFF_MS]).flat()

type ExercisePhase = 'intro' | 'breathing' | 'complete'
type BreathPhase = 'inhale' | 'exhale'

function computeBreathPhase(elapsedMs: number): BreathPhase {
  return elapsedMs % CYCLE_MS < INHALE_MS ? 'inhale' : 'exhale'
}

export function ThetaBreathingAnchor({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale')

  const isMountedRef = useRef(true)
  const lastBreathPhaseRef = useRef<BreathPhase | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  // The tone's own current target frequency, tracked ourselves rather
  // than read back via oscillator.frequency.value — that getter isn't
  // guaranteed to reflect a just-scheduled setValueAtTime call before at
  // least one audio-rendering quantum has actually processed, which
  // silently pinned the wrong starting value (the AudioParam's built-in
  // 440Hz default, not our own 220Hz) the first time this was tried.
  const currentFreqTargetRef = useRef(LOW_FREQ_HZ)
  // Real elapsed wall-clock time (performance.now()-based), not an
  // accumulated `+= PHASE_TICK_MS` counter — setInterval only guarantees
  // "at least" its delay, so accumulating a fixed increment per tick can
  // drift from real time under any load, which desyncs the visual/haptic
  // phase-transition detection from the AudioContext's own real-time
  // hardware clock.
  const startedAtRef = useRef(0)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Audio + haptic cleanup. The returned function fires whenever `phase`
  // changes AND on unmount, but it must only actually tear anything down
  // when LEAVING 'breathing' (finished/skipped/exited) or unmounting
  // mid-breathing — never when ENTERING it. Each effect instance's
  // closure captures `phase` as it was AT REGISTRATION time, so the
  // guard below is checking "was this the breathing instance?", not the
  // phase we're transitioning to: the very first instance is registered
  // while phase is still 'intro', and without this guard its cleanup
  // (firing the instant phase flips to 'breathing') would immediately
  // null out the refs initAudio() just populated and stop the oscillator
  // ~350ms after it starts — which is exactly what happened before this
  // guard existed: haptics fired correctly (they don't depend on these
  // refs) while every scheduleTone() call silently no-op'd on an
  // already-null oscillatorRef, leaving the tone frozen at its starting
  // pitch for the whole exercise.
  useEffect(() => {
    return () => {
      if (phase !== 'breathing') return
      stopHaptics()
      teardownAudio()
    }
  }, [phase])

  // The exercise timer (time remaining + phase-transition detection) —
  // recomputed from real elapsed time on every tick, never accumulated,
  // so it can't drift regardless of how irregularly the interval itself
  // actually fires.
  useEffect(() => {
    if (phase !== 'breathing') return undefined
    const interval = setInterval(() => {
      if (!isMountedRef.current) return
      const realElapsedMs = performance.now() - startedAtRef.current
      setElapsedMs(Math.min(EXERCISE_DURATION_MS, realElapsedMs))
    }, PHASE_TICK_MS)
    return () => clearInterval(interval)
  }, [phase])

  // Phase-transition scheduler — audio ramps and haptic pulses are
  // scheduled exactly once per transition (never per-tick), detected by
  // comparing against the last-known phase in a ref.
  useEffect(() => {
    if (phase !== 'breathing') return
    const nextBreathPhase = computeBreathPhase(elapsedMs)
    if (nextBreathPhase === lastBreathPhaseRef.current) return
    lastBreathPhaseRef.current = nextBreathPhase
    setBreathPhase(nextBreathPhase)

    if (nextBreathPhase === 'inhale') {
      scheduleTone(HIGH_FREQ_HZ, INHALE_MS)
      triggerInhaleHaptics()
    } else {
      scheduleTone(LOW_FREQ_HZ, EXHALE_MS)
      stopHaptics()
    }
  }, [phase, elapsedMs])

  useEffect(() => {
    if (phase === 'breathing' && elapsedMs >= EXERCISE_DURATION_MS) {
      finishExercise()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, elapsedMs])

  function initAudio(): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    if (audioContextRef.current) return

    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(LOW_FREQ_HZ, audioContext.currentTime)
    currentFreqTargetRef.current = LOW_FREQ_HZ
    gain.gain.setValueAtTime(0, audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(PEAK_GAIN, audioContext.currentTime + AUDIO_FADE_IN_S)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()

    audioContextRef.current = audioContext
    oscillatorRef.current = oscillator
    gainRef.current = gain
  }

  function scheduleTone(targetHz: number, durationMs: number): void {
    const audioContext = audioContextRef.current
    const oscillator = oscillatorRef.current
    if (!audioContext || !oscillator) return
    const now = audioContext.currentTime
    oscillator.frequency.cancelScheduledValues(now)
    oscillator.frequency.setValueAtTime(currentFreqTargetRef.current, now)
    oscillator.frequency.linearRampToValueAtTime(targetHz, now + durationMs / 1000)
    currentFreqTargetRef.current = targetHz
  }

  function teardownAudio(): void {
    const audioContext = audioContextRef.current
    const oscillator = oscillatorRef.current
    const gain = gainRef.current
    if (audioContext && gain) {
      const now = audioContext.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.3)
    }
    setTimeout(() => {
      oscillator?.stop()
      void audioContext?.close().catch(() => undefined)
    }, 350)
    audioContextRef.current = null
    oscillatorRef.current = null
    gainRef.current = null
  }

  function triggerInhaleHaptics(): void {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
    navigator.vibrate([...HAPTIC_PATTERN])
  }

  function stopHaptics(): void {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
    // Explicit per the exercise's own physical-relaxation requirement:
    // exhale must be vibration-free, never a lingering pulse from a
    // pattern that overran its inhale window.
    navigator.vibrate(0)
  }

  function handleStart(): void {
    initAudio()
    lastBreathPhaseRef.current = null
    startedAtRef.current = performance.now()
    setElapsedMs(0)
    setBreathPhase('inhale')
    setPhase('breathing')
  }

  function finishExercise(): void {
    stopHaptics()
    teardownAudio()
    setPhase('complete')
  }

  function handleSkip(): void {
    stopHaptics()
    teardownAudio()
    setPhase('complete')
  }

  const remainingSeconds = Math.ceil((EXERCISE_DURATION_MS - elapsedMs) / 1000)
  const isInhale = breathPhase === 'inhale'

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
      {/* Soft depth-tinting background — static blurred color washes, not
          animated (only the orb itself carries motion), fully token-based
          so it reads correctly in both themes without hardcoded lightness. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 blur-3xl" />
      </div>

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Theta Breathing &amp; Focal Anchor</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-teal-500/20 text-indigo-500">
            <Wind className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Settle In. Just Breathe.</h2>
          <p className="text-sm text-muted-foreground">
            90 seconds of paced breathing with a glowing focal anchor. On phones, you&rsquo;ll feel a soft pulse while you breathe in — nothing on the exhale.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30"
          >
            Begin
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onExit} className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Exit
          </button>
        </motion.div>
      )}

      {phase === 'breathing' && (
        <div className="flex flex-col items-center gap-10">
          {/* Glass-morphism fluid glow orb — one continuous framer-motion
              loop declared once (never re-created per render), so the
              actual scale interpolation runs off the JS thread at a real
              60fps regardless of what the phase-scheduler effects above
              are doing. */}
          <div className="relative flex size-64 items-center justify-center">
            <motion.div
              aria-hidden="true"
              animate={{ scale: [0.72, 1.18, 0.72], opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: CYCLE_MS / 1000, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/40 via-violet-400/30 to-teal-400/40 blur-2xl"
            />
            <motion.div
              aria-hidden="true"
              animate={{ scale: [0.78, 1.12, 0.78] }}
              transition={{ duration: CYCLE_MS / 1000, repeat: Infinity, ease: 'easeInOut' }}
              className={cn(
                'absolute inset-6 rounded-full border border-white/40 bg-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-xl',
                'dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]',
              )}
            />
            <span className="relative font-heading text-lg font-semibold text-foreground">{isInhale ? 'Breathe In' : 'Breathe Out'}</span>
          </div>

          <p className="text-sm font-medium tabular-nums text-muted-foreground">{remainingSeconds}s remaining</p>

          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
          >
            Finish Early
            <SkipForward className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-teal-500/20 text-indigo-500">
            <Wind className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Mind Settled</h2>
          <p className="text-sm text-muted-foreground">Your focus is anchored. Ready for what&rsquo;s next.</p>
          <button
            type="button"
            onClick={onComplete}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30"
          >
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </div>
  )
}
