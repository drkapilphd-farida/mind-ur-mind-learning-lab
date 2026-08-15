'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { playCorrectChime, playGentleMissChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import { loadSoundEnabledPreference } from '@/lib/audio/soundPreference'
import {
  ROUNDS_PER_SESSION,
  PERFECT_SESSION_BONUS,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForCorrectGuess,
  type PhotographicMemoryCategory,
  type PhotographicMemoryCategoryFilter,
  type PhotographicMemoryOptionContent,
  type PhotographicMemoryRound,
} from '../photographicMemoryDataset'
import { MandalaSvg } from './MandalaSvg'
import { IconClusterDisplay } from './IconClusterDisplay'
import { ColorShapeGridDisplay } from './ColorShapeGridDisplay'

const TICK_MS = 100
// Hard Mode — flash duration stays within the required 0.7-1.0s window
// for every category; Flash Word & Number Matrix specifically targets
// the task's own "~0.7 seconds" callout since text reads faster than a
// complex image.
const FLASH_DURATION_MS_BY_CATEGORY: Record<PhotographicMemoryCategory, number> = {
  mandala: 900,
  'icon-cluster': 900,
  'flash-matrix': 700,
  'color-shape': 900,
}
const REVEAL_DURATION_MS = 900
const RECALL_TIME_LIMIT_MS = 5000

// Ambient Focus Drone™ — the same calm, deep singing-bowl drone Dynamic
// Chunk Sliding uses (own-copy, per this app's established convention of
// duplicating small self-contained logic rather than cross-feature
// coupling — see DynamicChunkSlidingCanvas.tsx's identical comment),
// tuned for "invisible, profoundly calming backdrop" rather than a
// pitch sweep. Photographic Memory is exactly the kind of focus-heavy
// recall exercise that tuning was designed for, so reused unchanged
// rather than re-tuned from scratch.
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

type RoundPhase = 'flashing' | 'recall' | 'revealing'

type GuessOutcome = {
  isCorrect: boolean
  pointsEarned: number
}

type PhotographicMemoryCanvasProps = {
  categoryFilter: PhotographicMemoryCategoryFilter
  onComplete: (elapsedMs: number, correctCount: number, totalScore: number, bestStreak: number) => void
  onExitRequested: (elapsedMs: number) => void
}

function getMultiplierBadgeClassName(multiplier: number): string {
  if (multiplier >= 4) return 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700'
  if (multiplier === 3) return 'border-violet-500/60 bg-violet-500/10 text-violet-700'
  if (multiplier === 2) return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-700'
  return 'border-border text-muted-foreground'
}

function renderFlashContent(target: PhotographicMemoryOptionContent): React.JSX.Element {
  switch (target.kind) {
    case 'mandala':
      return <MandalaSvg pattern={target.pattern} className="h-48 w-48 text-foreground sm:h-56 sm:w-56" />
    case 'icon-cluster':
      return <IconClusterDisplay cluster={target.cluster} className="h-48 w-48 sm:h-56 sm:w-56" />
    case 'color-shape':
      return <ColorShapeGridDisplay pattern={target.pattern} className="w-full max-w-[220px]" />
    case 'text':
      return (
        <p
          className={`text-center font-bold text-foreground ${target.monospace ? 'font-mono text-4xl tracking-widest sm:text-5xl' : 'text-2xl sm:text-3xl'}`}
        >
          {target.displayText}
        </p>
      )
  }
}

function renderOptionContent(option: PhotographicMemoryOptionContent): React.JSX.Element {
  switch (option.kind) {
    case 'mandala':
      return <MandalaSvg pattern={option.pattern} rotationOffsetDeg={option.rotationOffsetDeg} className="h-full w-full text-foreground" />
    case 'icon-cluster':
      return <IconClusterDisplay cluster={option.cluster} className="h-full w-full" />
    case 'color-shape':
      return <ColorShapeGridDisplay pattern={option.pattern} className="w-full" />
    case 'text':
      return (
        <p
          className={`text-center font-semibold text-foreground ${option.monospace ? 'font-mono text-lg tracking-wide sm:text-xl' : 'text-sm sm:text-base'}`}
        >
          {option.displayText}
        </p>
      )
  }
}

// Photographic Memory™ — deliberately NOT built on
// useReadingRuntime/ReadingHeader: flashed content here has no word count
// to honestly dose a WPM-paced dwell time against (an SVG mandala, an
// icon cluster, or a color-shape grid isn't text), and there's no
// target-pace concept for a pure visual-recall game. Instead this reuses
// the two genuinely generic shell atoms directly (ReadingLayout,
// ReadingProgressBar, ReadingStatTile) and owns its own minimal 100ms
// tick for three independent timers: the overall session stopwatch, the
// flash countdown, and the recall time limit.
export function PhotographicMemoryCanvas({ categoryFilter, onComplete, onExitRequested }: PhotographicMemoryCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [rounds] = useState<readonly PhotographicMemoryRound[]>(() => buildSessionRounds(categoryFilter))
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<RoundPhase>('flashing')
  const currentRound: PhotographicMemoryRound | undefined = rounds[roundIndex]
  const [flashRemainingMs, setFlashRemainingMs] = useState(() =>
    currentRound ? FLASH_DURATION_MS_BY_CATEGORY[currentRound.category] : FLASH_DURATION_MS_BY_CATEGORY.mandala,
  )
  const [recallRemainingMs, setRecallRemainingMs] = useState(RECALL_TIME_LIMIT_MS)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<GuessOutcome | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)
  const elapsedMsRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  // Ambient Focus Drone™ — checked once on mount against the Global
  // Sound Preference™; if sound is off, no AudioContext is even created.
  // Not reactive to a later toggle mid-session (matches this app's
  // established once-on-mount ambient-audio pattern — see
  // DynamicChunkSlidingCanvas.tsx's identical effect shape).
  useEffect(() => {
    if (!loadSoundEnabledPreference()) return
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

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // The literal flash countdown the task calls for — ticks down only
  // while `phase === 'flashing'`, then hands off to the time-limited
  // recall phase.
  useEffect(() => {
    if (phase !== 'flashing') return
    if (flashRemainingMs <= 0) {
      setRecallRemainingMs(RECALL_TIME_LIMIT_MS)
      setPhase('recall')
      return
    }
    const timeout = setTimeout(() => setFlashRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, flashRemainingMs])

  // A second timer element — the learner has a limited window to pick an
  // answer, not just to memorize the flash. Running out counts as a miss
  // (same as picking wrong): streak resets, the real match is revealed,
  // no points awarded.
  useEffect(() => {
    if (phase !== 'recall') return
    if (recallRemainingMs <= 0) {
      handleTimeout()
      return
    }
    const timeout = setTimeout(() => setRecallRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, recallRemainingMs])

  // Auto-advances to the next round (or finishes the sprint) once a guess
  // has been revealed. Depends only on `phase`, matching the same
  // established pattern every sibling gamified exercise's own
  // reveal-advance effect uses — correctCount/totalScore/
  // bestStreakThisSession/roundIndex are all stable for the whole reveal
  // window, so reading them directly here is accurate, not stale; only
  // elapsedMs keeps ticking independently during the reveal, which is why
  // it's read via a ref instead.
  useEffect(() => {
    if (phase !== 'revealing') return
    const timeout = setTimeout(() => {
      const nextRound = roundIndex + 1
      if (nextRound >= ROUNDS_PER_SESSION) {
        setIsComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          const perfectBonus = correctCount === ROUNDS_PER_SESSION ? PERFECT_SESSION_BONUS : 0
          onComplete(elapsedMsRef.current, correctCount, totalScore + perfectBonus, bestStreakThisSession)
        }
      } else {
        const nextCategory = rounds[nextRound]?.category
        setRoundIndex(nextRound)
        setSelectedOptionId(null)
        setLastOutcome(null)
        setFlashRemainingMs(nextCategory ? FLASH_DURATION_MS_BY_CATEGORY[nextCategory] : FLASH_DURATION_MS_BY_CATEGORY.mandala)
        setPhase('flashing')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleGuess(optionId: string): void {
    if (phase !== 'recall' || currentRound === undefined) return
    const isCorrect = optionId === currentRound.correctOptionId
    setSelectedOptionId(optionId)
    setPhase('revealing')

    if (isCorrect) {
      const newStreak = streak + 1
      const pointsEarned = computePointsForCorrectGuess(newStreak)
      setStreak(newStreak)
      setBestStreakThisSession((best) => Math.max(best, newStreak))
      setCorrectCount((count) => count + 1)
      setTotalScore((score) => score + pointsEarned)
      setLastOutcome({ isCorrect: true, pointsEarned })
      playCorrectChime()
    } else {
      setStreak(0)
      setLastOutcome({ isCorrect: false, pointsEarned: 0 })
      playGentleMissChime()
    }
  }

  function handleTimeout(): void {
    if (phase !== 'recall') return
    setSelectedOptionId(null)
    setPhase('revealing')
    playGentleMissChime()
    setStreak(0)
    setLastOutcome({ isCorrect: false, pointsEarned: 0 })
  }

  if (currentRound === undefined) {
    return (
      <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
        {null}
      </ReadingLayout>
    )
  }

  const attemptsSoFar = roundIndex + (phase === 'revealing' ? 1 : 0)
  const accuracySoFar = attemptsSoFar > 0 ? Math.round((correctCount / attemptsSoFar) * 100) : 0
  const progressPercent = Math.round((attemptsSoFar / ROUNDS_PER_SESSION) * 100)
  const multiplier = computeStreakMultiplier(streak)
  const flashDurationForRound = FLASH_DURATION_MS_BY_CATEGORY[currentRound.category]
  const flashRemainingSeconds = (flashRemainingMs / 1000).toFixed(1)
  const recallRemainingSeconds = (recallRemainingMs / 1000).toFixed(1)

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Photographic Memory™</p>

      <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <ReadingStatTile label="Round" value={`${roundIndex + 1} / ${ROUNDS_PER_SESSION}`} />
        <ReadingStatTile label="Score" value={String(totalScore)} />
        <ReadingStatTile label="Streak" value={String(streak)} />
        <ReadingStatTile label="Accuracy" value={`${accuracySoFar}%`} />
      </div>

      <div className="mt-4 w-full">
        <ReadingProgressBar progressPercent={progressPercent} />
      </div>

      <div className="mt-4 flex justify-center">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${getMultiplierBadgeClassName(multiplier)}`}
        >
          Streak Multiplier ×{multiplier}
        </span>
      </div>

      {phase === 'flashing' ? (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex min-h-48 items-center justify-center sm:min-h-56">{renderFlashContent(currentRound.target)}</div>
          <div className="w-40">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full bg-foreground ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                style={{ width: `${(flashRemainingMs / flashDurationForRound) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">{flashRemainingSeconds}s</p>
          </div>
          <p className="text-sm text-muted-foreground">Memorize this...</p>
        </div>
      ) : (
        <>
          {phase === 'revealing' && lastOutcome !== null ? (
            <p className={`mt-6 text-center text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {lastOutcome.isCorrect ? `Perfect recall! +${lastOutcome.pointsEarned} points` : 'Not quite — the real match is glowing.'}
            </p>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-center text-sm text-muted-foreground">Which one matches what you just saw?</p>
              <div className="w-32">
                <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full rounded-full ${recallRemainingMs <= 1500 ? 'bg-red-500' : 'bg-foreground'} ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                    style={{ width: `${(recallRemainingMs / RECALL_TIME_LIMIT_MS) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-[10px] text-muted-foreground tabular-nums">{recallRemainingSeconds}s to answer</p>
              </div>
            </div>
          )}

          <div className="mx-auto mt-6 grid w-full max-w-sm grid-cols-2 gap-4">
            {currentRound.options.map((option) => {
              const isCorrectOption = phase === 'revealing' && option.optionId === currentRound.correctOptionId
              const isPickedWrong =
                phase === 'revealing' && selectedOptionId === option.optionId && lastOutcome !== null && !lastOutcome.isCorrect

              let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
              if (phase === 'revealing') {
                if (isCorrectOption) {
                  stateClassName = `border-emerald-500/70 bg-emerald-500/5 shadow-[0_0_24px_rgba(16,185,129,0.45)] ${prefersReducedMotion ? '' : 'scale-105'}`
                } else if (isPickedWrong) {
                  stateClassName = `border-red-500/60 bg-red-500/10 ${prefersReducedMotion ? '' : 'animate-shake'}`
                } else {
                  stateClassName = 'border-border opacity-30'
                }
              }

              return (
                <button
                  key={option.optionId}
                  type="button"
                  disabled={phase !== 'recall'}
                  onClick={() => handleGuess(option.optionId)}
                  aria-label="Photographic memory option"
                  className={`flex aspect-square items-center justify-center rounded-2xl border p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 active:scale-95 ${stateClassName}`}
                >
                  {renderOptionContent(option)}
                </button>
              )
            })}
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-muted-foreground">{formatElapsedTime(elapsedMs)} elapsed</p>
    </ReadingLayout>
  )
}
