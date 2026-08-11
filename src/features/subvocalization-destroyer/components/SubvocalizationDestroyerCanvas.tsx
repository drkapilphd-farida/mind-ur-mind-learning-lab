'use client'

import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'

// True RSVP (Rapid Serial Visual Presentation) at ultra-high speed — own-
// copy of Flash Recall & Retention Sprint's proven engine
// (FlashRecallSprintCanvas.tsx), the exercise this app already validated
// True RSVP + ORP on. Exactly one word occupies the focus box at a time,
// strictly paced by the WPM timer, with zero positional motion of any
// kind. What's genuinely different here is the pace: 600-1200 WPM is fast
// enough (50-100ms per word) that inner speech physically cannot keep up
// with the visual stream, which is the entire point — subvocalization
// requires "hearing" each word internally, and that takes longer than the
// eye needs to simply recognize it, so pushing the pace past that gap
// forces genuine visual-to-meaning processing.
const FOCUS_BOX_HEIGHT_PX = 220
const FOCUS_ZONE_WIDTH_PX = 230
// The pivot character itself is NOT monospace — an 'i' and a 'W' render at
// very different glyph widths at text-5xl. Left as auto-width, the whole
// three-span row's total width would shift per word, and since the parent
// centers that row as a group, the fixed-width flanking zones would drift
// right along with it — exactly the 0px-drift guarantee this component
// exists to provide. Giving the pivot its own fixed, centered width makes
// total row width (and therefore the row's center, and therefore every
// zone's absolute position) genuinely constant regardless of content. Sized
// comfortably wider than the broadest bold glyph at this font size.
const PIVOT_ZONE_WIDTH_PX = 56
const WORD_TEXT_CLASS_NAME = 'text-5xl font-bold whitespace-nowrap'

const ENGINE_TICK_MS = 100

// Cinematic Reader palette — the frosted-glass card every sibling Reading
// Mode built this session shares (own-copy, not a shared import) — a
// deliberate upgrade from Flash Recall Sprint's own solid card, per this
// exercise's explicit "frosted-glass focus framing" spec.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'
const WORD_TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

// The Optimal Recognition Point (ORP) — the classic RSVP technique (the
// same one Spritz popularized) for genuinely keeping the eyes locked on
// one fixed point regardless of word length. Simply centering each whole
// word is NOT enough: a 3-letter word and a 12-letter word have different
// visual centers of mass, so the eye still has to hunt slightly for each
// new word. Instead, one pivot character near the start of the word is
// aligned to the exact same on-screen X position every single time — the
// text before it right-aligns toward that point, the text after it
// left-aligns away from it, both in fixed-width zones so the pivot itself
// never moves a pixel between words — 0px horizontal drift, verified live
// via this exercise's own end-to-end check. Values and zone width are
// unchanged from Flash Recall Sprint's own tuning, since this exercise
// reads the exact same shared word content, already proven safe against
// these exact widths.
function computeOrpIndex(word: string): number {
  const length = word.length
  if (length <= 1) return 0
  if (length <= 5) return 1
  if (length <= 9) return 2
  if (length <= 13) return 3
  return 4
}

// The exact tuned Dynamic/Vertical Chunk Sliding drone recipe (own-copy) —
// a full octave down from the original Brain Gym recipe, heavily low-
// passed, quiet at rest, slow to fade in/out.
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

type SubvocalizationDestroyerCanvasProps = {
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

export function SubvocalizationDestroyerCanvas({
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
}: SubvocalizationDestroyerCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)

  // The word actually on screen right now. Driven by a dedicated rAF loop
  // below rather than reading currentUnitIndex directly — the locked
  // useReadingRuntime only updates its own index on a 100ms tick boundary,
  // which at 600-1200 WPM (50-100ms per word) is not fine-grained enough
  // for the swap moment itself to land accurately — this projects forward
  // from the last real tick using performance.now(), exactly like Flash
  // Recall Sprint's own proven pattern, just under a much tighter budget.
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

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={onExit}>
      <div className="w-full max-w-md">
        <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Subvocalization Destroyer™</p>
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

      {/* The RSVP focus box — one word, one fixed point, zero motion. The
          ORP pivot character (highlighted in red) lands at the exact same
          X position for every word, regardless of length, via two
          fixed-width zones flanking it (see computeOrpIndex above) — not
          simple whole-word centering, which would still make the eye hunt
          slightly for each new word. */}
      <div
        className={`relative mx-auto mt-8 flex w-full items-center justify-center overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
        style={{ maxWidth: 640, height: FOCUS_BOX_HEIGHT_PX }}
        aria-live="off"
      >
        {/* Fixation guide ticks — a subtle, purely decorative marker above
            and below the pivot point, the same convention real RSVP
            readers use to help the eye settle exactly there. */}
        <div aria-hidden="true" className="absolute top-6 h-3 w-px bg-foreground/20" />
        <div aria-hidden="true" className="absolute bottom-6 h-3 w-px bg-foreground/20" />

        <div className="flex items-center">
          <span
            data-orp-role="prefix"
            className={`${WORD_TEXT_CLASS_NAME} ${WORD_TEXT_COLOR_CLASS_NAME} block overflow-visible text-right`}
            style={{ width: FOCUS_ZONE_WIDTH_PX, flexShrink: 0 }}
          >
            {prefix}
          </span>
          <span
            data-orp-role="pivot"
            className={`${WORD_TEXT_CLASS_NAME} block shrink-0 text-center text-red-500 dark:text-red-400`}
            style={{ width: PIVOT_ZONE_WIDTH_PX, flexShrink: 0 }}
          >
            {pivotChar}
          </span>
          <span
            data-orp-role="suffix"
            className={`${WORD_TEXT_CLASS_NAME} ${WORD_TEXT_COLOR_CLASS_NAME} block overflow-visible text-left`}
            style={{ width: FOCUS_ZONE_WIDTH_PX, flexShrink: 0 }}
          >
            {suffix}
          </span>
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
