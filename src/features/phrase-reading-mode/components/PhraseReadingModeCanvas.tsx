'use client'

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { computeContinuousStreamOffsetPx } from '@/hooks/reading-engine/continuousStreamOffset'
import { measureSingleLineWidthsPx } from '@/hooks/reading-engine/measureSingleLineWidths'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import type { ReadingUnit } from '@/features/reading-engine/types'
import type { PhraseSize } from './PhraseReadingModeSettings'

// Fixed viewport width per PhraseSize — "how much of the flowing single
// line is visible," not a per-unit column width. Applied as a `maxWidth`
// on a `w-full` element (not a literal `width`) so it shrinks safely on
// narrow viewports instead of forcing horizontal page overflow.
const PHRASE_VIEWPORT_WIDTH_PX: Record<PhraseSize, number> = {
  small: 420,
  medium: 620,
  large: 1040,
}

// A single fixed line height per PhraseSize, independent of width — since
// no wrapping is ever allowed, height only needs to fit one line at that
// size's own font size.
const PHRASE_LINE_HEIGHT_PX: Record<PhraseSize, number> = {
  small: 56,
  medium: 76,
  large: 108,
}

// Responsive per tier — not a fixed size — so even the longest real phrase
// chunks in the dataset (up to 4 words) stay within the card on narrow
// mobile viewports at every PhraseSize; the top breakpoint value is the
// tier's "true" desktop size, matching what the size picker visually
// promises there. measureSingleLineWidthsPx below measures against
// whichever breakpoint is actually active in the real viewport, so the
// glide math always matches what's rendered.
const PHRASE_SIZE_TEXT_CLASSES: Record<PhraseSize, string> = {
  small: 'text-lg sm:text-xl md:text-2xl font-semibold whitespace-nowrap',
  medium: 'text-2xl sm:text-3xl md:text-4xl font-semibold whitespace-nowrap',
  large: 'text-4xl sm:text-5xl md:text-6xl font-semibold whitespace-nowrap',
}

// Real horizontal gap between consecutive phrases on the track.
const UNIT_GAP_PX = 64

// The engine's own tick (see useReadingRuntime.ts, unmodified/locked) only
// updates elapsedMs in discrete 100ms jumps. This local interpolation
// bridges those jumps into a genuinely continuous, 60fps-smooth motion:
// each rAF frame projects forward from the last real tick by real wall-
// clock time elapsed since it landed, capped at one tick's worth so it can
// never overshoot past where the next real tick will likely arrive.
const ENGINE_TICK_MS = 100
const HAPTIC_TRANSITION_MS = 10
const CHROME_AUTO_HIDE_DELAY_MS = 2_200

// A spacious, high-contrast "frosted glass" card — the same palette
// established across this app's reading exercises (own-copy, not a
// shared import), a touch of translucency and backdrop blur layered on
// top, matching Vertical Word Reading / Vertical Flash Recall's identical
// treatment.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'
const PHRASE_TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

// The exact tuned drone recipe every sibling exercise in this app
// establishes (own-copy) — a full octave down from the original Brain Gym
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

type PhraseReadingModeCanvasProps = {
  units: readonly ReadingUnit[]
  currentUnitIndex: number
  phraseSize: PhraseSize
  categoryLabel: string | null
  isPaused: boolean
  liveWpm: number
  targetWpm: number
  elapsedMs: number
  progressPercent: number
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

// Horizontal Phrase Flow — a 10/10 rebuild of the sliding channel itself.
// Still the same "no dimming, one continuous linear transform" streaming
// model (measureSingleLineWidthsPx for each phrase's true rendered width,
// computeContinuousStreamOffsetPx for the shared frame-by-frame glide math
// — both imported unmodified, shared across every horizontal-streaming
// Reading Mode in this app) — every phrase still renders at full
// opacity/foreground at all times, nothing fades or dims, ever. What
// changed is HOW that transform reaches the screen: it used to flow
// through React state → an inline `transform` style → a CSS `transition:
// 100ms linear`, re-triggered every engine tick — approximate, not
// frame-synced, and visibly stutter-prone under any surrounding jank. Now
// a dedicated requestAnimationFrame loop writes `translate3d` straight to
// the track element via a ref, every real display frame, completely
// bypassing React re-renders for the motion itself.
// Stutter fix — isolates the full phrase list from the 10Hz elapsedMs
// tick driving the rest of this component; see VerticalWordReadingCanvas's
// identical TrackWords for the full rationale. Only re-renders when
// `units`/`textClassName` themselves change (once per session/settings
// choice), not on every reading-engine tick.
const TrackWords = memo(function TrackWords({ units, textClassName }: { units: readonly ReadingUnit[]; textClassName: string }): React.JSX.Element {
  return (
    <>
      {units.map((unit) => (
        <span key={unit.id} className={`${textClassName} ${PHRASE_TEXT_COLOR_CLASS_NAME}`}>
          {unit.text}
        </span>
      ))}
    </>
  )
})

export function PhraseReadingModeCanvas({
  units,
  currentUnitIndex,
  phraseSize,
  categoryLabel,
  isPaused,
  liveWpm,
  targetWpm,
  elapsedMs,
  progressPercent,
  onPause,
  onResume,
  onRestart,
  onFinish,
  onExit,
}: PhraseReadingModeCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)
  const viewportWidth = PHRASE_VIEWPORT_WIDTH_PX[phraseSize]
  const lineHeight = PHRASE_LINE_HEIGHT_PX[phraseSize]
  const textClassName = PHRASE_SIZE_TEXT_CLASSES[phraseSize]

  // Zero-distraction focus mode: header stats/progress/controls fade out
  // after pointer inactivity while running, leaving only the flowing
  // phrases — any pointer movement (or pausing) brings them straight back.
  const [isChromeVisible, setIsChromeVisible] = useState(true)
  const chromeHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function revealChromeAndScheduleHide(): void {
    setIsChromeVisible(true)
    if (chromeHideTimeoutRef.current) clearTimeout(chromeHideTimeoutRef.current)
    if (!isPaused) {
      chromeHideTimeoutRef.current = setTimeout(() => setIsChromeVisible(false), CHROME_AUTO_HIDE_DELAY_MS)
    }
  }

  useEffect(() => {
    revealChromeAndScheduleHide()
    return () => {
      if (chromeHideTimeoutRef.current) clearTimeout(chromeHideTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused])

  const [unitWidths, setUnitWidths] = useState<number[] | null>(null)
  useLayoutEffect(() => {
    setUnitWidths(measureSingleLineWidthsPx(units.map((unit) => unit.text), textClassName))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, phraseSize])

  const cumulativeCenters = useMemo(() => {
    if (!unitWidths) return []
    const centers: number[] = []
    let cursor = 0
    for (const width of unitWidths) {
      centers.push(cursor + width / 2)
      cursor += width + UNIT_GAP_PX
    }
    return centers
  }, [unitWidths])

  const trackRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])
  const lastHapticUnitIndexRef = useRef(0)

  const lastEngineElapsedMsRef = useRef(elapsedMs)
  const lastEngineTickAtRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  useEffect(() => {
    lastEngineElapsedMsRef.current = elapsedMs
    lastEngineTickAtRef.current = performance.now()
  }, [elapsedMs])

  const currentUnitIndexRef = useRef(currentUnitIndex)
  const targetWpmRef = useRef(targetWpm)
  const isPausedRef = useRef(isPaused)
  currentUnitIndexRef.current = currentUnitIndex
  targetWpmRef.current = targetWpm
  isPausedRef.current = isPaused

  useEffect(() => {
    if (currentUnitIndex === lastHapticUnitIndexRef.current) return
    lastHapticUnitIndexRef.current = currentUnitIndex
    if (currentUnitIndex === 0) return
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_TRANSITION_MS)
  }, [currentUnitIndex])

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

  // The actual motion — a dedicated rAF loop, started once real widths are
  // known and re-created only if the unit list, size, or reduced-motion
  // preference itself changes.
  useEffect(() => {
    if (unitWidths === null) return undefined

    const offsetForIndex = (index: number): number => cumulativeCenters[index] ?? 0
    let rafId: number

    function tick(): void {
      const track = trackRef.current
      if (track) {
        const offsetPx = prefersReducedMotion
          ? offsetForIndex(currentUnitIndexRef.current)
          : isPausedRef.current
            ? computeContinuousStreamOffsetPx({
                units,
                currentUnitIndex: currentUnitIndexRef.current,
                targetWpm: targetWpmRef.current,
                elapsedMs: lastEngineElapsedMsRef.current,
                offsetForIndex,
              })
            : computeContinuousStreamOffsetPx({
                units,
                currentUnitIndex: currentUnitIndexRef.current,
                targetWpm: targetWpmRef.current,
                elapsedMs:
                  lastEngineElapsedMsRef.current + Math.min(performance.now() - lastEngineTickAtRef.current, ENGINE_TICK_MS),
                offsetForIndex,
              })
        track.style.transform = `translate3d(-${offsetPx}px, 0, 0)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
    // cumulativeCenters is derived from unitWidths, which IS a dependency
    // — omitting it here is deliberate, not stale: it's read fresh via
    // offsetForIndex's own closure on every single frame anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitWidths, units, prefersReducedMotion])

  const clampedProgress = Math.min(100, Math.max(0, progressPercent))
  const isWarmingUp = elapsedMs < 1_500
  const chromeClassName = `transition-opacity duration-500 ease-out ${isChromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`

  return (
    <ReadingLayout maxWidthClassName="max-w-6xl" onExit={onExit}>
      <div
        className="flex w-full flex-col items-center"
        onPointerMove={revealChromeAndScheduleHide}
        onTouchStart={revealChromeAndScheduleHide}
        onFocus={revealChromeAndScheduleHide}
      >
        <div className={`w-full max-w-md ${chromeClassName}`}>
          <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Phrase Reading Mode™ · Horizontal</p>
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

        {/* The single-line focus channel — a marquee the track can never
            wrap out of (whitespace-nowrap per phrase + overflow-hidden on
            the frame). `maxWidth` + `w-full` (not a literal `width`) so it
            shrinks safely on narrow viewports instead of overflowing. */}
        <div
          className={`relative mx-auto mt-8 w-full overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
          style={{
            maxWidth: viewportWidth,
            height: lineHeight,
            visibility: unitWidths === null ? 'hidden' : 'visible',
          }}
          aria-live="off"
        >
          <div
            ref={trackRef}
            className="absolute top-0 flex h-full items-center will-change-transform"
            style={{ left: '50%', gap: UNIT_GAP_PX }}
          >
            <TrackWords units={units} textClassName={textClassName} />
          </div>
        </div>

        <div className={`mt-10 flex flex-wrap items-center justify-center gap-6 ${chromeClassName}`}>
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
      </div>
    </ReadingLayout>
  )
}

const PRIMARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
