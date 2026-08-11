'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { measureWrappedWordYCentersPx } from '@/hooks/reading-engine/measureWrappedWordYCenters'
import { computeUnitDwellMs } from '@/features/reading-engine/readingMetrics'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import type { ReadingUnit } from '@/features/reading-engine/types'
import type { ParagraphReadingWidth, ParagraphFontSize } from './ParagraphReadingModeSettings'

// Vertical Infinite Paragraph Stream — the genuinely cinematic piece of
// this overhaul: unlike every other streaming Reading Mode in this app
// (which show one discrete unit centered per fixed-height row), a
// paragraph naturally wraps across several lines, so this Canvas scrolls
// the REAL, naturally-wrapped multi-line text continuously upward, like an
// actual teleprompter or end-credits crawl. That real per-word Y position
// depends on the exact width/font the text renders at, which is why this
// Canvas leans on the measureWrappedWordYCentersPx utility (own hidden-
// probe measurement, mirroring measureSingleLineWidthsPx's own established
// pattern) rather than any fixed-row arithmetic.
//
// Butter-Smooth Motion Fix — the first version of this crawl interpolated
// only between the *previous* and *current* word's own measured Y-center.
// Since many consecutive words share an identical Y (same line), that
// produced long stretches of literally zero on-screen motion, then a
// sudden whole-line jump compressed into one word's short dwell window —
// real, measured jerk, not smooth crawling at all. A true teleprompter
// instead scrolls at one constant velocity for the *entire* passage; see
// computeConstantVelocityOffsetPx's own doc comment (own-copy, identical
// to the horizontal Canvas's).
const CHANNEL_WIDTH_PX: Record<ParagraphReadingWidth, number> = {
  compact: 560,
  comfortable: 720,
  wide: 900,
}

const CHANNEL_HORIZONTAL_PADDING_PX = 40

const FONT_SIZE_STYLE: Record<ParagraphFontSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 20, lineHeight: 34 },
  medium: { fontSize: 24, lineHeight: 40 },
  large: { fontSize: 30, lineHeight: 48 },
}

// How many lines of the wrapped passage stay visible inside the frosted
// window at once — enough to show real context (a line just read, the
// current line, a line still coming) without turning into an unreadably
// tall page-filling block.
const VISIBLE_LINES = 5

const ENGINE_TICK_MS = 100
const HAPTIC_TRANSITION_MS = 10
const CHROME_AUTO_HIDE_DELAY_MS = 2_200

// Same frosted-glass palette as the horizontal Canvas (own-copy), with the
// gradient mask now on the top/bottom axis — a soft cinematic vignette
// where lines dissolve as they scroll in from below and out above, rather
// than a hard cut.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'
const CARD_MASK_IMAGE = 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)'
const TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

// The exact tuned drone recipe every sibling exercise in this app
// establishes (own-copy).
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

type ParagraphReadingModeVerticalCanvasProps = {
  units: readonly ReadingUnit[]
  currentUnitIndex: number
  readingWidth: ParagraphReadingWidth
  fontSize: ParagraphFontSize
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

// Own-copy of the horizontal Canvas's identical constant-velocity formula
// — see that file's own doc comment for the full rationale. `startOffsetPx`
// is the first word's Y-center, `endOffsetPx` the last word's, so the
// whole passage crawls upward at one steady, sub-pixel rate for its
// entire duration with zero per-line stepping.
function computeConstantVelocityOffsetPx(startOffsetPx: number, endOffsetPx: number, totalDurationMs: number, elapsedMs: number): number {
  if (totalDurationMs <= 0) return startOffsetPx
  const fraction = Math.min(Math.max(elapsedMs / totalDurationMs, 0), 1)
  return startOffsetPx + (endOffsetPx - startOffsetPx) * fraction
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

export function ParagraphReadingModeVerticalCanvas({
  units,
  currentUnitIndex,
  readingWidth,
  fontSize,
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
}: ParagraphReadingModeVerticalCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)
  const channelWidth = CHANNEL_WIDTH_PX[readingWidth]
  const textWrapWidth = channelWidth - CHANNEL_HORIZONTAL_PADDING_PX * 2
  const { fontSize: fontSizePx, lineHeight } = FONT_SIZE_STYLE[fontSize]
  const channelHeight = lineHeight * VISIBLE_LINES
  const textClassName = TEXT_COLOR_CLASS_NAME

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

  // Real, per-word vertical centers within the naturally-wrapped passage —
  // measured against a hidden probe sharing the exact width/font/style the
  // text below actually renders with (see measureWrappedWordYCentersPx's
  // own doc comment).
  const [wordYCenters, setWordYCenters] = useState<number[] | null>(null)
  useLayoutEffect(() => {
    setWordYCenters(
      measureWrappedWordYCentersPx(
        units.map((unit) => unit.text),
        textWrapWidth,
        '',
        { fontSize: `${fontSizePx}px`, lineHeight: `${lineHeight}px`, fontWeight: '600' },
      ),
    )
  }, [units, textWrapWidth, fontSizePx, lineHeight])

  // The single constant-velocity duration for the whole passage — the sum
  // of every word's own uniform dwell time, exactly matching how long the
  // engine itself expects the full read to take at this target pace.
  const totalDurationMs = useMemo(
    () => units.reduce((sum, unit) => sum + computeUnitDwellMs(unit.text, targetWpm), 0),
    [units, targetWpm],
  )

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
  const totalDurationMsRef = useRef(totalDurationMs)
  currentUnitIndexRef.current = currentUnitIndex
  targetWpmRef.current = targetWpm
  isPausedRef.current = isPaused
  totalDurationMsRef.current = totalDurationMs

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

  // The actual motion — a dedicated rAF loop writing translateY straight to
  // the track element via a ref, once real per-word Y-centers are known.
  // Every frame recomputes a fresh constant-velocity offset directly from
  // elapsed time — there is no per-line branch left to hold or jump on, so
  // this is structurally incapable of freezing or bursting (see
  // computeConstantVelocityOffsetPx's own doc comment).
  useEffect(() => {
    if (wordYCenters === null || wordYCenters.length === 0) return undefined

    const centers = wordYCenters
    const startOffsetPx = centers[0] ?? 0
    const endOffsetPx = centers[centers.length - 1] ?? 0
    let rafId: number

    function tick(): void {
      const track = trackRef.current
      if (track) {
        const offsetPx = prefersReducedMotion
          ? (centers[currentUnitIndexRef.current] ?? 0)
          : isPausedRef.current
            ? computeConstantVelocityOffsetPx(startOffsetPx, endOffsetPx, totalDurationMsRef.current, lastEngineElapsedMsRef.current)
            : computeConstantVelocityOffsetPx(
                startOffsetPx,
                endOffsetPx,
                totalDurationMsRef.current,
                lastEngineElapsedMsRef.current + Math.min(performance.now() - lastEngineTickAtRef.current, ENGINE_TICK_MS),
              )
        track.style.transform = `translate3d(0, -${offsetPx}px, 0)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [wordYCenters, prefersReducedMotion])

  const clampedProgress = Math.min(100, Math.max(0, progressPercent))
  const isWarmingUp = elapsedMs < 1_500
  const chromeClassName = `transition-opacity duration-500 ease-out ${isChromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`

  return (
    <ReadingLayout maxWidthClassName="max-w-4xl" onExit={onExit}>
      <div
        className="flex w-full flex-col items-center"
        onPointerMove={revealChromeAndScheduleHide}
        onTouchStart={revealChromeAndScheduleHide}
        onFocus={revealChromeAndScheduleHide}
      >
        <div className={`w-full max-w-md ${chromeClassName}`}>
          <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Paragraph Reading Mode™ · Vertical</p>
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

        {/* The cinematic teleprompter crawl — a fixed-height window
            (overflow-hidden) showing several lines of the real,
            naturally-wrapped passage, gradient-masked top/bottom so lines
            dissolve in and out rather than clipping hard. `maxWidth` +
            `w-full` (not a literal `width`) so it shrinks safely on narrow
            viewports. */}
        <div
          className={`relative mx-auto mt-8 w-full overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
          style={{
            maxWidth: channelWidth,
            height: channelHeight,
            visibility: wordYCenters === null ? 'hidden' : 'visible',
            WebkitMaskImage: CARD_MASK_IMAGE,
            maskImage: CARD_MASK_IMAGE,
          }}
          aria-live="off"
        >
          <div
            ref={trackRef}
            className="absolute will-change-transform"
            style={{
              top: '50%',
              left: CHANNEL_HORIZONTAL_PADDING_PX,
              width: textWrapWidth,
              fontSize: fontSizePx,
              lineHeight: `${lineHeight}px`,
              fontWeight: 600,
            }}
          >
            {units.map((unit) => (
              <span key={unit.id} className={textClassName}>
                {unit.text}{' '}
              </span>
            ))}
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
