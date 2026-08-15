'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { ArrowRight, Diamond, Hexagon, type LucideIcon, SkipForward, Square, Star, Timer, Triangle } from 'lucide-react'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import type { VisualActivationExerciseProps } from './types'

// Blink-Trigger Micro-Recall™ — Exercise 7 (the final exercise) of the
// Visual Activation Suite. A central fixation anchor sits under a rapid
// trial sequence: a few quiet distractor shapes flash by, then ONE
// target shape flashes for a genuine blink-length instant — the
// "trigger" to catch — followed by a blank hold (recall it from
// memory), then the same shape echoes back as a soft ghost outline to
// confirm the recall. The target's own on-screen duration shortens each
// round, sharpening rapid visual-to-memory transfer. Three synchronized
// channels, matching Exercises 1-6's own architecture: three visually
// distinct cue styles — muted distractors, a vivid glowing target, a
// ghost-outline echo — over a calm fixation dot (visual), a very light
// tap exactly on the target and its echo — silent for distractors
// (haptic), and the same static-frequency singing-bowl drone as
// Exercises 1, 3, 4, 5 & 6, here a peaceful, unmodulated background
// presence (audio). Every oscillator's frequency is set once via
// setValueAtTime and never ramped — the same lesson Exercise 1's own
// "siren" bug taught.

type ExercisePhase = 'intro' | 'active' | 'complete'
type HarmonicVoice = { oscillator: OscillatorNode }
type CueKind = 'distractor' | 'target' | 'echo'
// Deliberately no 'circle' — the fixation anchor itself is a small
// circle, so a circular target/echo would be visually ambiguous against
// it. Every shape here reads as unmistakably distinct from the anchor.
type ShapeId = 'square' | 'triangle' | 'diamond' | 'star' | 'hexagon'
type CueEvent = { kind: CueKind; shape: ShapeId; durationMs: number; startMs: number; round: number; trial: number }
type RoundConfig = { targetOnMs: number }

const SHAPES: readonly ShapeId[] = ['square', 'triangle', 'diamond', 'star', 'hexagon']
const SHAPE_ICONS: Record<ShapeId, LucideIcon> = {
  square: Square,
  triangle: Triangle,
  diamond: Diamond,
  star: Star,
  hexagon: Hexagon,
}

const DISTRACTOR_COUNT = 3
const DISTRACTOR_ON_MS = 200
const DISTRACTOR_GAP_MS = 120
const RECALL_GAP_MS = 550 // the blank "hold it in memory" beat between target and echo
const ECHO_ON_MS = 280
const INTER_TRIAL_GAP_MS = 450
const TRIALS_PER_ROUND = 3
const LEAD_IN_MS = 900 // a settling moment before the very first trial
const ROUND_TRANSITION_GAP_MS = 700 // a brief pause between rounds

// The target's own on-screen duration steps DOWN each round
// (220→170→130→100ms) — true blink-length progression. The
// distractor/echo timings stay fixed; only the "trigger" itself gets
// harder to catch.
const ROUND_CONFIGS: readonly RoundConfig[] = [{ targetOnMs: 220 }, { targetOnMs: 170 }, { targetOnMs: 130 }, { targetOnMs: 100 }]

// Cheap enough for label/round-counter React state (~5 renders/sec) — the
// actual cue opacity and the haptic/audio triggering never touch this;
// both are driven off a real-elapsed-time rAF loop below for
// frame-accurate precision instead.
const PHASE_TICK_MS = 200

// A very light tap on the trigger and its recall echo — silent for
// every distractor in between.
const HAPTIC_TARGET_MS = 16
const HAPTIC_ECHO_MS = 10

const CUE_LABEL: Record<CueKind, string> = { distractor: 'Watch…', target: 'Catch it!', echo: 'Recall' }

// A single fixed grounding fundamental (A3), the same root note
// Exercises 1, 3, 4, 5 & 6 already settled on — every harmonic layer
// below is set once at start and NEVER re-pitched.
const FUNDAMENTAL_HZ = 220
const RESTING_GAIN = 0.03 // a peaceful, unmodulated background presence
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 1.0
const RELEASE_TIME_CONSTANT_S = 0.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
const LOWPASS_CUTOFF_HZ = 2_600
const REVERB_WET_LEVEL = 0.3
const REVERB_DURATION_S = 2.0
const REVERB_DECAY = 2.8

// The same singing-bowl-style partial stack as Exercises 1, 3, 4, 5 & 6's
// own drones — fundamental, a few-cents-sharp unison for warm natural
// beating, and two falling-gain upper partials — a consistent sonic
// identity across the whole suite.
const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

// A tiny, dependency-free seeded PRNG (mulberry32) — just enough
// determinism that one exercise run has one fixed, reproducible cue
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

// The full cue timeline for one run — deterministic once built, so both
// the rAF loop (audio/haptics/motion/shape) and the cheap display tick
// can independently derive "what's happening at elapsed time X" from
// the exact same source of truth. Each trial: a shuffled set of
// distractor shapes, then the target, then — after the blank
// RECALL_GAP_MS hold — that same target shape again as the echo.
function buildCueSchedule(seed: number): { events: readonly CueEvent[]; totalMs: number } {
  const random = mulberry32(seed)
  const events: CueEvent[] = []
  let cursorMs = LEAD_IN_MS
  ROUND_CONFIGS.forEach(({ targetOnMs }, round) => {
    for (let trial = 0; trial < TRIALS_PER_ROUND; trial++) {
      const shuffled = shuffle(SHAPES, random)
      const targetShape = shuffled[0] ?? 'square'
      const distractorShapes = shuffled.slice(1, 1 + DISTRACTOR_COUNT)

      for (const shape of distractorShapes) {
        events.push({ kind: 'distractor', shape, durationMs: DISTRACTOR_ON_MS, startMs: cursorMs, round, trial })
        cursorMs += DISTRACTOR_ON_MS + DISTRACTOR_GAP_MS
      }

      events.push({ kind: 'target', shape: targetShape, durationMs: targetOnMs, startMs: cursorMs, round, trial })
      cursorMs += targetOnMs + RECALL_GAP_MS

      events.push({ kind: 'echo', shape: targetShape, durationMs: ECHO_ON_MS, startMs: cursorMs, round, trial })
      cursorMs += ECHO_ON_MS + INTER_TRIAL_GAP_MS
    }
    if (round < ROUND_CONFIGS.length - 1) cursorMs += ROUND_TRANSITION_GAP_MS
  })
  return { events, totalMs: cursorMs }
}

// Timing is fully deterministic regardless of which shapes get picked,
// so this can be derived once at module load from a fixed dummy seed —
// guaranteed to always agree with the real per-run schedule's own
// timing, since it's literally the same builder function.
const TOTAL_EXERCISE_MS = buildCueSchedule(0).totalMs

function computeActiveCue(elapsedMs: number, schedule: readonly CueEvent[]): { event: CueEvent; progress: number } | null {
  for (const event of schedule) {
    if (elapsedMs >= event.startMs && elapsedMs < event.startMs + event.durationMs) {
      return { event, progress: (elapsedMs - event.startMs) / event.durationMs }
    }
  }
  return null
}

// Fast fade-in, a brief hold near full brightness, then a slightly
// slower fade-out — never an abrupt on/off cut, even at the fastest
// round's 100ms target window.
function flashEnvelope(progress: number): number {
  if (progress < 0.25) return progress / 0.25
  if (progress < 0.65) return 1
  return Math.max(0, 1 - (progress - 0.65) / 0.35)
}

// Round/trial timing is schedule-independent arithmetic (only WHICH
// shapes get picked is randomized, never when) — so this can run
// straight off elapsed time, the same technique Exercises 5 & 6's own
// round tracking uses.
function computeRoundProgress(elapsedMs: number): { round: number; trial: number } {
  let cursor = LEAD_IN_MS
  for (let round = 0; round < ROUND_CONFIGS.length; round++) {
    const config = ROUND_CONFIGS[round]
    if (!config) break
    const trialMs = DISTRACTOR_COUNT * (DISTRACTOR_ON_MS + DISTRACTOR_GAP_MS) + config.targetOnMs + RECALL_GAP_MS + ECHO_ON_MS + INTER_TRIAL_GAP_MS
    const roundEnd = cursor + TRIALS_PER_ROUND * trialMs
    if (elapsedMs < roundEnd) {
      const withinRound = Math.max(0, elapsedMs - cursor)
      const trial = Math.min(TRIALS_PER_ROUND - 1, Math.floor(withinRound / trialMs))
      return { round, trial }
    }
    cursor = roundEnd + ROUND_TRANSITION_GAP_MS
  }
  return { round: ROUND_CONFIGS.length - 1, trial: TRIALS_PER_ROUND - 1 }
}

// A short, softly-decaying stereo noise tail — the cheapest way to get a
// real convolution-reverb "bloom" without shipping an audio sample.
// Regenerated once per AudioContext, since a ConvolverNode's buffer
// can't be reused across contexts. Identical technique to Exercises 1,
// 3, 4, 5 & 6.
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

export function BlinkTriggerMicroRecall({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [activeShape, setActiveShape] = useState<ShapeId | null>(null)
  const [activeCueKind, setActiveCueKind] = useState<CueKind | null>(null)
  const [displayLabel, setDisplayLabel] = useState('')

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const scheduleRef = useRef<readonly CueEvent[]>([])
  const lastActiveStartMsRef = useRef<number | null>(null)
  // Tracks the most recently fired cue's own kind, even after it ends —
  // separate from `activeCueKind` (which nulls out the moment the cue's
  // own visible window closes) — this is what lets the label show
  // "Hold…" specifically during the blank gap right after a target,
  // and nothing but blank after any other cue's own gap.
  const lastFiredKindRef = useRef<CueKind | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  // The cue's own opacity/scale — driven every animation frame from real
  // elapsed time, never React state, so the fade stays a true 60fps
  // regardless of what the cheap display tick below is doing. Only the
  // SHAPE identity itself needs a real re-render, and only exactly once
  // per cue (see the rAF loop below), never per-frame.
  const cueOpacity = useMotionValue(0)
  const cueScale = useMotionValue(0.85)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Cleanup mirrors Exercises 1-6's own guard exactly: the returned
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

  // The real, frame-accurate driver: recomputes the active cue (if any)
  // from real elapsed time every frame, and edge-triggers the shape
  // update + haptic exactly once per cue by comparing against the
  // last-fired cue's own start time. Distractors update the shape and
  // stay silent; only the target and its echo fire a haptic.
  useAnimationFrame(() => {
    if (phaseRef.current !== 'active' || startedAtRef.current === null) return
    const elapsed = Math.min(TOTAL_EXERCISE_MS, performance.now() - startedAtRef.current)
    const active = computeActiveCue(elapsed, scheduleRef.current)

    if (active === null) {
      cueOpacity.set(0)
      if (lastActiveStartMsRef.current !== null) {
        lastActiveStartMsRef.current = null
        setActiveShape(null)
        setActiveCueKind(null)
        setDisplayLabel(lastFiredKindRef.current === 'target' ? 'Hold…' : '')
      }
      return
    }

    if (active.event.startMs !== lastActiveStartMsRef.current) {
      lastActiveStartMsRef.current = active.event.startMs
      lastFiredKindRef.current = active.event.kind
      setActiveShape(active.event.shape)
      setActiveCueKind(active.event.kind)
      setDisplayLabel(CUE_LABEL[active.event.kind])
      if (active.event.kind === 'target') {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_TARGET_MS)
      } else if (active.event.kind === 'echo') {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_ECHO_MS)
      }
    }

    const envelope = flashEnvelope(active.progress)
    cueOpacity.set(envelope)
    cueScale.set(0.85 + envelope * 0.25)
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
    scheduleRef.current = buildCueSchedule(Date.now()).events
    lastActiveStartMsRef.current = null
    lastFiredKindRef.current = null
    startedAtRef.current = performance.now()
    cueOpacity.set(0)
    setActiveShape(null)
    setActiveCueKind(null)
    setDisplayLabel('')
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
  const { round, trial } = computeRoundProgress(elapsedMs)
  const currentRound = round + 1
  const stepIndex = trial + 1
  const ActiveShapeIcon = activeShape !== null ? SHAPE_ICONS[activeShape] : null

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

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Blink-Trigger Micro-Recall</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Timer className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Catch the Trigger</h2>
          <p className="text-sm text-muted-foreground">
            A few quiet shapes will pass by, then one bright shape flashes for a blink — catch it, hold it in mind, then its ghost echoes back to
            confirm. Gets faster each round. A light tap marks the trigger and its echo.
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
          <div className="relative flex min-h-[120px] w-full max-w-xs items-center justify-center">
            {/* The central fixation anchor — a calm, slow-breathing glow
                the gaze stays locked on the whole time, sitting right
                where every cue appears. A simple, declarative infinite
                loop is all this needs; it never moves, so it doesn't
                touch the rAF-driven motion values below. */}
            <motion.div
              aria-hidden="true"
              className="absolute flex size-5 items-center justify-center rounded-full"
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.9, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-[-8px] rounded-full blur-md"
                style={{ background: 'radial-gradient(circle, rgba(165,243,252,0.7) 0%, rgba(139,92,246,0.5) 60%, transparent 100%)' }}
              />
              <div
                aria-hidden="true"
                className="relative size-full rounded-full border border-white/60"
                style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(34,211,238,0.9) 45%, rgba(79,70,229,0.9) 100%)' }}
              />
            </motion.div>

            {/* The active cue — three distinct visual registers so the
                trigger always reads as unmistakably different from the
                noise around it: muted/small for a distractor, a vivid
                glowing glass icon for the target, a soft ghost outline
                for its recall echo. */}
            <motion.div style={{ opacity: cueOpacity, scale: cueScale }} className="relative flex items-center justify-center">
              {ActiveShapeIcon !== null && activeCueKind === 'distractor' && <ActiveShapeIcon className="size-7 text-muted-foreground/50" aria-hidden="true" />}
              {ActiveShapeIcon !== null && activeCueKind === 'target' && (
                <>
                  <ActiveShapeIcon aria-hidden="true" className="absolute inset-0 size-12 text-violet-400 opacity-80 blur-lg" />
                  <ActiveShapeIcon aria-hidden="true" className="relative size-12 text-violet-600 drop-shadow-[0_0_10px_rgba(139,92,246,0.7)] dark:text-violet-300" />
                </>
              )}
              {ActiveShapeIcon !== null && activeCueKind === 'echo' && (
                <ActiveShapeIcon aria-hidden="true" strokeWidth={1.5} className="size-10 text-cyan-500/70 dark:text-cyan-300/70" />
              )}
            </motion.div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="font-heading text-lg font-semibold text-foreground">{displayLabel || ' '}</span>
            <span className="text-sm font-medium text-muted-foreground">
              Round {currentRound} of {ROUND_CONFIGS.length}
            </span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: TRIALS_PER_ROUND }, (_, index) => (
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
            <Timer className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Reflexes Sharpened</h2>
          <p className="text-sm text-muted-foreground">Your eyes just caught, held, and recalled — faster each round.</p>
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
