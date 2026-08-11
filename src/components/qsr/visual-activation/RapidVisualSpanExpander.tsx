'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { ArrowRight, ScanEye, SkipForward } from 'lucide-react'
import type { VisualActivationExerciseProps } from './types'

// Rapid Visual Span Expander™ — Exercise 10 of the Visual Activation
// Suite. Relocated here from the Reading Hub with a full 10/10 visual/
// audio upgrade (the original engine at
// src/features/rapid-visual-span-expander/ is untouched — it's still
// what powers the Unified Session's Pro rotation; this is a fresh,
// Brain-Gym-native rebuild of the same real drill, not a copy of that
// code). A single fixation anchor holds the gaze while word/number
// tokens flash one at a time at wide, randomized peripheral positions —
// never look directly at them, just notice them — across 4 rounds that
// get progressively faster. Three synchronized channels, matching
// Exercises 1-9's own architecture: floating, glow-shadowed typography
// over a gradient progress bar with seamless round transitions
// (visual), a very light tap exactly when each token appears (haptic),
// and the same static-frequency singing-bowl drone as Exercises 1, 3-9,
// paired with a soft one-shot tick on every flash (audio). Every
// oscillator's frequency is set once via setValueAtTime and never
// ramped — the same lesson Exercise 1's own "siren" bug taught.

type ExercisePhase = 'intro' | 'active' | 'complete'
type HarmonicVoice = { oscillator: OscillatorNode }
type Position = { x: number; y: number }
type FlashEvent = { token: string; position: Position; displayMs: number; startMs: number; round: number }
type RoundConfig = { displayMs: number }

// A curated word bank (own-copy, never lorem ipsum) mixed with generated
// 2-3-digit numbers at runtime — the same "real words + real numbers"
// mix the original drill established, freshly written for Brain Gym.
const WORD_TOKENS: readonly string[] = [
  'focus',
  'clarity',
  'notice',
  'expand',
  'steady',
  'presence',
  'anchor',
  'widen',
  'calm',
  'sharp',
  'aware',
  'quick',
  'span',
  'reach',
  'glance',
  'catch',
]

const TOKENS_PER_ROUND = 6
const GAP_MS = 380
const LEAD_IN_MS = 900
const ROUND_TRANSITION_MS = 1_600

// A fixed-pixel flash field (matching every other exercise's arena
// approach) rather than percentage-of-container positioning — simpler,
// and lets the flash's position drive real px motion values directly.
const FIELD_WIDTH_PX = 320
const FIELD_HEIGHT_PX = 200
const MAX_OFFSET_X_PX = 130
const MAX_OFFSET_Y_PX = 78
const CENTER_DEAD_ZONE_PX = 46

// Display duration steps DOWN each round (500→400→300→220ms) — the
// spread widens too (see generateWidePosition's own per-round call),
// so both timing AND peripheral reach get progressively harder.
const ROUND_CONFIGS: readonly RoundConfig[] = [{ displayMs: 500 }, { displayMs: 400 }, { displayMs: 300 }, { displayMs: 220 }]

const PHASE_TICK_MS = 200
const HAPTIC_FLASH_MS = 10

// A single soft, consistent tick — deliberately not a musical run like
// Schulte Grid's (this exercise flashes far more rapidly; a rising scale
// at this pace would turn into noise), just a light, satisfying pulse
// marking each appearance.
const TICK_HZ = 660 // E5
const TICK_ATTACK_S = 0.012
const TICK_DECAY_S = 0.22
const TICK_PEAK_GAIN = 0.07

const FUNDAMENTAL_HZ = 220
const RESTING_GAIN = 0.028
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 1.0
const RELEASE_TIME_CONSTANT_S = 0.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
const LOWPASS_CUTOFF_HZ = 2_600
const REVERB_WET_LEVEL = 0.3
const REVERB_DURATION_S = 2.0
const REVERB_DECAY = 2.8

const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

function generateNumberToken(): string {
  return String(Math.floor(Math.random() * 900) + 10)
}

function generateWidePosition(): Position {
  let x = 0
  let y = 0
  let guard = 0
  do {
    x = (Math.random() * 2 - 1) * MAX_OFFSET_X_PX
    y = (Math.random() * 2 - 1) * MAX_OFFSET_Y_PX
    guard += 1
  } while (Math.abs(x) < CENTER_DEAD_ZONE_PX && Math.abs(y) < CENTER_DEAD_ZONE_PX && guard < 20)
  return { x, y }
}

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

function pickRoundTokens(random: () => number): string[] {
  const wordPool = shuffle(WORD_TOKENS, random)
  const picked: string[] = []
  for (let i = 0; i < TOKENS_PER_ROUND; i += 1) {
    const useNumber = random() < 0.35 || wordPool.length === 0
    if (useNumber) {
      let candidate = generateNumberToken()
      while (picked.includes(candidate)) candidate = generateNumberToken()
      picked.push(candidate)
    } else {
      const word = wordPool.pop()
      if (word !== undefined) picked.push(word)
    }
  }
  return picked
}

function buildFlashSchedule(seed: number): { events: readonly FlashEvent[]; totalMs: number } {
  const random = mulberry32(seed)
  const events: FlashEvent[] = []
  let cursorMs = LEAD_IN_MS
  ROUND_CONFIGS.forEach(({ displayMs }, round) => {
    const tokens = pickRoundTokens(random)
    for (const token of tokens) {
      events.push({ token, position: generateWidePosition(), displayMs, startMs: cursorMs, round })
      cursorMs += displayMs + GAP_MS
    }
    if (round < ROUND_CONFIGS.length - 1) cursorMs += ROUND_TRANSITION_MS
  })
  return { events, totalMs: cursorMs }
}

const TOTAL_EXERCISE_MS = buildFlashSchedule(0).totalMs

function computeActiveFlash(elapsedMs: number, schedule: readonly FlashEvent[]): { event: FlashEvent; progress: number } | null {
  for (const event of schedule) {
    if (elapsedMs >= event.startMs && elapsedMs < event.startMs + event.displayMs) {
      return { event, progress: (elapsedMs - event.startMs) / event.displayMs }
    }
  }
  return null
}

function flashEnvelope(progress: number): number {
  if (progress < 0.2) return progress / 0.2
  if (progress < 0.7) return 1
  return Math.max(0, 1 - (progress - 0.7) / 0.3)
}

// Returns the round currently finishing (if elapsedMs falls inside its
// own trailing ROUND_TRANSITION_MS window) so the UI can show a smooth
// "Round complete" card instead of a blank gap — the "seamless round
// transitions" this exercise is specifically asked for.
function computeRoundTransition(elapsedMs: number): { justFinishedRound: number; nextRound: number } | null {
  let cursor = LEAD_IN_MS
  for (let round = 0; round < ROUND_CONFIGS.length; round++) {
    const config = ROUND_CONFIGS[round]
    if (!config) break
    const roundEnd = cursor + TOKENS_PER_ROUND * (config.displayMs + GAP_MS)
    const isLastRound = round === ROUND_CONFIGS.length - 1
    if (!isLastRound && elapsedMs >= roundEnd && elapsedMs < roundEnd + ROUND_TRANSITION_MS) {
      return { justFinishedRound: round, nextRound: round + 1 }
    }
    cursor = roundEnd + (isLastRound ? 0 : ROUND_TRANSITION_MS)
  }
  return null
}

function computeCurrentRound(elapsedMs: number): number {
  let cursor = LEAD_IN_MS
  for (let round = 0; round < ROUND_CONFIGS.length; round++) {
    const config = ROUND_CONFIGS[round]
    if (!config) break
    const roundEnd = cursor + TOKENS_PER_ROUND * (config.displayMs + GAP_MS)
    if (elapsedMs < roundEnd + ROUND_TRANSITION_MS) return round
    cursor = roundEnd + ROUND_TRANSITION_MS
  }
  return ROUND_CONFIGS.length - 1
}

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

export function RapidVisualSpanExpander({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [activeToken, setActiveToken] = useState<string | null>(null)

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const scheduleRef = useRef<readonly FlashEvent[]>([])
  const lastActiveStartMsRef = useRef<number | null>(null)
  // The current flash's own fixed peripheral position — set once per
  // flash (see the rAF loop below); flashY then adds a small, shrinking
  // upward drift on top of this each frame for the "floating in" feel.
  const activeBaseYRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const tickBusRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  // The flash's own position/opacity — driven every animation frame from
  // real elapsed time, never React state, so the float stays a true
  // 60fps. Only the token TEXT needs a real re-render, and only exactly
  // once per flash (see the rAF loop below).
  const flashX = useMotionValue(0)
  const flashY = useMotionValue(0)
  const flashOpacity = useMotionValue(0)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

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

  useAnimationFrame(() => {
    if (phaseRef.current !== 'active' || startedAtRef.current === null) return
    const elapsed = Math.min(TOTAL_EXERCISE_MS, performance.now() - startedAtRef.current)
    const active = computeActiveFlash(elapsed, scheduleRef.current)

    if (active === null) {
      flashOpacity.set(0)
      if (lastActiveStartMsRef.current !== null) {
        lastActiveStartMsRef.current = null
        setActiveToken(null)
      }
      return
    }

    if (active.event.startMs !== lastActiveStartMsRef.current) {
      lastActiveStartMsRef.current = active.event.startMs
      activeBaseYRef.current = active.event.position.y
      setActiveToken(active.event.token)
      flashX.set(active.event.position.x)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_FLASH_MS)
      playFlashTick()
    }

    const envelope = flashEnvelope(active.progress)
    flashOpacity.set(envelope)
    // A small, shrinking upward drift on top of the flash's own fixed
    // peripheral position — starts 8px low and settles to its real spot
    // as it fades in, the "floating into place" feel.
    flashY.set(activeBaseYRef.current + 8 * (1 - envelope))
  })

  function initAudio(): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    if (audioContextRef.current) return

    const audioContext = new AudioContext()
    const now = audioContext.currentTime

    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0, now)
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

    const tickBus = audioContext.createGain()
    tickBus.gain.setValueAtTime(1, now)
    tickBus.connect(audioContext.destination)

    audioContextRef.current = audioContext
    masterGainRef.current = masterGain
    tickBusRef.current = tickBus
    harmonicVoicesRef.current = voices
  }

  function playFlashTick(): void {
    const audioContext = audioContextRef.current
    const tickBus = tickBusRef.current
    if (!audioContext || !tickBus) return
    const now = audioContext.currentTime
    const stopTime = now + TICK_DECAY_S

    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(TICK_HZ, now)

    const gain = audioContext.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(TICK_PEAK_GAIN, now + TICK_ATTACK_S)
    gain.gain.exponentialRampToValueAtTime(0.0001, stopTime)

    oscillator.connect(gain)
    gain.connect(tickBus)
    oscillator.start(now)
    oscillator.stop(stopTime + 0.05)
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
    setTimeout(() => {
      for (const voice of voices) voice.oscillator.stop()
      void audioContext?.close().catch(() => undefined)
    }, RELEASE_SETTLE_MS)
    audioContextRef.current = null
    masterGainRef.current = null
    tickBusRef.current = null
    harmonicVoicesRef.current = []
  }

  function handleStart(): void {
    initAudio()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(0)
    scheduleRef.current = buildFlashSchedule(Date.now()).events
    lastActiveStartMsRef.current = null
    startedAtRef.current = performance.now()
    flashOpacity.set(0)
    setActiveToken(null)
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
  const progressPercent = Math.min(100, Math.round((elapsedMs / TOTAL_EXERCISE_MS) * 100))
  const currentRound = computeCurrentRound(elapsedMs) + 1
  const transition = computeRoundTransition(elapsedMs)

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
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

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Rapid Visual Span Expander</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <ScanEye className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Widen Your Visual Span</h2>
          <p className="text-sm text-muted-foreground">
            Keep your eyes on the center dot. Words and numbers will flash around it, getting faster across 4 rounds — just notice them without
            looking away. A light tap and tick mark every flash.
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
        <div className="flex w-full max-w-sm flex-col items-center gap-8">
          <div className="relative flex items-center justify-center" style={{ width: FIELD_WIDTH_PX, height: FIELD_HEIGHT_PX }}>
            {transition === null ? (
              <>
                {/* The central fixation anchor. */}
                <div className="absolute left-1/2 top-1/2 size-0">
                  <motion.div
                    aria-hidden="true"
                    className="-ml-3 -mt-3 flex size-6 items-center justify-center rounded-full"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.75, 0.95, 0.75] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-[-9px] rounded-full blur-md"
                      style={{ background: 'radial-gradient(circle, rgba(165,243,252,0.75) 0%, rgba(139,92,246,0.55) 60%, transparent 100%)' }}
                    />
                    <div
                      aria-hidden="true"
                      className="relative size-full rounded-full border border-white/60"
                      style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(34,211,238,0.9) 45%, rgba(79,70,229,0.9) 100%)' }}
                    />
                  </motion.div>
                </div>

                {/* The flash — floating, glow-shadowed typography that
                    drifts gently into place as it fades in. Nested in
                    three layers deliberately: the outer div anchors to
                    the field's exact center, the middle div statically
                    centers whatever width the current token renders at
                    (a plain Tailwind transform, untouched by framer), and
                    only the inner motion.div carries the dynamic x/y/
                    opacity — stacking a static and an animated transform
                    on the SAME element silently drops the static one. */}
                <div className="absolute left-1/2 top-1/2 size-0">
                  <div className="-translate-x-1/2 -translate-y-1/2">
                    <motion.div style={{ x: flashX, y: flashY, opacity: flashOpacity }}>
                      {activeToken !== null && (
                        <span
                          className="font-heading text-2xl font-bold text-transparent bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text dark:from-indigo-300 dark:via-violet-300 dark:to-cyan-200 sm:text-3xl"
                          style={{ filter: 'drop-shadow(0 4px 14px rgba(139,92,246,0.55))' }}
                        >
                          {activeToken}
                        </span>
                      )}
                    </motion.div>
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                key={transition.nextRound}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col items-center gap-2"
              >
                <span className="font-heading text-lg font-semibold text-foreground">Round {transition.justFinishedRound + 1} complete</span>
                <span className="text-sm text-muted-foreground">Round {transition.nextRound + 1} begins — a little faster</span>
              </motion.div>
            )}
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15 dark:bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Round {currentRound} of {ROUND_CONFIGS.length}
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
            <ScanEye className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Span Expanded</h2>
          <p className="text-sm text-muted-foreground">Your peripheral vision just kept up with a faster and faster pace.</p>
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
