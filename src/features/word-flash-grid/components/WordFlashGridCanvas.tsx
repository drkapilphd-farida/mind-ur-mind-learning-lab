'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  WORD_FLASH_GRID_ROUNDS_PER_SESSION,
  buildWordPickerOptions,
  computeAccuracyPercent,
  flashDurationMsForRound,
  pickTargetWords,
  totalCellsForGridSize,
  wordCountForRound,
  type WordFlashGridSize,
} from '../wordFlashGridEngine'

const TICK_MS = 100
// How long the "missed" reveal stays visible before the next round begins
// (or the session ends) — long enough to actually register the correct
// word that was missed, short enough that the session still flows forward
// without a button press.
const REVEAL_DURATION_MS = 1100

type RoundPhase = 'flash' | 'recall' | 'reveal'
type CellState = 'idle' | 'active' | 'flash-target' | 'correct' | 'wrong' | 'missed'

type RoundEntry = { word: string; isCorrect: boolean }
type RoundProgress = { entries: ReadonlyMap<number, RoundEntry> }

// Frosted-glass palette — own-copy, matching every Reading Mode and
// NumberFlashGridCanvas.tsx / DotMemoryGridCanvas.tsx built this app, per
// this exercise's explicit "frosted-glass focus framing" spec.
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

type WordFlashGridCanvasProps = {
  gridSize: WordFlashGridSize
  onComplete: (elapsedMs: number, totalCorrect: number, totalWords: number, bestStreak: number) => void
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

function phaseInstruction(phase: RoundPhase, hasActiveCell: boolean): string {
  if (phase === 'flash') return 'Memorize the words and their cells.'
  if (phase === 'reveal') return 'Here is what you missed.'
  return hasActiveCell ? 'Pick the word you remember for that cell.' : 'Tap a cell you remember, then pick its word.'
}

// Word Flash Grid™ — deliberately NOT built on useReadingRuntime: that
// hook paces a fixed sequence of text content forward at a target WPM,
// which has no honest meaning for a visual-linguistic flash-then-recall
// game. Same precedent as NumberFlashGridCanvas.tsx / DotMemoryGridCanvas.tsx:
// its own minimal 100ms tick purely for an honest live stopwatch, and the
// two genuinely generic shell atoms (ReadingProgressBar, ReadingStatTile)
// reused directly.
//
// The one genuinely new wrinkle versus Number Flash Grid: the vocabulary
// is open-ended, not a closed 0-9 set, so the picker can't just always
// show everything — it's scoped per round (real targets + a few decoys,
// see buildWordPickerOptions), recomputed fresh every round alongside the
// target cells themselves.
export function WordFlashGridCanvas({ gridSize, onComplete, onExitRequested }: WordFlashGridCanvasProps): React.JSX.Element {
  const totalCells = totalCellsForGridSize(gridSize)

  const [roundIndex, setRoundIndex] = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('flash')
  const [targetCells, setTargetCells] = useState(() => pickTargetWords(totalCells, wordCountForRound(0, gridSize)))
  const [pickerOptions, setPickerOptions] = useState(() => buildWordPickerOptions(targetCells.map((cell) => cell.word)))
  const [roundProgress, setRoundProgress] = useState<RoundProgress>({ entries: new Map() })
  const [activeInputCellIndex, setActiveInputCellIndex] = useState<number | null>(null)

  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const [elapsedMs, setElapsedMs] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)

  // The stopwatch ticks continuously and independently of round phase
  // transitions — the completion timeout below fires REVEAL_DURATION_MS
  // after its own effect scheduled it, so it must read the LIVE elapsed
  // time via a ref rather than the value closed over when it was
  // scheduled, or the final reported time would always undershoot.
  const elapsedMsRef = useRef(0)
  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isSessionComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isSessionComplete])

  const targetCellMap = useMemo(() => new Map(targetCells.map((cell) => [cell.cellIndex, cell.word])), [targetCells])
  const wordCountThisRound = wordCountForRound(roundIndex, gridSize)
  const flashDurationThisRound = flashDurationMsForRound(roundIndex)

  function startRound(index: number): void {
    const nextTargetCells = pickTargetWords(totalCells, wordCountForRound(index, gridSize))
    setTargetCells(nextTargetCells)
    setPickerOptions(buildWordPickerOptions(nextTargetCells.map((cell) => cell.word)))
    setRoundProgress({ entries: new Map() })
    setActiveInputCellIndex(null)
    setRoundPhase('flash')
    setRoundIndex(index)
  }

  // Flash → Recall: reveal the words for this round's own (shrinking)
  // window, then hide them and open the grid up for tap-then-pick input.
  useEffect(() => {
    if (roundPhase !== 'flash') return
    const timeout = setTimeout(() => setRoundPhase('recall'), flashDurationThisRound)
    return () => clearTimeout(timeout)
  }, [roundPhase, roundIndex, flashDurationThisRound])

  // Recall → Reveal: the round's word-count budget is exhausted the
  // moment committed state (not a synchronously-guessed "next" value)
  // shows that many cells resolved — reacting to the committed
  // roundProgress state keeps this immune to any rapid-tap race, the same
  // fix DotMemoryGridCanvas.tsx's own identical pattern needed.
  useEffect(() => {
    if (roundPhase !== 'recall') return
    if (roundProgress.entries.size >= wordCountThisRound) {
      setRoundPhase('reveal')
    }
  }, [roundProgress, roundPhase, wordCountThisRound])

  // Reveal → next round or session complete, after a brief pause to let
  // the "missed" highlight actually register.
  useEffect(() => {
    if (roundPhase !== 'reveal') return

    let roundCorrect = 0
    for (const entry of roundProgress.entries.values()) {
      if (entry.isCorrect) roundCorrect++
    }

    const timeout = setTimeout(() => {
      const nextTotalCorrect = totalCorrect + roundCorrect
      const nextTotalWords = totalWords + wordCountThisRound
      setTotalCorrect(nextTotalCorrect)
      setTotalWords(nextTotalWords)

      const isPerfectRound = roundCorrect === wordCountThisRound
      const nextStreak = isPerfectRound ? currentStreak + 1 : 0
      setCurrentStreak(nextStreak)
      const nextBestStreak = Math.max(bestStreak, nextStreak)
      setBestStreak(nextBestStreak)

      const isLastRound = roundIndex + 1 >= WORD_FLASH_GRID_ROUNDS_PER_SESSION
      if (isLastRound) {
        setIsSessionComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          onComplete(elapsedMsRef.current, nextTotalCorrect, nextTotalWords, nextBestStreak)
        }
      } else {
        startRound(roundIndex + 1)
      }
    }, REVEAL_DURATION_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundPhase])

  function handleCellTap(cellIndex: number): void {
    if (roundPhase !== 'recall') return
    if (roundProgress.entries.has(cellIndex)) return
    setActiveInputCellIndex(cellIndex)
  }

  function handleWordPick(word: string): void {
    if (activeInputCellIndex === null) return
    const cellIndex = activeInputCellIndex
    setActiveInputCellIndex(null)
    setRoundProgress((prev) => {
      if (prev.entries.has(cellIndex)) return prev
      const isCorrect = targetCellMap.get(cellIndex) === word
      const nextEntries = new Map(prev.entries)
      nextEntries.set(cellIndex, { word, isCorrect })
      return { entries: nextEntries }
    })
  }

  function cellStateFor(cellIndex: number): CellState {
    if (roundPhase === 'flash') return targetCellMap.has(cellIndex) ? 'flash-target' : 'idle'
    const entry = roundProgress.entries.get(cellIndex)
    if (entry) return entry.isCorrect ? 'correct' : 'wrong'
    if (roundPhase === 'reveal' && targetCellMap.has(cellIndex)) return 'missed'
    if (cellIndex === activeInputCellIndex) return 'active'
    return 'idle'
  }

  function cellWordLabel(cellIndex: number, state: CellState): string | null {
    if (state === 'flash-target') return targetCellMap.get(cellIndex) ?? null
    if (state === 'correct' || state === 'wrong') return roundProgress.entries.get(cellIndex)?.word ?? null
    if (state === 'missed') return targetCellMap.get(cellIndex) ?? null
    return null
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

  const progressPercent = Math.round((roundIndex / WORD_FLASH_GRID_ROUNDS_PER_SESSION) * 100)
  const scoreLabel = totalWords > 0 ? `${computeAccuracyPercent(totalCorrect, totalWords)}%` : '—'

  return (
    <ReadingLayout maxWidthClassName="max-w-lg" onExit={() => onExitRequested(elapsedMs)}>
      <div className="w-full max-w-md">
        <p className="mb-3 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Word Flash Grid™</p>
        <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4 sm:gap-4">
          <ReadingStatTile label="Round" value={`${roundIndex + 1} / ${WORD_FLASH_GRID_ROUNDS_PER_SESSION}`} />
          <ReadingStatTile label="Score" value={scoreLabel} />
          <ReadingStatTile label="Streak" value={String(currentStreak)} />
          <ReadingStatTile label="Time" value={formatElapsedTime(elapsedMs)} />
        </div>
        <div className="mt-4">
          <ReadingProgressBar progressPercent={progressPercent} />
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-foreground" data-round-phase={roundPhase}>
        {phaseInstruction(roundPhase, activeInputCellIndex !== null)}
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
            const wordLabel = cellWordLabel(cellIndex, state)
            const isDisabled = roundPhase !== 'recall' || state === 'correct' || state === 'wrong'
            return (
              <button
                key={cellIndex}
                type="button"
                data-cell-index={cellIndex}
                data-cell-state={state}
                disabled={isDisabled}
                onClick={() => handleCellTap(cellIndex)}
                aria-label={`Grid cell ${cellIndex + 1}`}
                className={`flex aspect-square items-center justify-center overflow-hidden rounded-xl border p-0.5 text-center text-[9px] leading-none font-bold uppercase transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 sm:p-1 sm:text-[11px] ${cellBorderClassName(state, roundPhase)}`}
              >
                {state === 'flash-target' && wordLabel !== null && (
                  <span aria-hidden="true" className="text-[11px] font-extrabold text-slate-950 sm:text-sm">
                    {wordLabel}
                  </span>
                )}
                {(state === 'correct' || state === 'wrong' || state === 'missed') && wordLabel !== null && <span>{wordLabel}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* The word picker — appears only once a cell has been tapped during
          recall, scoped to this round's own target words plus a few
          decoys (see buildWordPickerOptions), letting the two-step "which
          cell, then which word" recall stay entirely tap-driven, with no
          physical keyboard dependency. */}
      {roundPhase === 'recall' && activeInputCellIndex !== null && (
        <div className="mt-6 w-full max-w-md" data-word-picker-for={activeInputCellIndex}>
          <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
            Cell {activeInputCellIndex + 1}: which word was there?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {pickerOptions.map((word) => (
              <button
                key={word}
                type="button"
                data-word-option={word}
                onClick={() => handleWordPick(word)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-tight text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}
    </ReadingLayout>
  )
}

function cellBorderClassName(state: CellState, phase: RoundPhase): string {
  if (state === 'correct') return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  if (state === 'wrong') return 'border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300'
  if (state === 'missed') return 'border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300'
  // The flashing cell needs to instantly "pop" for the eye to catch it in
  // peripheral vision, not just the glyph inside it — a vivid, solid cell
  // background plus a matching glow reads correctly at a glance in both
  // themes, unlike relying on light-colored text (which had poor contrast
  // against the light paper-card background).
  if (state === 'flash-target') return 'border-cyan-500 bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.6)] dark:border-cyan-300 dark:bg-cyan-400 dark:shadow-[0_0_18px_rgba(103,232,249,0.55)]'
  if (state === 'active') return 'border-primary bg-accent/30'
  if (phase === 'recall') return 'border-border bg-background hover:border-primary/40 hover:bg-accent/20 cursor-pointer'
  return 'border-border bg-background'
}
