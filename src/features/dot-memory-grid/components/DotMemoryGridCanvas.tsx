'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  DOT_MEMORY_FLASH_DURATION_MS,
  DOT_MEMORY_GRID_ROUNDS_PER_SESSION,
  computeAccuracyPercent,
  dotCountForRound,
  pickTargetCellIndices,
  totalCellsForGridSize,
  type DotMemoryGridSize,
} from '../dotMemoryGridEngine'

const TICK_MS = 100
// How long the "missed" reveal stays visible before the next round begins
// (or the session ends) — long enough to actually register what was
// missed, short enough that "Zero mid-stream clutter" still holds: no
// button press required, the session just flows forward.
const REVEAL_DURATION_MS = 900

type RoundPhase = 'flash' | 'recall' | 'reveal'
type CellState = 'idle' | 'flash-target' | 'correct' | 'wrong' | 'missed'

// Frosted-glass palette — own-copy, matching every Reading Mode built this
// app, per this exercise's explicit "frosted-glass focus framing" spec.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'

// The exact tuned 110Hz drone recipe (own-copy) shared by every exercise
// this app has built — a full octave down from the original Brain Gym
// recipe, heavily low-passed, quiet at rest, slow to fade in/out.
const FUNDAMENTAL_HZ = 110
const RESTING_GAIN = 0.014
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 2.5
const RELEASE_TIME_CONSTANT_S = 1.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
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

type DotMemoryGridCanvasProps = {
  gridSize: DotMemoryGridSize
  onComplete: (elapsedMs: number, totalCorrect: number, totalDots: number, bestStreak: number) => void
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

function phaseInstruction(phase: RoundPhase): string {
  if (phase === 'flash') return 'Memorize the glowing dots.'
  if (phase === 'recall') return 'Tap the cells you remember.'
  return 'Here is what you missed.'
}

// Dot Memory Grid™ — deliberately NOT built on useReadingRuntime: that
// hook paces a fixed sequence of text content forward at a target WPM,
// which has no honest meaning for a spatial memorize-then-tap game. Same
// precedent as SchulteGridDrillCanvas.tsx / EspZenerTelepathyCanvas.tsx:
// its own minimal 100ms tick purely for an honest live stopwatch, and the
// two genuinely generic shell atoms (ReadingProgressBar, ReadingStatTile)
// reused directly rather than fabricating WPM-shaped numbers.
export function DotMemoryGridCanvas({ gridSize, onComplete, onExitRequested }: DotMemoryGridCanvasProps): React.JSX.Element {
  const totalCells = totalCellsForGridSize(gridSize)

  const [roundIndex, setRoundIndex] = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('flash')
  const [targetCellIndices, setTargetCellIndices] = useState<readonly number[]>(() =>
    pickTargetCellIndices(totalCells, dotCountForRound(0, gridSize)),
  )
  // Correct and wrong taps live in ONE piece of state, updated together via
  // a single functional setState — two rapid taps (e.g. an automated
  // click storm, or a fast double-tap) could otherwise both read the same
  // stale snapshot before either commits, silently dropping one tap and
  // leaving the round unable to ever reach its dot-count budget. A single
  // functional updater guarantees each tap is applied against the true
  // latest state, however fast taps arrive.
  const [roundProgress, setRoundProgress] = useState<{ correct: ReadonlySet<number>; wrong: ReadonlySet<number> }>({
    correct: new Set(),
    wrong: new Set(),
  })

  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalDots, setTotalDots] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const [elapsedMs, setElapsedMs] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)

  // The stopwatch ticks continuously and independently of round phase
  // transitions — the completion timeout below fires REVEAL_DURATION_MS
  // after its own effect scheduled it, so it must read the LIVE elapsed
  // time via a ref rather than the value closed over when it was
  // scheduled, or the final reported time would always undershoot by
  // about REVEAL_DURATION_MS.
  const elapsedMsRef = useRef(0)
  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isSessionComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isSessionComplete])

  const targetCellIndexSet = useMemo(() => new Set(targetCellIndices), [targetCellIndices])
  const dotCountThisRound = dotCountForRound(roundIndex, gridSize)

  function startRound(index: number): void {
    setTargetCellIndices(pickTargetCellIndices(totalCells, dotCountForRound(index, gridSize)))
    setRoundProgress({ correct: new Set(), wrong: new Set() })
    setRoundPhase('flash')
    setRoundIndex(index)
  }

  // Flash → Recall: reveal the dots for a fixed window, then hide them and
  // open the grid up for taps.
  useEffect(() => {
    if (roundPhase !== 'flash') return
    const timeout = setTimeout(() => setRoundPhase('recall'), DOT_MEMORY_FLASH_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [roundPhase, roundIndex])

  // Recall → Reveal: the round's dot-count budget is exhausted the moment
  // committed state (not a synchronously-guessed "next" value) shows that
  // many taps resolved — reacting to the committed roundProgress state is
  // what makes this immune to the rapid-tap race described above.
  useEffect(() => {
    if (roundPhase !== 'recall') return
    if (roundProgress.correct.size + roundProgress.wrong.size >= dotCountThisRound) {
      setRoundPhase('reveal')
    }
  }, [roundProgress, roundPhase, dotCountThisRound])

  // Reveal → next round or session complete, after a brief pause to let
  // the "missed" highlight actually register.
  useEffect(() => {
    if (roundPhase !== 'reveal') return

    const roundCorrect = roundProgress.correct.size
    const timeout = setTimeout(() => {
      const nextTotalCorrect = totalCorrect + roundCorrect
      const nextTotalDots = totalDots + dotCountThisRound
      setTotalCorrect(nextTotalCorrect)
      setTotalDots(nextTotalDots)

      const isPerfectRound = roundCorrect === dotCountThisRound
      const nextStreak = isPerfectRound ? currentStreak + 1 : 0
      setCurrentStreak(nextStreak)
      const nextBestStreak = Math.max(bestStreak, nextStreak)
      setBestStreak(nextBestStreak)

      const isLastRound = roundIndex + 1 >= DOT_MEMORY_GRID_ROUNDS_PER_SESSION
      if (isLastRound) {
        setIsSessionComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          onComplete(elapsedMsRef.current, nextTotalCorrect, nextTotalDots, nextBestStreak)
        }
      } else {
        startRound(roundIndex + 1)
      }
    }, REVEAL_DURATION_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundPhase])

  function handleCellClick(cellIndex: number): void {
    if (roundPhase !== 'recall') return
    setRoundProgress((prev) => {
      if (prev.correct.has(cellIndex) || prev.wrong.has(cellIndex)) return prev
      const isTarget = targetCellIndexSet.has(cellIndex)
      return {
        correct: isTarget ? new Set(prev.correct).add(cellIndex) : prev.correct,
        wrong: isTarget ? prev.wrong : new Set(prev.wrong).add(cellIndex),
      }
    })
  }

  function cellStateFor(cellIndex: number): CellState {
    if (roundPhase === 'flash') return targetCellIndexSet.has(cellIndex) ? 'flash-target' : 'idle'
    if (roundProgress.correct.has(cellIndex)) return 'correct'
    if (roundProgress.wrong.has(cellIndex)) return 'wrong'
    if (roundPhase === 'reveal' && targetCellIndexSet.has(cellIndex)) return 'missed'
    return 'idle'
  }

  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  useEffect(() => {
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

  const progressPercent = Math.round((roundIndex / DOT_MEMORY_GRID_ROUNDS_PER_SESSION) * 100)
  const scoreLabel = totalDots > 0 ? `${computeAccuracyPercent(totalCorrect, totalDots)}%` : '—'

  return (
    <ReadingLayout maxWidthClassName="max-w-lg" onExit={() => onExitRequested(elapsedMs)}>
      <div className="w-full max-w-md">
        <p className="mb-3 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Dot Memory Grid™</p>
        <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4 sm:gap-4">
          <ReadingStatTile label="Round" value={`${roundIndex + 1} / ${DOT_MEMORY_GRID_ROUNDS_PER_SESSION}`} />
          <ReadingStatTile label="Score" value={scoreLabel} />
          <ReadingStatTile label="Streak" value={String(currentStreak)} />
          <ReadingStatTile label="Time" value={formatElapsedTime(elapsedMs)} />
        </div>
        <div className="mt-4">
          <ReadingProgressBar progressPercent={progressPercent} />
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-foreground" data-round-phase={roundPhase}>
        {phaseInstruction(roundPhase)}
      </p>

      {/* The frosted-glass focus frame around the grid itself. */}
      <div className={`mt-4 w-full rounded-3xl border border-black/10 p-4 shadow-sm sm:p-6 dark:border-white/10 ${CARD_CLASS_NAME}`}>
        <div
          className="mx-auto grid w-full max-w-md gap-2"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          data-total-cells={totalCells}
        >
          {Array.from({ length: totalCells }, (_, cellIndex) => {
            const state = cellStateFor(cellIndex)
            const isDisabled = roundPhase !== 'recall' || state === 'correct' || state === 'wrong'
            return (
              <button
                key={cellIndex}
                type="button"
                data-cell-index={cellIndex}
                data-cell-state={state}
                disabled={isDisabled}
                onClick={() => handleCellClick(cellIndex)}
                aria-label={`Grid cell ${cellIndex + 1}`}
                className={`flex aspect-square items-center justify-center rounded-xl border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${cellBorderClassName(state, roundPhase)}`}
              >
                {state === 'flash-target' && (
                  <span
                    aria-hidden="true"
                    className="block size-1/2 rounded-full bg-cyan-400 shadow-[0_0_18px_4px_rgba(34,211,238,0.65)] dark:bg-cyan-300 dark:shadow-[0_0_20px_6px_rgba(103,232,249,0.55)]"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </ReadingLayout>
  )
}

function cellBorderClassName(state: CellState, phase: RoundPhase): string {
  if (state === 'correct') return 'border-emerald-500/50 bg-emerald-500/10'
  if (state === 'wrong') return 'border-red-500/60 bg-red-500/10'
  if (state === 'missed') return 'border-amber-500/60 bg-amber-500/10'
  if (phase === 'recall') return 'border-border bg-background hover:border-primary/40 hover:bg-accent/20 cursor-pointer'
  return 'border-border bg-background'
}
