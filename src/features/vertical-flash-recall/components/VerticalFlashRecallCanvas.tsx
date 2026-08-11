'use client'

import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'

// Vertical Flash Recall & Retention Sprint™ — a distinct third RSVP
// mechanic in this app, deliberately different from both existing
// vertical modes:
//   - Vertical Chunk Sliding / Vertical Word Reading stream text past a
//     fixed viewport with continuous motion — the text moves, the eye
//     stays still.
//   - Horizontal Flash Recall Sprint flashes one word at a single fixed
//     point — nothing moves at all, not even between words.
// This mode instead flashes one word at a time (true RSVP, no motion —
// nothing slides or fades between positions), but the flash *location*
// cycles top-to-bottom through a fixed column of slots, wrapping back to
// the top after the last one. That's the whole point: it deliberately
// trains the eye to make fast, predictable vertical jumps between known
// positions — "vertical eye-span" — rather than training it to stay
// perfectly still (the horizontal sibling's goal) or to track smooth
// motion (the sliding modes' goal).
const SLOT_COUNT = 5
const SLOT_HEIGHT_PX = 72
const SLOT_GAP_PX = 14
const CARD_WIDTH_PX = 640
const CARD_HEIGHT_PX = SLOT_HEIGHT_PX * SLOT_COUNT + SLOT_GAP_PX * (SLOT_COUNT - 1)

// Responsive, unlike a fixed pixel width: on a narrow phone viewport the
// card itself renders far narrower than its 640px desktop maxWidth (see
// ReadingLayout's own padding), and a fixed-width row wider than the
// card would overflow and get clipped by the card's own overflow-hidden
// — losing the left-edge dot markers entirely on mobile. These shrink in
// lockstep with the font size below so the whole row's natural width
// always fits comfortably inside the card at every breakpoint.
const GUTTER_WIDTH_CLASS_NAME = 'w-5 sm:w-6 md:w-7'
const ZONE_WIDTH_CLASS_NAME = 'w-[110px] sm:w-[160px] md:w-[200px]'
// A fixed width, not just shrink-0, so an empty (inactive) slot occupies
// the exact same footprint as one showing a pivot character — otherwise
// a row's natural width would subtly change the instant it goes from
// inactive to active, which could nudge the flanking zones (and the
// pivot itself) by a pixel or two depending on how flexbox resolves
// stretch-alignment across sibling rows. Fixed width makes every row's
// layout identical regardless of active state, so the pivot is at the
// exact same X on every row, every time, with zero exceptions.
const PIVOT_WIDTH_CLASS_NAME = 'w-[26px] sm:w-[32px] md:w-[40px]'
const WORD_TEXT_CLASS_NAME = 'text-2xl sm:text-3xl md:text-4xl font-bold whitespace-nowrap'

const ENGINE_TICK_MS = 100

// Same literal high-contrast palette as Flash Recall Sprint / Vertical
// Chunk Sliding (own-copy, not a shared import — see those files' own
// comments on why these are static literal Tailwind classes).
const CARD_CLASS_NAME = 'bg-[#FBF9F4] dark:bg-[#16171A]'
const WORD_TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

// Own-copy of FlashRecallSprintCanvas.tsx's identical Optimal Recognition
// Point heuristic — even though the flash position itself cycles
// vertically here, each word within its slot still gets the same
// horizontal fixation-point treatment, so the only thing the eye ever has
// to do is jump to a known row; it never has to hunt left-right too.
function computeOrpIndex(word: string): number {
  const length = word.length
  if (length <= 1) return 0
  if (length <= 5) return 1
  if (length <= 9) return 2
  if (length <= 13) return 3
  return 4
}

// The exact tuned drone recipe every sibling exercise this session
// established (own-copy) — a full octave down from the original Brain
// Gym recipe, heavily low-passed, quiet at rest, slow to fade in/out.
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

type VerticalFlashRecallCanvasProps = {
  words: readonly string[]
  currentUnitIndex: number
  isPaused: boolean
  liveWpm: number
  targetWpm: number
  elapsedMs: number
  progressPercent: number
  categoryLabel: string | null
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onFinish: () => void
  onExit: () => void
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

export function VerticalFlashRecallCanvas({
  words,
  currentUnitIndex,
  isPaused,
  liveWpm,
  targetWpm,
  elapsedMs,
  progressPercent,
  categoryLabel,
  onPause,
  onResume,
  onRestart,
  onFinish,
  onExit,
}: VerticalFlashRecallCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)

  // The word actually flashing right now — own-copy of
  // FlashRecallSprintCanvas.tsx's identical precise rAF-interpolated
  // index (see that file's doc comment for the full rationale: the
  // locked useReadingRuntime only updates its own index on a 100ms tick
  // boundary, precise enough for streaming motion but not for a discrete
  // flash moment).
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const displayedIndexRef = useRef(0)

  const lastEngineElapsedMsRef = useRef(elapsedMs)
  const lastEngineTickAtRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  useEffect(() => {
    lastEngineElapsedMsRef.current = elapsedMs
    lastEngineTickAtRef.current = performance.now()
  }, [elapsedMs])

  const isPausedRef = useRef(isPaused)
  const targetWpmRef = useRef(targetWpm)
  const currentUnitIndexRef = useRef(currentUnitIndex)
  isPausedRef.current = isPaused
  targetWpmRef.current = targetWpm
  currentUnitIndexRef.current = currentUnitIndex

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedIndex(currentUnitIndex)
      return
    }

    let rafId: number

    function tick(): void {
      const perWordDwellMs = 60000 / targetWpmRef.current
      const interpolatedElapsedMs = isPausedRef.current
        ? lastEngineElapsedMsRef.current
        : lastEngineElapsedMsRef.current + Math.min(performance.now() - lastEngineTickAtRef.current, ENGINE_TICK_MS)
      const expectedIndex = Math.max(0, Math.min(Math.floor(interpolatedElapsedMs / perWordDwellMs), words.length - 1))

      if (expectedIndex !== displayedIndexRef.current) {
        displayedIndexRef.current = expectedIndex
        setDisplayedIndex(expectedIndex)
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [words.length, prefersReducedMotion, currentUnitIndex])

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

  const clampedProgress = Math.min(100, Math.max(0, progressPercent))
  const isWarmingUp = elapsedMs < 1_500

  const currentWord = words[displayedIndex] ?? ''
  const orpIndex = computeOrpIndex(currentWord)
  const prefix = currentWord.slice(0, orpIndex)
  const pivotChar = currentWord.charAt(orpIndex)
  const suffix = currentWord.slice(orpIndex + 1)
  const activeSlotIndex = displayedIndex % SLOT_COUNT

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={onExit}>
      <div className="w-full max-w-md">
        <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Vertical Flash Recall &amp; Retention Sprint™</p>
        {categoryLabel && <p className="mb-3 text-center text-xs text-muted-foreground">Reading: {categoryLabel}</p>}

        <div className="grid grid-cols-3 gap-x-4 text-center">
          <ReadingStatTile label="Reading Pace" value={isWarmingUp ? 'Warming up…' : `${Math.round(animatedWpm)} wpm`} />
          <ReadingStatTile label="Target WPM" value={String(targetWpm)} />
          <ReadingStatTile label="Elapsed" value={formatElapsedTime(elapsedMs)} />
        </div>

        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className={`h-full rounded-full bg-foreground/80 ${prefersReducedMotion ? '' : 'transition-[width] duration-300 ease-out'}`}
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-[10px] font-medium tabular-nums text-muted-foreground">{clampedProgress}%</p>
        </div>
      </div>

      {/* The vertical flash column — 5 fixed slots, always visible as a
          faint dot column, so the eye can see the whole structure and
          anticipate the next flash position. Exactly one slot is ever lit
          with a word at a time; the rest sit empty. The lit slot cycles
          top-to-bottom, wrapping back to the top, at the WPM-paced dwell
          of a real RSVP word. */}
      <div
        className={`relative mx-auto mt-8 flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
        style={{ maxWidth: CARD_WIDTH_PX, height: CARD_HEIGHT_PX }}
        aria-live="off"
      >
        <div className="flex flex-col" style={{ gap: SLOT_GAP_PX }}>
          {Array.from({ length: SLOT_COUNT }, (_, slotIndex) => {
            const isActive = slotIndex === activeSlotIndex
            return (
              <div key={slotIndex} className="flex items-center justify-center" style={{ height: SLOT_HEIGHT_PX }}>
                <div className={`flex shrink-0 items-center justify-center ${GUTTER_WIDTH_CLASS_NAME}`}>
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full transition-colors ${isActive ? 'bg-red-500 dark:bg-red-400' : 'bg-foreground/15'}`}
                  />
                </div>
                <span
                  className={`${WORD_TEXT_CLASS_NAME} ${WORD_TEXT_COLOR_CLASS_NAME} ${ZONE_WIDTH_CLASS_NAME} block shrink-0 overflow-visible text-right`}
                >
                  {isActive ? prefix : ''}
                </span>
                <span className={`${WORD_TEXT_CLASS_NAME} ${PIVOT_WIDTH_CLASS_NAME} block shrink-0 text-center text-red-500 dark:text-red-400`}>
                  {isActive ? pivotChar : ''}
                </span>
                <span
                  className={`${WORD_TEXT_CLASS_NAME} ${WORD_TEXT_COLOR_CLASS_NAME} ${ZONE_WIDTH_CLASS_NAME} block shrink-0 overflow-visible text-left`}
                >
                  {isActive ? suffix : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        {isPaused ? (
          <button onClick={onResume} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Resume
          </button>
        ) : (
          <button onClick={onPause} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Pause
          </button>
        )}
        <button onClick={onRestart} className={SECONDARY_TEXT_BUTTON_CLASSES}>
          Restart
        </button>
        <button onClick={onFinish} className={SECONDARY_TEXT_BUTTON_CLASSES}>
          Finish
        </button>
      </div>
    </ReadingLayout>
  )
}

const PRIMARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
