'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion'
import { ArrowRight, EyeOff, SkipForward } from 'lucide-react'
import type { VisualActivationExerciseProps } from './types'

// Aura Edge Color Pulsing™ — Exercise 6 of the Visual Activation Suite.
// A serene central anchor holds the gaze while soft chromatic auras
// breathe rhythmically along all 4 screen edges — trained entirely
// through side vision, never by looking at them directly. Four rounds
// step the breathing rate progressively faster (2800→2100→1500→1000ms
// per pulse). Three synchronized channels, matching Exercises 1-5's own
// architecture: a calm fixation dot plus synchronized edge auras
// pulsing in the suite's indigo/violet/cyan palette (visual), a very
// light tap exactly at each pulse's peak — silent otherwise (haptic),
// and the same static-frequency singing-bowl drone as Exercises 1, 3, 4
// & 5, here a peaceful, unmodulated background presence (audio). Every
// oscillator's frequency is set once via setValueAtTime and never
// ramped — the same lesson Exercise 1's own "siren" bug taught.

type ExercisePhase = 'intro' | 'active' | 'complete'
type HarmonicVoice = { oscillator: OscillatorNode }
type RoundConfig = { periodMs: number }

const PULSES_PER_ROUND = 4
const LEAD_IN_MS = 900 // a settling moment before the very first pulse
const ROUND_TRANSITION_GAP_MS = 700 // a brief pause between rounds

// The breathing rate steps DOWN each round (2800→2100→1500→1000ms per
// full pulse) — a progressive frequency shift, always still a smooth
// breathing curve, never an abrupt jump.
const ROUND_CONFIGS: readonly RoundConfig[] = [{ periodMs: 2_800 }, { periodMs: 2_100 }, { periodMs: 1_500 }, { periodMs: 1_000 }]

const TOTAL_EXERCISE_MS = LEAD_IN_MS + ROUND_CONFIGS.reduce((sum, cfg) => sum + PULSES_PER_ROUND * cfg.periodMs, 0) + ROUND_TRANSITION_GAP_MS * (ROUND_CONFIGS.length - 1)

// Cheap enough for label/round-counter React state (~5 renders/sec) — the
// actual aura intensity and the haptic/audio triggering never touch
// this; both are driven off a real-elapsed-time rAF loop below for
// frame-accurate precision instead.
const PHASE_TICK_MS = 200

// A very light tap — silent everywhere except each pulse's own peak.
const HAPTIC_PEAK_MS = 12

// A single fixed grounding fundamental (A3), the same root note
// Exercises 1, 3, 4 & 5 already settled on — every harmonic layer below
// is set once at start and NEVER re-pitched.
const FUNDAMENTAL_HZ = 220
const RESTING_GAIN = 0.03 // a peaceful, unmodulated background presence
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 1.0
const RELEASE_TIME_CONSTANT_S = 0.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
const LOWPASS_CUTOFF_HZ = 2_600
const REVERB_WET_LEVEL = 0.3
const REVERB_DURATION_S = 2.0
const REVERB_DECAY = 2.8

// The same singing-bowl-style partial stack as Exercises 1, 3, 4 & 5's
// own drones — fundamental, a few-cents-sharp unison for warm natural
// beating, and two falling-gain upper partials — a consistent sonic
// identity across the whole suite.
const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

// Breathing rate/round tracking is deterministic, schedule-free
// arithmetic — a smooth sine rise-and-fall within each round's own
// period, the same "pure function of elapsed time" technique every
// exercise in this suite already uses for its visuals.
function computePulseState(elapsedMs: number): { round: number; intensity: number; cycleIndex: number; cyclePhase: number } {
  let cursor = LEAD_IN_MS
  for (let round = 0; round < ROUND_CONFIGS.length; round++) {
    const config = ROUND_CONFIGS[round]
    if (!config) break
    const roundDurationMs = PULSES_PER_ROUND * config.periodMs
    const roundEnd = cursor + roundDurationMs
    if (elapsedMs < roundEnd) {
      const withinRound = Math.max(0, elapsedMs - cursor)
      const cycleIndex = Math.min(PULSES_PER_ROUND - 1, Math.floor(withinRound / config.periodMs))
      const cyclePhase = Math.min(1, Math.max(0, (withinRound - cycleIndex * config.periodMs) / config.periodMs))
      return { round, intensity: Math.sin(Math.PI * cyclePhase), cycleIndex, cyclePhase }
    }
    cursor = roundEnd + ROUND_TRANSITION_GAP_MS
  }
  return { round: ROUND_CONFIGS.length - 1, intensity: 0, cycleIndex: PULSES_PER_ROUND - 1, cyclePhase: 1 }
}

// A short, softly-decaying stereo noise tail — the cheapest way to get a
// real convolution-reverb "bloom" without shipping an audio sample.
// Regenerated once per AudioContext, since a ConvolverNode's buffer can't
// be reused across contexts. Identical technique to Exercises 1, 3, 4 & 5.
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

export function AuraEdgeColorPulsing({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const lastPeakKeyRef = useRef<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  // The aura's shared breathing intensity (0..1) — driven every
  // animation frame from real elapsed time, never React state, so the
  // pulse stays a true 60fps regardless of what the cheap display tick
  // below is doing. All 4 edges derive their own opacity/scale from this
  // single value, so they always breathe perfectly in sync.
  const pulseIntensity = useMotionValue(0)
  const edgeOpacity = useTransform(pulseIntensity, (v) => 0.16 + v * 0.56)
  const edgeScale = useTransform(pulseIntensity, (v) => 1 + v * 0.32)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Cleanup mirrors Exercises 1-5's own guard exactly: the returned
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

  // The real, frame-accurate driver: recomputes breathing intensity from
  // real elapsed time every frame, and edge-triggers the haptic exactly
  // once per pulse by firing the instant its own cycle first reaches its
  // peak (cyclePhase >= 0.5), keyed by round+cycleIndex so it can never
  // double-fire within the same pulse.
  useAnimationFrame(() => {
    if (phaseRef.current !== 'active' || startedAtRef.current === null) return
    const elapsed = Math.min(TOTAL_EXERCISE_MS, performance.now() - startedAtRef.current)
    const { round, intensity, cycleIndex, cyclePhase } = computePulseState(elapsed)
    pulseIntensity.set(intensity)

    const key = `${round}:${cycleIndex}`
    if (cyclePhase >= 0.5 && lastPeakKeyRef.current !== key) {
      lastPeakKeyRef.current = key
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_PEAK_MS)
    }
  })

  function initAudio(): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    if (audioContextRef.current) return

    const audioContext = new AudioContext()
    const now = audioContext.currentTime

    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0, now)
    // A single, gentle settling-in swell — and nothing else ever touches
    // this gain again until teardown. A peaceful, unmodulated presence.
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
    lastPeakKeyRef.current = null
    startedAtRef.current = performance.now()
    pulseIntensity.set(0)
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
  const { round, cycleIndex } = computePulseState(elapsedMs)
  const currentRound = round + 1
  const stepIndex = cycleIndex + 1

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
      {/* Rich, layered ambient wash — the same indigo/violet/cyan
          treatment as the rest of the suite, for a consistent Brain Gym
          identity across every phase. */}
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

      {/* The 4 edge auras — only present during the exercise itself,
          each with its own chromatic personality from the same palette,
          all breathing perfectly in sync off one shared intensity. */}
      {phase === 'active' && (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <motion.div
            className="absolute inset-x-0 top-0 h-28 blur-xl sm:h-36"
            style={{
              opacity: edgeOpacity,
              scaleY: edgeScale,
              transformOrigin: 'top',
              background: 'linear-gradient(to bottom, rgba(34,211,238,0.6) 0%, rgba(139,92,246,0.28) 55%, transparent 100%)',
            }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-28 blur-xl sm:h-36"
            style={{
              opacity: edgeOpacity,
              scaleY: edgeScale,
              transformOrigin: 'bottom',
              background: 'linear-gradient(to top, rgba(99,102,241,0.6) 0%, rgba(67,56,202,0.28) 55%, transparent 100%)',
            }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 w-28 blur-xl sm:w-36"
            style={{
              opacity: edgeOpacity,
              scaleX: edgeScale,
              transformOrigin: 'left',
              background: 'linear-gradient(to right, rgba(103,232,249,0.55) 0%, rgba(139,92,246,0.26) 55%, transparent 100%)',
            }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-28 blur-xl sm:w-36"
            style={{
              opacity: edgeOpacity,
              scaleX: edgeScale,
              transformOrigin: 'right',
              background: 'linear-gradient(to left, rgba(139,92,246,0.6) 0%, rgba(99,102,241,0.26) 55%, transparent 100%)',
            }}
          />
        </div>
      )}

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Aura Edge Color Pulsing</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <EyeOff className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Awaken Your Side Vision</h2>
          <p className="text-sm text-muted-foreground">
            Keep your gaze on the center dot. Color auras will breathe softly along the edges of your screen, getting faster each round — never
            look at them directly, just sense them. A light tap marks every peak.
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

      {phase === 'active' && (
        <div className="flex flex-col items-center gap-8">
          {/* The central fixation anchor — a calm, slow-breathing glow
              the gaze stays locked on the whole time. A simple,
              declarative infinite loop is all this needs; it never
              moves, so it doesn't touch the rAF-driven motion values
              above. */}
          <div className="relative flex size-6 items-center justify-center">
            <motion.div
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full"
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

          <div className="flex flex-col items-center gap-3">
            <span className="font-heading text-lg font-semibold text-foreground">
              Round {currentRound} of {ROUND_CONFIGS.length}
            </span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: PULSES_PER_ROUND }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < stepIndex - 1
                      ? 'size-1.5 rounded-full bg-violet-500'
                      : index === stepIndex - 1
                        ? 'size-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_1px_rgba(34,211,238,0.8)]'
                        : 'size-1.5 rounded-full bg-muted-foreground/25'
                  }
                />
              ))}
            </div>
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
            <EyeOff className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Aura Awareness</h2>
          <p className="text-sm text-muted-foreground">Your side vision just picked up color and motion without your eyes ever moving.</p>
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
