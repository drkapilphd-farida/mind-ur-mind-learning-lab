'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Infinity as InfinityIcon, SkipForward } from 'lucide-react'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import type { VisualActivationExerciseProps } from './types'

// Infinity Figure-8 Gliding™ — Exercise 3 of the Visual Activation Suite.
// A glowing target dot glides continuously around a lemniscate (∞) path,
// training both eyes to move together as one smooth binocular pair.
// Three synchronized channels, matching Exercises 1 & 2's own
// architecture: a trailing, richly-lit glow dot (visual), a very light
// tap exactly when the target crosses the figure-8's own center
// intersection — silent everywhere else (haptic), and a static-frequency
// singing-bowl drone that softly blooms louder at that same crossing
// (audio). Every oscillator here has its frequency set once via
// setValueAtTime and never ramped — the same lesson Exercise 1's own
// "siren" bug taught: a moving pitch is what reads as an alarm, a static
// one never does.

type ExercisePhase = 'intro' | 'active' | 'complete'
type HarmonicVoice = { oscillator: OscillatorNode }

// The lemniscate of Bernoulli: x(t) = a·cos(t)/(1+sin²t), y(t) =
// a·sin(t)cos(t)/(1+sin²t). At t=0 the target sits at the right lobe's
// tip; x(t) is exactly zero (the center intersection) at t=π/2 and
// t=3π/2 — nowhere else in one full loop — which is what makes "the sign
// of x flipped" an exact, cheap proxy for "just crossed the center."
const LOOP_A_PX = 128
const SVG_WIDTH_PX = 320
const SVG_HEIGHT_PX = 200
const CENTER_X_PX = SVG_WIDTH_PX / 2
const CENTER_Y_PX = SVG_HEIGHT_PX / 2

const LOOP_DURATION_MS = 7_000
const TOTAL_LOOPS = 4
const TOTAL_EXERCISE_MS = LOOP_DURATION_MS * TOTAL_LOOPS

// Cheap enough for label/loop-counter React state (~5 renders/sec) — the
// actual pixel motion and the crossing-detection driving haptics/audio
// never touch this; both are driven off a real-elapsed-time rAF loop
// below for frame-accurate precision instead.
const PHASE_TICK_MS = 200

// A very light tap — silent everywhere except the instant of crossing.
const HAPTIC_CROSSING_MS = 12
// How long the center marker's own glow bloom lasts after a crossing —
// a purely visual echo of the same moment the haptic and audio mark.
const CENTER_PULSE_DURATION_MS = 650

// A single fixed grounding fundamental (A3), the same root note
// Exercise 1's own drone settled on — every harmonic layer below is set
// once at start and NEVER re-pitched.
const FUNDAMENTAL_HZ = 220
const RESTING_GAIN = 0.03 // the drone's steady backdrop level, deliberately thin
const SWELL_PEAK_GAIN = 0.062 // the brief bloom at a center crossing
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 1.0
const SWELL_ATTACK_TIME_CONSTANT_S = 0.12
const SWELL_HOLD_S = 0.22
const SWELL_RELEASE_TIME_CONSTANT_S = 0.9
const RELEASE_TIME_CONSTANT_S = 0.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
// Warms the tone and shapes the reverb tail below — the convolver's
// impulse response is broadband noise, and without this its tail would
// read as a soft hiss rather than a resonant bloom.
const LOWPASS_CUTOFF_HZ = 2_600
const REVERB_WET_LEVEL = 0.3
const REVERB_DURATION_S = 2.0
const REVERB_DECAY = 2.8

// The same singing-bowl-style partial stack as Exercise 1's own drone —
// fundamental, a few-cents-sharp unison for warm natural beating, and two
// falling-gain upper partials (an octave and an octave-plus-fifth) — a
// consistent sonic identity across the whole suite.
const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

function computeLemniscatePosition(elapsedMs: number): { x: number; y: number; loopIndex: number } {
  const clamped = Math.min(TOTAL_EXERCISE_MS, elapsedMs)
  const loopIndex = Math.min(TOTAL_LOOPS - 1, Math.floor(clamped / LOOP_DURATION_MS))
  const loopElapsed = clamped - loopIndex * LOOP_DURATION_MS
  const t = (loopElapsed / LOOP_DURATION_MS) * Math.PI * 2
  const denom = 1 + Math.sin(t) ** 2
  return {
    x: (LOOP_A_PX * Math.cos(t)) / denom,
    y: (LOOP_A_PX * Math.sin(t) * Math.cos(t)) / denom,
    loopIndex,
  }
}

// A static guide path, sampled once at module load (the shape never
// changes) — an elegant, subtle preview of the exact track the target
// will glide along.
function buildLemniscatePathD(): string {
  const steps = 240
  const segments: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const denom = 1 + Math.sin(t) ** 2
    const px = CENTER_X_PX + (LOOP_A_PX * Math.cos(t)) / denom
    const py = CENTER_Y_PX + (LOOP_A_PX * Math.sin(t) * Math.cos(t)) / denom
    segments.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`)
  }
  return `${segments.join(' ')} Z`
}
const LEMNISCATE_PATH_D = buildLemniscatePathD()

// A short, softly-decaying stereo noise tail — the cheapest way to get a
// real convolution-reverb "bloom" without shipping an audio sample.
// Regenerated once per AudioContext, since a ConvolverNode's buffer can't
// be reused across contexts. Identical technique to Exercise 1's own.
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

export function InfinityFigureEightGliding({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const lastXSignRef = useRef(1)
  const lastCrossingAtMsRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  // The leader dot's real position — driven every animation frame from
  // real elapsed time, never React state, so the glide stays a true
  // 60fps regardless of what the cheap display tick below is doing.
  // Three useSpring "chasers" at falling stiffness trail behind it, the
  // standard framer-motion technique for a comet-style motion trail.
  const x = useMotionValue(LOOP_A_PX)
  const y = useMotionValue(0)
  const trail1X = useSpring(x, { stiffness: 220, damping: 26 })
  const trail1Y = useSpring(y, { stiffness: 220, damping: 26 })
  const trail2X = useSpring(x, { stiffness: 120, damping: 22 })
  const trail2Y = useSpring(y, { stiffness: 120, damping: 22 })
  const trail3X = useSpring(x, { stiffness: 65, damping: 18 })
  const trail3Y = useSpring(y, { stiffness: 65, damping: 18 })

  // A single 0→1 value driving the center marker's own glow bloom —
  // computed as a pure function of "time since last crossing" every
  // frame, the same technique the leader's own position already uses.
  const centerPulse = useMotionValue(0)
  const centerPulseOpacity = useTransform(centerPulse, (p) => 0.12 + p * 0.65)
  const centerPulseScale = useTransform(centerPulse, (p) => 1 + p * 0.8)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Cleanup mirrors Exercises 1 & 2's own guard exactly: the returned
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

  // The real, frame-accurate driver: recomputes position from real
  // elapsed time every frame (never accumulated), and edge-triggers the
  // center-crossing cue by watching for x's sign to flip — exact and
  // frame-rate independent, since it's derived from the real computed
  // position, not a fixed time schedule.
  useAnimationFrame(() => {
    if (phaseRef.current !== 'active' || startedAtRef.current === null) return
    const elapsed = Math.min(TOTAL_EXERCISE_MS, performance.now() - startedAtRef.current)
    const position = computeLemniscatePosition(elapsed)
    x.set(position.x)
    y.set(position.y)

    const sign = position.x >= 0 ? 1 : -1
    if (sign !== lastXSignRef.current) {
      lastXSignRef.current = sign
      lastCrossingAtMsRef.current = elapsed
      fireCenterCrossingCue()
    }

    const sinceCrossingMs = lastCrossingAtMsRef.current === null ? Number.POSITIVE_INFINITY : elapsed - lastCrossingAtMsRef.current
    centerPulse.set(sinceCrossingMs < CENTER_PULSE_DURATION_MS ? 1 - sinceCrossingMs / CENTER_PULSE_DURATION_MS : 0)
  })

  function initAudio(): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    if (audioContextRef.current) return

    const audioContext = new AudioContext()
    const now = audioContext.currentTime

    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0, now)
    // A gentle "settling in" swell, once, independent of any crossing —
    // the drone should already be present by the time the first crossing
    // (a quarter-loop in) actually happens.
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

  // The crossing's only audible signature: a brief, organic loudness
  // bloom riding on top of the steady drone — never a pitch change. Both
  // legs are scheduled together on the AudioParam's own timeline (no
  // setTimeout involved), an exponential approach in each direction so
  // neither the swell-in nor the settle-out ever clicks.
  function scheduleCenterCrossingSwell(): void {
    const audioContext = audioContextRef.current
    const masterGain = masterGainRef.current
    if (!audioContext || !masterGain) return
    const now = audioContext.currentTime
    masterGain.gain.cancelScheduledValues(now)
    masterGain.gain.setValueAtTime(masterGain.gain.value, now)
    masterGain.gain.setTargetAtTime(SWELL_PEAK_GAIN, now, SWELL_ATTACK_TIME_CONSTANT_S)
    masterGain.gain.setTargetAtTime(RESTING_GAIN, now + SWELL_HOLD_S, SWELL_RELEASE_TIME_CONSTANT_S)
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

  function fireCenterCrossingCue(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_CROSSING_MS)
    scheduleCenterCrossingSwell()
  }

  function handleStart(): void {
    initAudio()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(0)
    lastXSignRef.current = 1
    lastCrossingAtMsRef.current = null
    startedAtRef.current = performance.now()
    x.set(LOOP_A_PX)
    y.set(0)
    centerPulse.set(0)
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

  const displayPosition = computeLemniscatePosition(elapsedMs)
  const remainingSeconds = Math.ceil((TOTAL_EXERCISE_MS - elapsedMs) / 1000)
  const currentLoop = Math.min(TOTAL_LOOPS, displayPosition.loopIndex + 1)

  return (
    <div className={`relative flex ${isEmbedded ? 'h-full' : 'min-h-[100dvh]'} flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center`}>
      {!isEmbedded && <BrandWatermark className="absolute top-4 left-6" />}
      {/* Rich, layered ambient wash — the same indigo/violet/cyan
          treatment as Exercises 1 & 2, for a consistent Brain Gym
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

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Infinity Figure-8 Gliding</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <InfinityIcon className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Follow the Infinite Loop</h2>
          <p className="text-sm text-muted-foreground">
            Let your eyes glide with the dot around the figure-8 — no head movement. A soft tap and tone mark every pass through the center.
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
          <div className="relative" style={{ width: SVG_WIDTH_PX, height: SVG_HEIGHT_PX }}>
            {/* A subtle, elegant guide showing the exact figure-8 track —
                sampled once at module load, never recomputed. */}
            <svg aria-hidden="true" viewBox={`0 0 ${SVG_WIDTH_PX} ${SVG_HEIGHT_PX}`} className="absolute inset-0 size-full">
              <path
                d={LEMNISCATE_PATH_D}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="2 7"
                className="text-violet-500/25 dark:text-violet-300/20"
              />
            </svg>

            {/* The center intersection node — a faint permanent marker
                that blooms brighter for a moment on every real crossing,
                a visual echo of the haptic tap and audio swell. */}
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-2.5 -mt-2.5 size-5 rounded-full border border-cyan-300/50"
                style={{
                  opacity: centerPulseOpacity,
                  scale: centerPulseScale,
                  background: 'radial-gradient(circle, rgba(165,243,252,0.75) 0%, rgba(139,92,246,0.55) 65%, transparent 100%)',
                }}
              />
            </div>

            {/* Trailing ghosts, back-to-front: larger, blurrier, fainter
                the further they lag — a cheap, fully GPU-driven comet
                trail via three useSpring "chasers" of the leader's own
                motion values, never a React re-render. */}
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-[22px] -mt-[22px] size-11 rounded-full opacity-20 blur-md"
                style={{ x: trail3X, y: trail3Y, background: 'radial-gradient(circle, rgba(34,211,238,0.9) 0%, rgba(139,92,246,0.8) 100%)' }}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-5 -mt-5 size-10 rounded-full opacity-35 blur-sm"
                style={{ x: trail2X, y: trail2Y, background: 'radial-gradient(circle, rgba(34,211,238,0.9) 0%, rgba(139,92,246,0.85) 100%)' }}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-[18px] -mt-[18px] size-9 rounded-full opacity-55 blur-[2px]"
                style={{ x: trail1X, y: trail1Y, background: 'radial-gradient(circle, rgba(34,211,238,0.95) 0%, rgba(139,92,246,0.9) 100%)' }}
              />
            </div>

            {/* The leader — a small glass-bright core inside a soft
                bloom, the same premium indigo/violet/cyan depth treatment
                as the rest of the suite. */}
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div className="-ml-4 -mt-4 flex size-8 items-center justify-center rounded-full" style={{ x, y }}>
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
              Loop {currentLoop} of {TOTAL_LOOPS}
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
            <InfinityIcon className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Eyes in Sync</h2>
          <p className="text-sm text-muted-foreground">Your eyes just moved together as one smooth, coordinated pair.</p>
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
