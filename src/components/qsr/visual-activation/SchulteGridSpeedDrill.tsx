'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Grid3x3, SkipForward } from 'lucide-react'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { cn } from '@/lib/utils'
import type { VisualActivationExerciseProps } from './types'

// Schulte Grid Speed Drill™ — Exercise 9 of the Visual Activation Suite.
// Relocated here from the Reading Hub with a full 10/10 visual/audio
// upgrade (the original engine at src/features/schulte-grid-drill/ is
// untouched — it's still what powers the 21-Day Quantum Journey and the
// Unified Session's Pro rotation; this is a fresh, Brain-Gym-native
// rebuild of the same real drill, not a copy of that code). Find the
// numbers 1-25, in order, as fast as you can, anywhere on the grid — a
// genuine visual-search/peripheral-scanning warmup, not a paced flash.
// Three synchronized channels, matching Exercises 1-8's own architecture:
// frosted glassmorphism tiles with glowing indigo/violet borders and a
// cyan ripple on every correct tap (visual), a crisp 10ms tap exactly on
// each correct find — silent on a miss (haptic), and the same
// static-frequency singing-bowl drone as Exercises 1, 3-8, here paired
// with a genuine one-shot musical chime per correct tap (audio). Every
// oscillator's frequency is set once via setValueAtTime and never
// ramped — the same lesson Exercise 1's own "siren" bug taught.

type ExercisePhase = 'intro' | 'active' | 'complete'
type HarmonicVoice = { oscillator: OscillatorNode }
type Ripple = { id: number; cellIndex: number }

const GRID_SIZE = 5
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE
const TICK_MS = 100
const WRONG_FLASH_MS = 260
const RIPPLE_DURATION_MS = 550

const HAPTIC_CORRECT_MS = 10

// A real one-shot musical chime per correct tap — an ascending pentatonic
// run across all 25 taps (a gently compressed pseudo-octave climb, never
// a full 5-octave span, so tap 25 still lands bright rather than shrill).
const CHIME_BASE_HZ = 220 // A3
const PENTATONIC_RATIOS: readonly number[] = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]
const CHIME_ATTACK_S = 0.015
const CHIME_DECAY_S = 0.35
const CHIME_PEAK_GAIN = 0.12

// The same singing-bowl ambient drone every other Brain Gym exercise
// uses — here, for the first time, layered underneath real one-shot
// interaction chimes rather than standing alone.
const FUNDAMENTAL_HZ = 220
const RESTING_GAIN = 0.026
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

function noteFrequencyForTapIndex(index: number): number {
  const degree = index % PENTATONIC_RATIOS.length
  const octaveStep = Math.floor(index / PENTATONIC_RATIOS.length)
  const ratio = PENTATONIC_RATIOS[degree] ?? 1
  return CHIME_BASE_HZ * ratio * 2 ** (octaveStep * 0.6)
}

// A real Fisher-Yates shuffle, client-side only (Math.random() output
// must never differ between server and client for the same render) —
// identical technique to the original schulteGridDataset.ts, duplicated
// locally rather than imported, matching this suite's own-copy
// convention throughout.
function generateShuffledGrid(): readonly number[] {
  const numbers = Array.from({ length: TOTAL_CELLS }, (_, index) => index + 1)
  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const atI = numbers[i]
    const atJ = numbers[j]
    if (atI === undefined || atJ === undefined) continue
    numbers[i] = atJ
    numbers[j] = atI
  }
  return numbers
}

// A cosmetic, in-session performance reward shown once on the
// celebration screen — not written to any persistent XP ledger (Brain
// Gym exercises only ever call savePracticeSession for duration/
// completion, matching every sibling exercise). Rewards real speed and
// accuracy: a base reward, a bonus for a fast clear, a small penalty per
// mistake, floored so it never reads as a punishment.
function computeSessionXp(elapsedMs: number, mistakeCount: number): number {
  const baseXp = 50
  const speedBonusMs = Math.max(0, 45_000 - elapsedMs)
  const speedBonus = Math.round(speedBonusMs / 1000)
  const mistakePenalty = mistakeCount * 3
  return Math.max(15, baseXp + speedBonus - mistakePenalty)
}

function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(1)
  return minutes > 0 ? `${minutes}:${seconds.padStart(4, '0')}` : `${seconds}s`
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

export function SchulteGridSpeedDrill({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [grid, setGrid] = useState<readonly number[]>([])
  const [nextExpected, setNextExpected] = useState(1)
  const [mistakeCount, setMistakeCount] = useState(0)
  const [wrongCellIndex, setWrongCellIndex] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [ripples, setRipples] = useState<readonly Ripple[]>([])

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const nextRippleIdRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const chimeBusRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

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

  // The live stopwatch — this drill has no fixed duration or pacing (a
  // genuine speed drill has none): the user finds each number at their
  // own pace, and completion is driven entirely by real taps, not a
  // schedule. Matches the original engine's own reasoning exactly.
  useEffect(() => {
    if (phase !== 'active') return undefined
    const interval = setInterval(() => {
      if (!isMountedRef.current || startedAtRef.current === null) return
      setElapsedMs(performance.now() - startedAtRef.current)
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (wrongCellIndex === null) return undefined
    const timeout = setTimeout(() => setWrongCellIndex(null), WRONG_FLASH_MS)
    return () => clearTimeout(timeout)
  }, [wrongCellIndex])

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

    // A dedicated, separate bus for the tap chimes — connected straight
    // to destination, never through the drone's own masterGain, so
    // muting/fading the drone on teardown never touches the chimes and
    // vice versa; they're two genuinely independent audio layers.
    const chimeBus = audioContext.createGain()
    chimeBus.gain.setValueAtTime(1, now)
    chimeBus.connect(audioContext.destination)

    audioContextRef.current = audioContext
    masterGainRef.current = masterGain
    chimeBusRef.current = chimeBus
    harmonicVoicesRef.current = voices
  }

  // A single soft, bell-like tap — linear attack, exponential decay,
  // frequency set once via setValueAtTime and never touched again. The
  // same one-shot idiom Exercise 2's directional chimes established.
  function playCorrectTapChime(tapIndex: number): void {
    const audioContext = audioContextRef.current
    const chimeBus = chimeBusRef.current
    if (!audioContext || !chimeBus) return
    const freq = noteFrequencyForTapIndex(tapIndex)
    const now = audioContext.currentTime
    const stopTime = now + CHIME_DECAY_S

    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, now)

    const overtone = audioContext.createOscillator()
    overtone.type = 'sine'
    overtone.frequency.setValueAtTime(freq * 2, now)

    const gain = audioContext.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(CHIME_PEAK_GAIN, now + CHIME_ATTACK_S)
    gain.gain.exponentialRampToValueAtTime(0.0001, stopTime)

    const overtoneGain = audioContext.createGain()
    overtoneGain.gain.setValueAtTime(0, now)
    overtoneGain.gain.linearRampToValueAtTime(CHIME_PEAK_GAIN * 0.3, now + CHIME_ATTACK_S)
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, stopTime)

    oscillator.connect(gain)
    overtone.connect(overtoneGain)
    gain.connect(chimeBus)
    overtoneGain.connect(chimeBus)

    oscillator.start(now)
    overtone.start(now)
    oscillator.stop(stopTime + 0.05)
    overtone.stop(stopTime + 0.05)
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
    chimeBusRef.current = null
    harmonicVoicesRef.current = []
  }

  function handleStart(): void {
    initAudio()
    setGrid(generateShuffledGrid())
    setNextExpected(1)
    setMistakeCount(0)
    setWrongCellIndex(null)
    setRipples([])
    setElapsedMs(0)
    startedAtRef.current = performance.now()
    setPhase('active')
  }

  function handleCellTap(cellIndex: number, value: number): void {
    if (phaseRef.current !== 'active') return
    if (value === nextExpected) {
      const tapIndex = nextExpected - 1
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_CORRECT_MS)
      playCorrectTapChime(tapIndex)

      const rippleId = nextRippleIdRef.current
      nextRippleIdRef.current += 1
      setRipples((current) => [...current, { id: rippleId, cellIndex }])
      setTimeout(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== rippleId))
      }, RIPPLE_DURATION_MS)

      const next = nextExpected + 1
      setNextExpected(next)
      if (next > TOTAL_CELLS) {
        teardownAudio()
        setPhase('complete')
      }
    } else {
      setMistakeCount((count) => count + 1)
      setWrongCellIndex(cellIndex)
    }
  }

  function handleExit(): void {
    teardownAudio()
    onExit()
  }

  const progressPercent = Math.round(((nextExpected - 1) / TOTAL_CELLS) * 100)
  const finalXp = computeSessionXp(elapsedMs, mistakeCount)

  return (
    <div className={`relative flex ${isEmbedded ? 'h-full' : 'min-h-[100dvh]'} flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center`}>
      {!isEmbedded && <BrandWatermark className="absolute top-4 left-6" />}
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

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Peripheral Vision Activator</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Grid3x3 className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Race Through the Grid</h2>
          <p className="text-sm text-muted-foreground">
            Find 1 through 25, in order, anywhere on the grid — as fast as you can. Keep your eyes near center and let your peripheral vision do
            the searching. A ripple, a tap, and a rising chime mark every correct find.
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
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <div className="grid w-full grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-2 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Time</p>
              <p className="font-heading text-lg font-bold tabular-nums text-foreground">{formatElapsed(elapsedMs)}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-2 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Next</p>
              <p className="font-heading text-lg font-bold tabular-nums text-violet-600 dark:text-violet-300">
                {nextExpected <= TOTAL_CELLS ? nextExpected : '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-2 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Mistakes</p>
              <p className="font-heading text-lg font-bold tabular-nums text-foreground">{mistakeCount}</p>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/15 dark:bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          <div className="grid w-full gap-2.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
            {grid.map((value, cellIndex) => {
              const isFound = value < nextExpected
              const isWrong = wrongCellIndex === cellIndex
              const cellRipples = ripples.filter((ripple) => ripple.cellIndex === cellIndex)
              return (
                <button
                  key={cellIndex}
                  type="button"
                  disabled={isFound}
                  onClick={() => handleCellTap(cellIndex, value)}
                  aria-label={`Grid cell ${value}`}
                  className={cn(
                    // Deliberately NOT overflow-hidden — the correct-tap
                    // ripple below needs to visually expand past the
                    // tile's own bounds to read as a real ripple; clipping
                    // it to the tile would shrink it down to an inert
                    // static ring.
                    'relative flex aspect-square items-center justify-center rounded-2xl border text-lg font-bold backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70',
                    isWrong
                      ? 'border-red-500/60 bg-red-500/15 text-red-600 dark:text-red-400'
                      : isFound
                        ? 'border-violet-400/50 bg-violet-500/15 text-violet-600 dark:border-violet-300/40 dark:text-violet-300'
                        : 'border-white/25 bg-white/10 text-foreground shadow-[0_0_16px_-6px_rgba(139,92,246,0.55)] hover:border-violet-400/60 hover:bg-white/15 dark:border-white/10 dark:bg-white/5',
                  )}
                >
                  {value}
                  <AnimatePresence>
                    {cellRipples.map((ripple) => (
                      <motion.span
                        key={ripple.id}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-cyan-300"
                        initial={{ scale: 0.6, opacity: 0.9 }}
                        animate={{ scale: 1.9, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: RIPPLE_DURATION_MS / 1000, ease: 'easeOut' }}
                      />
                    ))}
                  </AnimatePresence>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleExit}
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
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/25 to-cyan-400/30 text-violet-600 shadow-lg shadow-violet-500/25 dark:text-violet-300"
          >
            <div aria-hidden="true" className="absolute inset-[-14px] rounded-full blur-xl" style={{ background: 'radial-gradient(circle, rgba(165,243,252,0.6) 0%, rgba(139,92,246,0.5) 60%, transparent 100%)' }} />
            <Grid3x3 className="relative size-8" aria-hidden="true" />
          </motion.div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Grid Cleared!</h2>
          <p className="text-sm text-muted-foreground">
            {formatElapsed(elapsedMs)} · {mistakeCount} {mistakeCount === 1 ? 'mistake' : 'mistakes'}
          </p>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.25 }}
            className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-cyan-400/15 px-6 py-2.5"
          >
            <span className="font-heading text-2xl font-bold text-transparent bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text dark:from-indigo-300 dark:via-violet-300 dark:to-cyan-200">
              +{finalXp} XP
            </span>
          </motion.div>

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
