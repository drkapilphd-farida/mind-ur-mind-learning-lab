'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { measureSingleLineWidthsPx } from '@/hooks/reading-engine/measureSingleLineWidths'
import { computeUnitDwellMs } from '@/features/reading-engine/readingMetrics'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import type { ReadingUnit } from '@/features/reading-engine/types'
import type { ParagraphReadingWidth, ParagraphFontSize } from './ParagraphReadingModeSettings'

// "How much of the cinematic line is visible" — applied as a `maxWidth` on
// a `w-full` element (not a literal `width`) so it shrinks safely on
// narrow viewports instead of forcing horizontal page overflow.
const CHANNEL_WIDTH_PX: Record<ParagraphReadingWidth, number> = {
  compact: 420,
  comfortable: 620,
  wide: 860,
}

const LINE_HEIGHT_PX = 72

// Responsive per tier, same rationale as every other streaming Canvas in
// this app's Reading Modes family — the top breakpoint value is the
// tier's "true" desktop size; smaller breakpoints keep the longest real
// words safely inside the channel on narrow mobile viewports.
const FONT_SIZE_TEXT_CLASSES: Record<ParagraphFontSize, string> = {
  small: 'text-xl sm:text-2xl md:text-3xl font-semibold whitespace-nowrap',
  medium: 'text-2xl sm:text-3xl md:text-4xl font-semibold whitespace-nowrap',
  large: 'text-3xl sm:text-4xl md:text-5xl font-semibold whitespace-nowrap',
}

const UNIT_GAP_PX = 48
const ENGINE_TICK_MS = 100
const HAPTIC_TRANSITION_MS = 10
const CHROME_AUTO_HIDE_DELAY_MS = 2_200

// Cinematic Reader Sprint — the frosted-glass palette every sibling Reading
// Mode in this app shares (own-copy, not a shared import), plus a soft
// left/right gradient mask on this axis (Vertical Canvas uses the same
// treatment on the top/bottom axis instead) — the card's own pixels fade
// to transparent at its horizontal edges rather than clipping hard, so
// words visibly dissolve in and out of the channel instead of popping.
// `WebkitMaskImage` is required alongside the standard `maskImage` for
// broad engine support; both target the exact same gradient.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'
const CARD_MASK_IMAGE = 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)'
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

type ParagraphReadingModeCanvasProps = {
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

// Butter-Smooth Motion Fix — own-copy pure function (paragraph-mode-
// specific, not the shared computeContinuousStreamOffsetPx every sibling
// Reading Mode still correctly uses for their own, far-fewer/longer-
// dwelling units). That shared utility interpolates only between the
// *previous* and *current* unit's own offset — fine when a unit's dwell
// spans real, perceptible seconds, but this mode's units are single words
// with a uniform, very short dwell (60000/targetWpm ms each, constant
// regardless of word length). Live profiling showed that model producing
// long runs of literally zero on-screen motion punctuated by sudden
// multi-pixel-per-frame catch-up bursts at every word boundary — real,
// measurable jerk, not a perception issue. A true cinematic ticker instead
// needs one single constant velocity for the *entire* passage: this maps
// elapsed time linearly across the full first-word-to-last-word distance,
// so every rAF frame advances by a small, steady, sub-pixel amount with
// zero per-word stepping. `currentUnitIndex` from the engine still drives
// stats/progress/haptics/completion untouched — only the visual offset
// changes.
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

// Horizontal Flow — the cinematic replacement for this mode's old plain
// text box and hopping highlight (see this file's pre-overhaul history):
// instead of a static, fully-visible paragraph with a background box
// jumping between words, the whole passage glides continuously through a
// frosted-glass, gradient-masked channel at one constant velocity (see
// computeConstantVelocityOffsetPx's own doc comment for why this mode
// needed its own motion formula rather than the shared per-unit one).
// Still uses measureSingleLineWidthsPx (imported unmodified) for each
// word's true rendered width, since the constant-velocity distance is
// still measured against real layout, not an estimate.
export function ParagraphReadingModeCanvas({
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
}: ParagraphReadingModeCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)
  const channelWidth = CHANNEL_WIDTH_PX[readingWidth]
  const textClassName = FONT_SIZE_TEXT_CLASSES[fontSize]

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
  }, [units, fontSize])

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

  // The actual motion — a dedicated rAF loop, started once real widths are
  // known and re-created only if the unit list, font size, or reduced-
  // motion preference itself changes. Every frame recomputes a fresh
  // constant-velocity offset directly from elapsed time — there is no
  // per-word branch left to step or stall on, so this is structurally
  // incapable of freezing or bursting (see computeConstantVelocityOffsetPx's
  // own doc comment).
  useEffect(() => {
    if (unitWidths === null || cumulativeCenters.length === 0) return undefined

    const startOffsetPx = cumulativeCenters[0] ?? 0
    const endOffsetPx = cumulativeCenters[cumulativeCenters.length - 1] ?? 0
    let rafId: number

    function tick(): void {
      const track = trackRef.current
      if (track) {
        const offsetPx = prefersReducedMotion
          ? (cumulativeCenters[currentUnitIndexRef.current] ?? 0)
          : isPausedRef.current
            ? computeConstantVelocityOffsetPx(startOffsetPx, endOffsetPx, totalDurationMsRef.current, lastEngineElapsedMsRef.current)
            : computeConstantVelocityOffsetPx(
                startOffsetPx,
                endOffsetPx,
                totalDurationMsRef.current,
                lastEngineElapsedMsRef.current + Math.min(performance.now() - lastEngineTickAtRef.current, ENGINE_TICK_MS),
              )
        track.style.transform = `translate3d(-${offsetPx}px, 0, 0)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
    // cumulativeCenters is derived from unitWidths, which IS a dependency
    // — omitting it here is deliberate, not stale: it's read fresh via
    // startOffsetPx/endOffsetPx captured once per effect run, which is
    // exactly when cumulativeCenters itself last changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitWidths, prefersReducedMotion])

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
          <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Paragraph Reading Mode™ · Horizontal</p>
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

        {/* The cinematic focus channel — a marquee the track can never wrap
            out of (whitespace-nowrap per word + overflow-hidden on the
            frame), gradient-masked at its left/right edges so words
            visibly dissolve in and out rather than popping. `maxWidth` +
            `w-full` (not a literal `width`) so it shrinks safely on narrow
            viewports instead of overflowing. */}
        <div
          className={`relative mx-auto mt-8 w-full overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
          style={{
            maxWidth: channelWidth,
            height: LINE_HEIGHT_PX,
            visibility: unitWidths === null ? 'hidden' : 'visible',
            WebkitMaskImage: CARD_MASK_IMAGE,
            maskImage: CARD_MASK_IMAGE,
          }}
          aria-live="off"
        >
          <div
            ref={trackRef}
            className="absolute top-0 flex h-full items-center will-change-transform"
            style={{ left: '50%', gap: UNIT_GAP_PX }}
          >
            {units.map((unit) => (
              <span key={unit.id} className={`${textClassName} ${TEXT_COLOR_CLASS_NAME}`}>
                {unit.text}
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
