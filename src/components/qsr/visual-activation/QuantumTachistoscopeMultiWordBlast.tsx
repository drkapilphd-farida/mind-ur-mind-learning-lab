'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { ArrowRight, Sparkles, SkipForward } from 'lucide-react'
import type { VisualActivationExerciseProps } from './types'

// Quantum Tachistoscope Multi-Word Blast™ — Exercise 5 of the Visual
// Activation Suite. A center-anchored tachistoscope flashes curated
// 2-4-word chunks at progressively shorter display durations across 4
// rounds, training instant visual capture and chunking without
// subvocalization. Three synchronized channels, matching Exercises 1-4's
// own architecture: a glowing gradient word-flash over a faint fixation
// crosshair (visual), a very light tap exactly when each word burst
// appears — silent otherwise (haptic), and the same static-frequency
// singing-bowl drone as Exercises 1, 3 & 4, here a peaceful, unmodulated
// background presence (audio). Every oscillator's frequency is set once
// via setValueAtTime and never ramped — the same lesson Exercise 1's own
// "siren" bug taught.

type ExercisePhase = 'intro' | 'active' | 'complete'
type HarmonicVoice = { oscillator: OscillatorNode }
type FlashEvent = { text: string; displayMs: number; startMs: number; round: number }
type RoundConfig = { displayMs: number; minWords: number; maxWords: number }

// A curated bank of real, short phrases (2-4 words) — never lorem ipsum.
// Filtered by word count per round below, so each round only draws from
// chunks sized appropriately for its own display speed.
const WORD_CHUNKS: readonly string[] = [
  'read faster',
  'stay calm',
  'focus expands',
  'mind opens',
  'eyes relax',
  'vision sharpens',
  'words flow',
  'attention holds',
  'clarity grows',
  'flow deepens',
  'the quiet mind',
  'read without sound',
  'capture whole words',
  'eyes move smoothly',
  'focus stays steady',
  'widen your gaze',
  'trust your eyes',
  'speed builds calm',
  'notice every word',
  'silence inner speech',
  'read without saying words',
  'let your eyes lead',
  'words arrive all together',
  'train your visual span',
  'calm mind reads faster',
  'trust the whole picture',
  'silent reading feels natural',
  'your eyes already know',
  'chunk words into meaning',
  'practice builds real speed',
]

const FLASHES_PER_ROUND = 5
// A fixed, "controlled" blank gap between flashes — never a continuous
// crossfade — so each burst reads as a distinct, discrete capture.
const GAP_MS = 550
const LEAD_IN_MS = 900 // a settling moment before the very first flash
const ROUND_TRANSITION_GAP_MS = 700 // a brief pause between rounds

// Display duration steps DOWN each round (900→650→450→300ms) — true
// tachistoscope progression. Word-chunk length steps down alongside it:
// slower rounds get richer 3-4-word chunks, the fastest round only ever
// asks for a lean 2-word chunk, so the challenge scales in difficulty
// without ever becoming unreadable.
const ROUND_CONFIGS: readonly RoundConfig[] = [
  { displayMs: 900, minWords: 3, maxWords: 4 },
  { displayMs: 650, minWords: 3, maxWords: 4 },
  { displayMs: 450, minWords: 2, maxWords: 3 },
  { displayMs: 300, minWords: 2, maxWords: 2 },
]

// Cheap enough for label/round-counter React state (~5 renders/sec) — the
// actual flash opacity and the haptic/audio triggering never touch this;
// both are driven off a real-elapsed-time rAF loop below for
// frame-accurate precision instead.
const PHASE_TICK_MS = 200

// A very light tap — silent everywhere except the instant a word burst
// appears.
const HAPTIC_FLASH_MS = 12

// A single fixed grounding fundamental (A3), the same root note
// Exercises 1, 3 & 4 already settled on — every harmonic layer below is
// set once at start and NEVER re-pitched.
const FUNDAMENTAL_HZ = 220
const RESTING_GAIN = 0.03 // a peaceful, unmodulated background presence
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 1.0
const RELEASE_TIME_CONSTANT_S = 0.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
const LOWPASS_CUTOFF_HZ = 2_600
const REVERB_WET_LEVEL = 0.3
const REVERB_DURATION_S = 2.0
const REVERB_DECAY = 2.8

// The same singing-bowl-style partial stack as Exercises 1, 3 & 4's own
// drones — fundamental, a few-cents-sharp unison for warm natural
// beating, and two falling-gain upper partials — a consistent sonic
// identity across the whole suite.
const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

function wordCount(chunk: string): number {
  return chunk.trim().split(/\s+/).length
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
// both the rAF loop (audio/haptics/motion/text) and the cheap display
// tick can independently derive "what's happening at elapsed time X"
// from the exact same source of truth.
function buildFlashSchedule(seed: number): { events: readonly FlashEvent[]; totalMs: number } {
  const random = mulberry32(seed)
  const events: FlashEvent[] = []
  let cursorMs = LEAD_IN_MS
  ROUND_CONFIGS.forEach(({ displayMs, minWords, maxWords }, round) => {
    const pool = WORD_CHUNKS.filter((chunk) => {
      const count = wordCount(chunk)
      return count >= minWords && count <= maxWords
    })
    const order = shuffle(pool, random).slice(0, FLASHES_PER_ROUND)
    for (const text of order) {
      events.push({ text, displayMs, startMs: cursorMs, round })
      cursorMs += displayMs + GAP_MS
    }
    if (round < ROUND_CONFIGS.length - 1) cursorMs += ROUND_TRANSITION_GAP_MS
  })
  return { events, totalMs: cursorMs }
}

// Timing is fully deterministic regardless of which words get picked, so
// this can be derived once at module load from a fixed dummy seed —
// guaranteed to always agree with the real per-run schedule's own timing,
// since it's literally the same builder function.
const TOTAL_EXERCISE_MS = buildFlashSchedule(0).totalMs

function computeActiveFlash(elapsedMs: number, schedule: readonly FlashEvent[]): { event: FlashEvent; progress: number } | null {
  for (const event of schedule) {
    if (elapsedMs >= event.startMs && elapsedMs < event.startMs + event.displayMs) {
      return { event, progress: (elapsedMs - event.startMs) / event.displayMs }
    }
  }
  return null
}

// Fast fade-in, a brief hold near full brightness, then a slightly
// slower fade-out — never an abrupt on/off cut, even at the fastest
// round's 300ms window.
function flashEnvelope(progress: number): number {
  if (progress < 0.25) return progress / 0.25
  if (progress < 0.65) return 1
  return Math.max(0, 1 - (progress - 0.65) / 0.35)
}

// Round/step timing is schedule-independent arithmetic (only WHICH words
// get picked is randomized, never when) — so this can run straight off
// elapsed time, the same technique Exercise 4's own round tracking uses.
function computeRoundProgress(elapsedMs: number): { round: number; stepIndex: number } {
  let cursor = LEAD_IN_MS
  for (let round = 0; round < ROUND_CONFIGS.length; round++) {
    const config = ROUND_CONFIGS[round]
    if (!config) break
    const period = config.displayMs + GAP_MS
    const roundEnd = cursor + FLASHES_PER_ROUND * period
    if (elapsedMs < roundEnd) {
      const withinRound = Math.max(0, elapsedMs - cursor)
      const stepIndex = Math.min(FLASHES_PER_ROUND, Math.floor(withinRound / period) + 1)
      return { round, stepIndex }
    }
    cursor = roundEnd + ROUND_TRANSITION_GAP_MS
  }
  return { round: ROUND_CONFIGS.length - 1, stepIndex: FLASHES_PER_ROUND }
}

// A short, softly-decaying stereo noise tail — the cheapest way to get a
// real convolution-reverb "bloom" without shipping an audio sample.
// Regenerated once per AudioContext, since a ConvolverNode's buffer can't
// be reused across contexts. Identical technique to Exercises 1, 3 & 4.
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

export function QuantumTachistoscopeMultiWordBlast({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [activeText, setActiveText] = useState<string | null>(null)

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const scheduleRef = useRef<readonly FlashEvent[]>([])
  const lastActiveStartMsRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  // The word-flash's own opacity/scale — driven every animation frame
  // from real elapsed time, never React state, so the fade stays a true
  // 60fps regardless of what the cheap display tick below is doing. Only
  // the TEXT content itself needs a real re-render, and only exactly
  // once per flash (see the rAF loop below), never per-frame.
  const flashOpacity = useMotionValue(0)
  const flashScale = useMotionValue(0.9)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Cleanup mirrors Exercises 1-4's own guard exactly: the returned
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
  // from real elapsed time every frame, and edge-triggers the haptic +
  // the word-text update exactly once per flash by comparing against the
  // last-fired event's own start time — never a per-frame React update.
  useAnimationFrame(() => {
    if (phaseRef.current !== 'active' || startedAtRef.current === null) return
    const elapsed = Math.min(TOTAL_EXERCISE_MS, performance.now() - startedAtRef.current)
    const active = computeActiveFlash(elapsed, scheduleRef.current)

    if (active === null) {
      flashOpacity.set(0)
      if (lastActiveStartMsRef.current !== null) {
        lastActiveStartMsRef.current = null
        setActiveText(null)
      }
      return
    }

    if (active.event.startMs !== lastActiveStartMsRef.current) {
      lastActiveStartMsRef.current = active.event.startMs
      setActiveText(active.event.text)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_FLASH_MS)
    }

    const envelope = flashEnvelope(active.progress)
    flashOpacity.set(envelope)
    flashScale.set(0.9 + envelope * 0.1)
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
    scheduleRef.current = buildFlashSchedule(Date.now()).events
    lastActiveStartMsRef.current = null
    startedAtRef.current = performance.now()
    flashOpacity.set(0)
    setActiveText(null)
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
  const { round, stepIndex } = computeRoundProgress(elapsedMs)
  const currentRound = round + 1

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
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

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Quantum Tachistoscope Multi-Word Blast</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Sparkles className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Capture Words at a Glance</h2>
          <p className="text-sm text-muted-foreground">
            Word bursts will flash at the center, getting faster each round. Just take them in — no need to say them in your head. A light tap
            marks every burst.
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
          <div className="relative flex min-h-[140px] w-full max-w-md items-center justify-center px-4">
            {/* A faint fixation crosshair — center-anchored, always
                present, never distracting. */}
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-violet-400/25 dark:bg-violet-300/20" />
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-violet-400/25 dark:bg-violet-300/20" />

            <motion.div style={{ opacity: flashOpacity, scale: flashScale }} className="relative text-balance">
              {activeText !== null && (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text font-heading text-2xl font-bold text-transparent blur-xl sm:text-3xl"
                  >
                    {activeText}
                  </span>
                  <span className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text font-heading text-2xl font-bold text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-cyan-200 sm:text-3xl">
                    {activeText}
                  </span>
                </>
              )}
            </motion.div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="font-heading text-lg font-semibold text-foreground">
              Round {currentRound} of {ROUND_CONFIGS.length}
            </span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: FLASHES_PER_ROUND }, (_, index) => (
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
            <Sparkles className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Instant Recognition</h2>
          <p className="text-sm text-muted-foreground">Your eyes just captured whole chunks of words in a single glance.</p>
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
