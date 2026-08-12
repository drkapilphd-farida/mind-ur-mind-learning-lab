'use client'

import { useEffect, useRef, useState } from 'react'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  FLUID_ENERGY_ROUNDS,
  FLUID_ENERGY_ROUNDS_PER_SESSION,
  FLUID_ENERGY_TICK_MS,
  clamp,
  computeStabilityPercent,
  directionNeededToCorrect,
  isInHarmony,
  isPerfectRound,
  stepFluidEnergy,
  type BalanceDirection,
} from '../fluidEnergyEngine'

type RoundPhase = 'active' | 'reveal'

type RoundProgress = {
  balance: number
  velocity: number
  stableTicks: number
  totalTicks: number
}

const EMPTY_PROGRESS: RoundProgress = { balance: 0, velocity: 0, stableTicks: 0, totalTicks: 0 }

// How long the round result stays visible before the next round begins
// (or the session ends) — a brief beat to register the round's own
// stability score, matching the identical "reveal" pause every flash-
// grid exercise this app has built already uses.
const REVEAL_DURATION_MS = 1200
const DEFAULT_VOLUME = 0.6

// Frosted-glass palette — own-copy, matching every other exercise built
// this app, per this exercise's explicit "frosted-glass focus framing"
// spec.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'

// The exact tuned dual-drone recipe (own-copy) shared by every ambient
// exercise this app has built — 110Hz lowpass base plus an independent
// 432Hz "healing frequency" layer, per this exercise's own explicit spec.
const FUNDAMENTAL_HZ = 110
const HEALING_OVERTONE_HZ = 432
const HEALING_OVERTONE_WEIGHT = 0.22
const RESTING_GAIN = 0.014
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 2.5
const RELEASE_TIME_CONSTANT_S = 1.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
const VOLUME_RAMP_TIME_CONSTANT_S = 0.4
const LOWPASS_CUTOFF_HZ = 900
const REVERB_WET_LEVEL = 0.28
const REVERB_DURATION_S = 2.0
const REVERB_DECAY = 2.8

const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

type HarmonicVoice = { oscillator: OscillatorNode }

type FluidEnergyBalancerCanvasProps = {
  onComplete: (elapsedMs: number, overallStabilityPercent: number, bestStreak: number) => void
  onExitRequested: (elapsedMs: number) => void
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

function guidanceLabel(direction: BalanceDirection): string {
  if (direction === -1) return 'Hold Ground It to correct'
  if (direction === 1) return 'Hold Lift It to correct'
  return 'Perfectly balanced'
}

// Fluid Energy Balancer™ — deliberately NOT built on useReadingRuntime:
// that hook paces fixed content forward at a target WPM, which has no
// meaning for a real-time, continuously-held-input balancing simulation.
// Own minimal 100ms physics tick (FLUID_ENERGY_TICK_MS, matching every
// sibling exercise's own tick rate for consistency), and the generic
// shell atoms (ReadingProgressBar, ReadingStatTile) reused directly.
//
// Round progress (balance + stability tallies) lives in ONE state object
// (RoundProgress), updated via a single functional setState per tick —
// the same race-safe pattern DotMemoryGridCanvas.tsx had to retrofit
// after finding a rapid-input race there; this one is built that way
// from the start, since held-button input can fire far faster than a
// single 100ms tick boundary.
export function FluidEnergyBalancerCanvas({ onComplete, onExitRequested }: FluidEnergyBalancerCanvasProps): React.JSX.Element {
  const [roundIndex, setRoundIndex] = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('active')
  const [roundElapsedMs, setRoundElapsedMs] = useState(0)
  const [progress, setProgress] = useState<RoundProgress>(EMPTY_PROGRESS)
  const [inputDirection, setInputDirection] = useState<BalanceDirection>(0)
  const [isPaused, setIsPaused] = useState(false)

  const [roundResults, setRoundResults] = useState<number[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const [elapsedMs, setElapsedMs] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)

  const config = FLUID_ENERGY_ROUNDS[roundIndex]!

  const elapsedMsRef = useRef(0)
  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isSessionComplete || isPaused) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + FLUID_ENERGY_TICK_MS), FLUID_ENERGY_TICK_MS)
    return () => clearInterval(interval)
  }, [isSessionComplete, isPaused])

  const inputDirectionRef = useRef<BalanceDirection>(0)
  inputDirectionRef.current = inputDirection

  // The physics + round-timer tick — the only place the simulation
  // actually advances.
  useEffect(() => {
    if (roundPhase !== 'active' || isSessionComplete || isPaused) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextSim = stepFluidEnergy({ balance: prev.balance, velocity: prev.velocity }, inputDirectionRef.current, config)
        const inHarmony = isInHarmony(nextSim.balance, config)
        return {
          balance: nextSim.balance,
          velocity: nextSim.velocity,
          stableTicks: prev.stableTicks + (inHarmony ? 1 : 0),
          totalTicks: prev.totalTicks + 1,
        }
      })
      setRoundElapsedMs((ms) => ms + FLUID_ENERGY_TICK_MS)
    }, FLUID_ENERGY_TICK_MS)
    return () => clearInterval(interval)
  }, [roundPhase, isSessionComplete, isPaused, config])

  // Active → Reveal: the round's own fixed time budget has run out.
  useEffect(() => {
    if (roundPhase !== 'active') return
    if (roundElapsedMs >= config.durationMs) {
      setRoundPhase('reveal')
    }
  }, [roundElapsedMs, config.durationMs, roundPhase])

  // Reveal → next round or session complete, after a brief pause to let
  // the round's own result actually register.
  useEffect(() => {
    if (roundPhase !== 'reveal') return

    const stabilityPercent = computeStabilityPercent(progress.stableTicks, progress.totalTicks)
    const timeout = setTimeout(() => {
      setRoundResults((results) => [...results, stabilityPercent])
      const nextStreak = isPerfectRound(stabilityPercent) ? currentStreak + 1 : 0
      setCurrentStreak(nextStreak)
      setBestStreak((best) => Math.max(best, nextStreak))

      const isLastRound = roundIndex + 1 >= FLUID_ENERGY_ROUNDS_PER_SESSION
      if (isLastRound) {
        setIsSessionComplete(true)
      } else {
        setRoundIndex((index) => index + 1)
        setRoundElapsedMs(0)
        setProgress(EMPTY_PROGRESS)
        setInputDirection(0)
        setRoundPhase('active')
      }
    }, REVEAL_DURATION_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundPhase])

  useEffect(() => {
    if (!isSessionComplete) return
    if (hasCalledCompleteRef.current) return
    hasCalledCompleteRef.current = true
    const overallStabilityPercent =
      roundResults.length > 0 ? Math.round(roundResults.reduce((sum, percent) => sum + percent, 0) / roundResults.length) : 0
    onComplete(elapsedMsRef.current, overallStabilityPercent, bestStreak)
  }, [isSessionComplete, roundResults, bestStreak, onComplete])

  function handleDirectionDown(direction: BalanceDirection): void {
    if (roundPhase !== 'active' || isPaused) return
    setInputDirection(direction)
  }
  function handleDirectionUp(direction: BalanceDirection): void {
    setInputDirection((current) => (current === direction ? 0 : current))
  }

  // Keyboard support (ArrowLeft/ArrowRight) alongside the on-screen
  // buttons — held, not tapped, matching the exact same "hold to
  // counteract" mechanic for desktop players.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.repeat) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleDirectionDown(-1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleDirectionDown(1)
      }
    }
    function handleKeyUp(event: KeyboardEvent): void {
      if (event.key === 'ArrowLeft') handleDirectionUp(-1)
      else if (event.key === 'ArrowRight') handleDirectionUp(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundPhase, isPaused])

  // A short haptic pulse exactly on entering or leaving harmony — never
  // continuously, which would just be an annoying buzz — mirroring
  // DynamicChunkSlidingCanvas.tsx's own identical "pulse only on real
  // transitions" convention.
  const wasInHarmonyRef = useRef(false)
  useEffect(() => {
    if (roundPhase !== 'active') return
    const inHarmony = isInHarmony(progress.balance, config)
    if (inHarmony !== wasInHarmonyRef.current) {
      wasInHarmonyRef.current = inHarmony
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(12)
    }
  }, [progress.balance, roundPhase, config])

  function handlePause(): void {
    setIsPaused(true)
    setInputDirection(0)
  }
  function handleRestart(): void {
    setRoundIndex(0)
    setRoundPhase('active')
    setRoundElapsedMs(0)
    setProgress(EMPTY_PROGRESS)
    setInputDirection(0)
    setIsPaused(false)
    setRoundResults([])
    setCurrentStreak(0)
    setBestStreak(0)
    setElapsedMs(0)
    setIsSessionComplete(false)
    hasCalledCompleteRef.current = false
  }

  // ---- Ambient drone: 110Hz base + 432Hz healing overtone, own-copy of
  // SensoryHologramBuilderCanvas.tsx's identical audio graph and volume/
  // mute/soundscape control scheme. ----
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [isMuted, setIsMuted] = useState(false)
  const [isSoundscapeEnabled, setIsSoundscapeEnabled] = useState(true)

  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  useEffect(() => {
    const audioContext = new AudioContext()
    const now = audioContext.currentTime

    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0, now)

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

    const healingOscillator = audioContext.createOscillator()
    healingOscillator.type = 'sine'
    healingOscillator.frequency.setValueAtTime(HEALING_OVERTONE_HZ, now)
    const healingGain = audioContext.createGain()
    healingGain.gain.setValueAtTime(HEALING_OVERTONE_WEIGHT, now)
    const healingPanner = audioContext.createStereoPanner()
    healingPanner.pan.setValueAtTime(0, now)
    healingOscillator.connect(healingGain)
    healingGain.connect(healingPanner)
    healingPanner.connect(masterGain)
    healingOscillator.start()
    voices.push({ oscillator: healingOscillator })

    masterGain.gain.setTargetAtTime(RESTING_GAIN, now, AMBIENT_FADE_IN_TIME_CONSTANT_S)

    audioContextRef.current = audioContext
    masterGainRef.current = masterGain
    harmonicVoicesRef.current = voices

    return () => {
      const context = audioContextRef.current
      const gain = masterGainRef.current
      const activeVoices = harmonicVoicesRef.current
      if (context && gain) {
        const stopNow = context.currentTime
        gain.gain.cancelScheduledValues(stopNow)
        gain.gain.setValueAtTime(gain.gain.value, stopNow)
        gain.gain.setTargetAtTime(0, stopNow, RELEASE_TIME_CONSTANT_S)
      }
      setTimeout(() => {
        for (const voice of activeVoices) voice.oscillator.stop()
        void context?.close().catch(() => undefined)
      }, RELEASE_SETTLE_MS)
      audioContextRef.current = null
      masterGainRef.current = null
      harmonicVoicesRef.current = []
    }
  }, [])

  useEffect(() => {
    const gain = masterGainRef.current
    const context = audioContextRef.current
    if (!gain || !context) return
    const targetGain = isSoundscapeEnabled && !isMuted ? RESTING_GAIN * (volume / DEFAULT_VOLUME) : 0
    gain.gain.setTargetAtTime(targetGain, context.currentTime, VOLUME_RAMP_TIME_CONSTANT_S)
  }, [volume, isMuted, isSoundscapeEnabled])

  const inHarmony = isInHarmony(progress.balance, config)
  const leftFillPercent = clamp(50 - progress.balance / 2, 0, 100)
  const rightFillPercent = clamp(50 + progress.balance / 2, 0, 100)
  const markerLeftPercent = clamp(50 + progress.balance / 2, 0, 100)
  const zoneWidthPercent = clamp(config.toleranceBand, 0, 100)
  const liveStabilityPercent = computeStabilityPercent(progress.stableTicks, progress.totalTicks)
  const sessionProgressPercent = Math.round((roundIndex / FLUID_ENERGY_ROUNDS_PER_SESSION) * 100)
  const neededDirection = directionNeededToCorrect(progress.balance)

  return (
    <ReadingLayout maxWidthClassName="max-w-xl" onExit={() => onExitRequested(elapsedMs)}>
      <div className="w-full max-w-md">
        <p className="mb-3 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Fluid Energy Balancer™</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <ReadingStatTile label="Round" value={`${roundIndex + 1} / ${FLUID_ENERGY_ROUNDS_PER_SESSION}`} />
          <ReadingStatTile label="Stability" value={`${liveStabilityPercent}%`} />
          <ReadingStatTile label="Time" value={formatElapsedTime(elapsedMs)} />
        </div>
        <div className="mt-4">
          <ReadingProgressBar progressPercent={sessionProgressPercent} />
        </div>
      </div>

      <p
        className={`mt-6 text-sm font-medium transition-colors ${inHarmony ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}
        data-guidance={neededDirection}
      >
        {guidanceLabel(neededDirection)}
      </p>

      {/* The dual-scale stage — frosted-glass framing, an instant green/
          red visual cue on the border, twin fluid columns, and a glowing
          energy beam marking the live balance position against the
          round's own tolerance zone. */}
      <div
        className={`mt-4 w-full rounded-3xl border-2 p-6 shadow-sm transition-colors duration-150 ${CARD_CLASS_NAME} ${
          inHarmony ? 'border-emerald-500/70 shadow-[0_0_24px_rgba(16,185,129,0.25)]' : 'border-red-500/40'
        }`}
        data-round-index={roundIndex}
        data-round-phase={roundPhase}
        data-balance={Math.round(progress.balance)}
        data-in-harmony={inHarmony}
        data-input-direction={inputDirection}
        data-stability-percent={liveStabilityPercent}
      >
        <div className="flex items-end justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-medium tracking-widest text-amber-700 uppercase dark:text-amber-400">Earth &amp; Gold</p>
            <div className="relative h-40 w-16 overflow-hidden rounded-2xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <div
                className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-amber-600 to-yellow-400 transition-[height] duration-150 ease-out"
                style={{ height: `${leftFillPercent}%` }}
              />
            </div>
          </div>

          <div className="flex w-full max-w-56 flex-1 flex-col items-center gap-3">
            <div className="relative h-3 w-full rounded-full bg-foreground/10">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 rounded-full bg-emerald-500/25"
                style={{ left: `${50 - zoneWidthPercent / 2}%`, width: `${zoneWidthPercent}%` }}
              />
              <div
                data-balance-marker="true"
                className={`absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-100 ease-linear ${
                  inHarmony
                    ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]'
                    : 'border-red-400 bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.75)]'
                }`}
                style={{ left: `${markerLeftPercent}%` }}
              />
            </div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Energy Beam</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-medium tracking-widest text-cyan-700 uppercase dark:text-cyan-400">Air &amp; Water</p>
            <div className="relative h-40 w-16 overflow-hidden rounded-2xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <div
                className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-cyan-600 to-blue-300 transition-[height] duration-150 ease-out"
                style={{ height: `${rightFillPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hold-to-correct controls — pointer + keyboard (ArrowLeft/ArrowRight). */}
      <div className="mt-8 flex w-full max-w-md items-center justify-center gap-6">
        <button
          type="button"
          data-direction-button="-1"
          onPointerDown={() => handleDirectionDown(-1)}
          onPointerUp={() => handleDirectionUp(-1)}
          onPointerLeave={() => handleDirectionUp(-1)}
          onPointerCancel={() => handleDirectionUp(-1)}
          disabled={roundPhase !== 'active' || isPaused}
          className={`flex-1 rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 disabled:cursor-not-allowed disabled:opacity-40 ${
            inputDirection === -1 ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'border-border bg-background text-foreground'
          }`}
        >
          ⬇ Ground It
        </button>
        <button
          type="button"
          data-direction-button="1"
          onPointerDown={() => handleDirectionDown(1)}
          onPointerUp={() => handleDirectionUp(1)}
          onPointerLeave={() => handleDirectionUp(1)}
          onPointerCancel={() => handleDirectionUp(1)}
          disabled={roundPhase !== 'active' || isPaused}
          className={`flex-1 rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 disabled:cursor-not-allowed disabled:opacity-40 ${
            inputDirection === 1 ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' : 'border-border bg-background text-foreground'
          }`}
        >
          ⬆ Lift It
        </button>
      </div>

      {/* Ambient soundscape controls — volume slider, mute toggle, and a
          persistent on/off switch. */}
      <div className="mt-6 flex w-full max-w-md flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setIsSoundscapeEnabled((enabled) => !enabled)}
          data-soundscape-enabled={isSoundscapeEnabled}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
            isSoundscapeEnabled ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground'
          }`}
        >
          Soundscape {isSoundscapeEnabled ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          onClick={() => setIsMuted((muted) => !muted)}
          data-is-muted={isMuted}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Volume
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            data-volume-percent={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            className="w-24 accent-foreground"
            aria-label="Ambient soundscape volume"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
        {isPaused ? (
          <button onClick={() => setIsPaused(false)} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Resume
          </button>
        ) : (
          <button onClick={handlePause} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Pause
          </button>
        )}
        <button onClick={handleRestart} className={SECONDARY_TEXT_BUTTON_CLASSES}>
          Restart
        </button>
      </div>
    </ReadingLayout>
  )
}

const PRIMARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
