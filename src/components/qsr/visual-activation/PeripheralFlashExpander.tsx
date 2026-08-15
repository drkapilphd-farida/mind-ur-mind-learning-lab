'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { ArrowRight, SkipForward, Zap } from 'lucide-react'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import type { VisualActivationExerciseProps } from './types'

// Peripheral Flash Expander™ — Exercise 4 of the Visual Activation Suite.
// A fixed central anchor holds the gaze still while soft target flashes
// appear, one at a time, around the 8 compass points across 3 rounds of
// expanding radius — training the eyes to notice more of the visual
// field WITHOUT moving off-center. Three synchronized channels, matching
// Exercises 1-3's own architecture: a calm, slow-breathing fixation dot
// plus a brief glowing pulse-and-ripple at each flash position (visual),
// a very light tap exactly when a flash appears — silent otherwise
// (haptic), and the same static-frequency singing-bowl drone as
// Exercises 1 & 3, here purely a quiet, unmodulated background presence
// (audio). Every oscillator's frequency is set once via setValueAtTime
// and never ramped — the same lesson Exercise 1's own "siren" bug taught.

type ExercisePhase = 'intro' | 'active' | 'complete'
type HarmonicVoice = { oscillator: OscillatorNode }
type FlashEvent = { directionIndex: number; radiusPx: number; startMs: number; round: number }

const ARENA_SIZE_PX = 300
const CENTER_PX = ARENA_SIZE_PX / 2

// 3 rounds, expanding outward — each one sweeps all 8 compass points once
// (in a fresh shuffled order) before the radius grows for the next round.
const ROUND_RADII_PX = [70, 95, 118] as const
const [, , OUTER_RADIUS_PX] = ROUND_RADII_PX
const FLASH_DIRECTION_COUNT = 8
const DIRECTION_INDICES: readonly number[] = Array.from({ length: FLASH_DIRECTION_COUNT }, (_, i) => i)

// A fixed, "controlled" cadence — a new flash starts every FLASH_PERIOD_MS,
// each one visible for well under that so there's always a real gap of
// stillness between flashes, giving the eyes a moment to rest on the
// anchor before the next one appears.
const FLASH_PERIOD_MS = 900
const FLASH_VISIBLE_MS = 420
const LEAD_IN_MS = FLASH_PERIOD_MS // a settling moment before the very first flash
const ROUND_GAP_MS = 700 // a brief pause between rounds, signaling "expanding outward now"
const ROUND_DURATION_MS = FLASH_DIRECTION_COUNT * FLASH_PERIOD_MS
const TOTAL_EXERCISE_MS = LEAD_IN_MS + ROUND_DURATION_MS * ROUND_RADII_PX.length + ROUND_GAP_MS * (ROUND_RADII_PX.length - 1)

// Cheap enough for label/round-counter React state (~5 renders/sec) — the
// actual flash position/opacity and the haptic/audio triggering never
// touch this; both are driven off a real-elapsed-time rAF loop below for
// frame-accurate precision instead.
const PHASE_TICK_MS = 200

// A very light tap — silent everywhere except the instant a flash appears.
const HAPTIC_FLASH_MS = 12

// A single fixed grounding fundamental (A3), the same root note
// Exercises 1 & 3 already settled on — every harmonic layer below is set
// once at start and NEVER re-pitched.
const FUNDAMENTAL_HZ = 220
const RESTING_GAIN = 0.03 // a quiet, unmodulated background presence — nothing here ever swells
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 1.0
const RELEASE_TIME_CONSTANT_S = 0.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
const LOWPASS_CUTOFF_HZ = 2_600
const REVERB_WET_LEVEL = 0.3
const REVERB_DURATION_S = 2.0
const REVERB_DECAY = 2.8

// The same singing-bowl-style partial stack as Exercises 1 & 3's own
// drones — fundamental, a few-cents-sharp unison for warm natural
// beating, and two falling-gain upper partials — a consistent sonic
// identity across the whole suite.
const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

function positionForDirectionIndex(directionIndex: number, radiusPx: number): { x: number; y: number } {
  const angle = (directionIndex / FLASH_DIRECTION_COUNT) * Math.PI * 2
  return { x: radiusPx * Math.sin(angle), y: -radiusPx * Math.cos(angle) }
}

// A tiny, dependency-free seeded PRNG (mulberry32) — just enough
// determinism that one exercise run has one fixed, reproducible flash
// order (computed once at start, never re-shuffled mid-run), while a
// fresh seed each run keeps the sequence varied session to session.
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const a = result[i]
    const b = result[j]
    if (a === undefined || b === undefined) continue
    result[i] = b
    result[j] = a
  }
  return result
}

// The full flash timeline for one run — deterministic once built, so
// both the rAF loop (audio/haptics/motion) and the cheap display tick
// can independently derive "what's happening at elapsed time X" from the
// exact same source of truth.
function buildFlashSchedule(seed: number): readonly FlashEvent[] {
  const random = mulberry32(seed)
  const events: FlashEvent[] = []
  let cursorMs = LEAD_IN_MS
  ROUND_RADII_PX.forEach((radiusPx, round) => {
    const order = shuffle(DIRECTION_INDICES, random)
    for (const directionIndex of order) {
      events.push({ directionIndex, radiusPx, startMs: cursorMs, round })
      cursorMs += FLASH_PERIOD_MS
    }
    if (round < ROUND_RADII_PX.length - 1) cursorMs += ROUND_GAP_MS
  })
  return events
}

function computeActiveFlash(elapsedMs: number, schedule: readonly FlashEvent[]): { event: FlashEvent; progress: number } | null {
  for (const event of schedule) {
    if (elapsedMs >= event.startMs && elapsedMs < event.startMs + FLASH_VISIBLE_MS) {
      return { event, progress: (elapsedMs - event.startMs) / FLASH_VISIBLE_MS }
    }
  }
  return null
}

// Fast fade-in, a brief hold near full brightness, then a slightly
// slower fade-out — never an abrupt on/off cut.
function flashEnvelope(progress: number): number {
  if (progress < 0.25) return progress / 0.25
  if (progress < 0.65) return 1
  return Math.max(0, 1 - (progress - 0.65) / 0.35)
}

function computeRoundIndex(elapsedMs: number): number {
  let cursor = LEAD_IN_MS
  for (let round = 0; round < ROUND_RADII_PX.length; round++) {
    const roundEnd = cursor + ROUND_DURATION_MS
    if (elapsedMs < roundEnd) return round
    cursor = roundEnd + ROUND_GAP_MS
  }
  return ROUND_RADII_PX.length - 1
}

// A short, softly-decaying stereo noise tail — the cheapest way to get a
// real convolution-reverb "bloom" without shipping an audio sample.
// Regenerated once per AudioContext, since a ConvolverNode's buffer can't
// be reused across contexts. Identical technique to Exercises 1 & 3.
function createBowlResonanceImpulse(audioContext: AudioContext): AudioBuffer {
  const length = Math.floor(audioContext.sampleRate * REVERB_DURATION_S)
  const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate)
  for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
    const channelData = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * (1 - i / length) ** REVERB_DECAY
    }
  }
  return impulse
}

export function PeripheralFlashExpander({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const scheduleRef = useRef<readonly FlashEvent[]>([])
  const lastFiredStartMsRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  // The flash's own real position/visibility — driven every animation
  // frame from real elapsed time, never React state, so it stays a true
  // 60fps regardless of what the cheap display tick below is doing. Only
  // one flash is ever visible at a time, so a single set of motion
  // values is enough — no per-direction elements need to stay mounted.
  const flashX = useMotionValue(0)
  const flashY = useMotionValue(0)
  const flashOpacity = useMotionValue(0)
  const flashScale = useMotionValue(0.6)
  const rippleOpacity = useMotionValue(0)
  const rippleScale = useMotionValue(0.8)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Cleanup mirrors Exercises 1-3's own guard exactly: the returned
  // function fires on every `phase` change AND on unmount, but must only
  // actually tear audio down when LEAVING 'active' — never when entering
  // it. See ThetaBreathingAnchor.tsx for the full reasoning.
  useEffect(() => {
    return () => {
      if (phase !== 'active') return
      teardownAudio()
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'active') return undefined
    const interval = setInterval(() => {
      if (!isMountedRef.current || startedAtRef.current === null) return
      const realElapsedMs = performance.now() - startedAtRef.current
      setElapsedMs(Math.min(TOTAL_EXERCISE_MS, realElapsedMs))
    }, PHASE_TICK_MS)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase === 'active' && elapsedMs >= TOTAL_EXERCISE_MS) {
      finishExercise()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, elapsedMs])

  // The real, frame-accurate driver: recomputes the active flash (if any)
  // from real elapsed time every frame, and edge-triggers the haptic
  // exactly once per flash by comparing against the last-fired event's
  // own start time.
  useAnimationFrame(() => {
    if (phaseRef.current !== 'active' || startedAtRef.current === null) return
    const elapsed = Math.min(TOTAL_EXERCISE_MS, performance.now() - startedAtRef.current)
    const active = computeActiveFlash(elapsed, scheduleRef.current)

    if (active === null) {
      flashOpacity.set(0)
      rippleOpacity.set(0)
      return
    }

    if (active.event.startMs !== lastFiredStartMsRef.current) {
      lastFiredStartMsRef.current = active.event.startMs
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_FLASH_MS)
    }

    const position = positionForDirectionIndex(active.event.directionIndex, active.event.radiusPx)
    const envelope = flashEnvelope(active.progress)
    flashX.set(position.x)
    flashY.set(position.y)
    flashOpacity.set(envelope)
    flashScale.set(0.55 + envelope * 0.6)
    rippleOpacity.set(envelope * 0.4 * (1 - active.progress))
    rippleScale.set(0.8 + active.progress * 1.4)
  })

  function initAudio(): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    if (audioContextRef.current) return

    const audioContext = new AudioContext()
    const now = audioContext.currentTime

    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0, now)
    // A single, gentle settling-in swell — and nothing else ever touches
    // this gain again until teardown. A quiet, unmodulated presence.
    masterGain.gain.setTargetAtTime(RESTING_GAIN, now, AMBIENT_FADE_IN_TIME_CONSTANT_S)

    const filter = audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(LOWPASS_CUTOFF_HZ, now)
    filter.Q.setValueAtTime(0.7, now)

    const dryGain = audioContext.createGain()
    dryGain.gain.setValueAtTime(1, now)
    const wetGain = audioContext.createGain()
    wetGain.gain.setValueAtTime(REVERB_WET_LEVEL, now)
    const convolver = audioContext.createConvolver()
    convolver.buffer = createBowlResonanceImpulse(audioContext)

    masterGain.connect(filter)
    filter.connect(dryGain)
    dryGain.connect(audioContext.destination)
    filter.connect(convolver)
    convolver.connect(wetGain)
    wetGain.connect(audioContext.destination)

    const voices: HarmonicVoice[] = HARMONIC_LAYERS.map(({ multiplier, weight, pan }) => {
      const oscillator = audioContext.createOscillator()
      oscillator.type = 'sine'
      // Set once, here, and never scheduled again — a fixed, stable
      // drone with no frequency automation anywhere in its lifetime.
      oscillator.frequency.setValueAtTime(FUNDAMENTAL_HZ * multiplier, now)

      const voiceGain = audioContext.createGain()
      voiceGain.gain.setValueAtTime(weight, now)

      const panner = audioContext.createStereoPanner()
      panner.pan.setValueAtTime(pan, now)

      oscillator.connect(voiceGain)
      voiceGain.connect(panner)
      panner.connect(masterGain)
      oscillator.start()

      return { oscillator }
    })

    audioContextRef.current = audioContext
    masterGainRef.current = masterGain
    harmonicVoicesRef.current = voices
  }

  function teardownAudio(): void {
    const audioContext = audioContextRef.current
    const masterGain = masterGainRef.current
    const voices = harmonicVoicesRef.current
    if (audioContext && masterGain) {
      const now = audioContext.currentTime
      masterGain.gain.cancelScheduledValues(now)
      masterGain.gain.setValueAtTime(masterGain.gain.value, now)
      masterGain.gain.setTargetAtTime(0, now, RELEASE_TIME_CONSTANT_S)
    }
    // Stop only after the release has fully settled (~5 time constants)
    // so the oscillators never cut off mid-decay — stopping any earlier
    // is exactly what produces an audible click.
    setTimeout(() => {
      for (const voice of voices) voice.oscillator.stop()
      void audioContext?.close().catch(() => undefined)
    }, RELEASE_SETTLE_MS)
    audioContextRef.current = null
    masterGainRef.current = null
    harmonicVoicesRef.current = []
  }

  function handleStart(): void {
    initAudio()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(0)
    scheduleRef.current = buildFlashSchedule(Date.now())
    lastFiredStartMsRef.current = null
    startedAtRef.current = performance.now()
    flashOpacity.set(0)
    rippleOpacity.set(0)
    setElapsedMs(0)
    setPhase('active')
  }

  function finishExercise(): void {
    teardownAudio()
    setPhase('complete')
  }

  function handleSkip(): void {
    teardownAudio()
    setPhase('complete')
  }

  const remainingSeconds = Math.ceil((TOTAL_EXERCISE_MS - elapsedMs) / 1000)
  const currentRound = computeRoundIndex(elapsedMs) + 1

  return (
    <div className={`relative flex ${isEmbedded ? 'h-full' : 'min-h-[100dvh]'} flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center`}>
      {!isEmbedded && <BrandWatermark className="absolute top-4 left-6" />}
      {/* Rich, layered ambient wash — the same indigo/violet/cyan
          treatment as the rest of the suite, for a consistent Brain Gym
          identity. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(103,232,249,0.35) 0%, rgba(139,92,246,0.32) 38%, rgba(67,56,202,0.4) 68%, transparent 100%)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.35) 0%, transparent 70%)' }}
        />
      </div>

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Peripheral Flash Expander</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Zap className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Widen Your Visual Field</h2>
          <p className="text-sm text-muted-foreground">
            Lock your gaze on the center dot and never look away. Soft flashes will appear around it in 3 rounds, expanding outward — just
            notice them. A light tap marks every flash.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30"
          >
            Begin
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          {!isEmbedded && (
            <button type="button" onClick={onExit} className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Exit
            </button>
          )}
        </motion.div>
      )}

      {phase === 'active' && (
        <div className="flex flex-col items-center gap-8">
          <div className="relative" style={{ width: ARENA_SIZE_PX, height: ARENA_SIZE_PX }}>
            {/* A subtle guide — the 3 round radii and the 8 compass
                spokes flashes can appear on — never distracting, just a
                faint preview of the field being trained. */}
            <svg aria-hidden="true" viewBox={`0 0 ${ARENA_SIZE_PX} ${ARENA_SIZE_PX}`} className="absolute inset-0 size-full">
              {ROUND_RADII_PX.map((radius) => (
                <circle
                  key={radius}
                  cx={CENTER_PX}
                  cy={CENTER_PX}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="2 8"
                  className="text-violet-500/15 dark:text-violet-300/12"
                />
              ))}
              {DIRECTION_INDICES.map((directionIndex) => {
                const outer = positionForDirectionIndex(directionIndex, OUTER_RADIUS_PX)
                return (
                  <line
                    key={directionIndex}
                    x1={CENTER_PX}
                    y1={CENTER_PX}
                    x2={CENTER_PX + outer.x}
                    y2={CENTER_PX + outer.y}
                    stroke="currentColor"
                    strokeWidth={1}
                    className="text-indigo-500/10 dark:text-indigo-300/8"
                  />
                )
              })}
            </svg>

            {/* The central fixation anchor — a calm, slow-breathing glow
                the gaze stays locked on the whole time. A simple,
                declarative infinite loop is all this needs; it never
                moves, so it doesn't touch the rAF-driven motion values
                below. */}
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-3 -mt-3 flex size-6 items-center justify-center rounded-full"
                animate={{ scale: [1, 1.1, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-[-10px] rounded-full blur-md"
                  style={{ background: 'radial-gradient(circle, rgba(165,243,252,0.8) 0%, rgba(139,92,246,0.6) 60%, transparent 100%)' }}
                />
                <div
                  aria-hidden="true"
                  className="relative size-full rounded-full border border-white/70 shadow-[0_0_18px_-2px_rgba(139,92,246,0.85)]"
                  style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(34,211,238,0.95) 45%, rgba(79,70,229,0.95) 100%)' }}
                />
              </motion.div>
            </div>

            {/* The ripple — an expanding, fading ring riding behind each
                flash, giving it a "ping" of energy rather than a flat
                pulse. */}
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-6 -mt-6 size-12 rounded-full border border-cyan-300/60"
                style={{ x: flashX, y: flashY, opacity: rippleOpacity, scale: rippleScale }}
              />
            </div>

            {/* The flash itself — the same premium glass-bright core
                inside a soft bloom used throughout the suite, appearing
                only for its own brief visible window. */}
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                className="-ml-4 -mt-4 flex size-8 items-center justify-center rounded-full"
                style={{ x: flashX, y: flashY, opacity: flashOpacity, scale: flashScale }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-[-12px] rounded-full blur-lg"
                  style={{ background: 'radial-gradient(circle, rgba(165,243,252,0.9) 0%, rgba(139,92,246,0.75) 55%, transparent 100%)' }}
                />
                <div
                  aria-hidden="true"
                  className="relative size-full rounded-full border border-white/70 shadow-[0_0_28px_-3px_rgba(139,92,246,0.9)]"
                  style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(34,211,238,0.95) 45%, rgba(79,70,229,0.95) 100%)' }}
                />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="font-heading text-lg font-semibold text-foreground">
              Round {currentRound} of {ROUND_RADII_PX.length}
            </span>
            <p className="text-sm font-medium tabular-nums text-muted-foreground">{remainingSeconds}s remaining</p>
          </div>

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
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Zap className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Field Expanded</h2>
          <p className="text-sm text-muted-foreground">Your peripheral awareness just stretched wider, without your eyes ever leaving center.</p>
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
