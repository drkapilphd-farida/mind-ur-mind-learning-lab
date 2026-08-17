'use client'

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { measureWrappedWordYCentersPx } from '@/hooks/reading-engine/measureWrappedWordYCenters'
import { computeUnitDwellMs } from '@/features/reading-engine/readingMetrics'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import type { ReadingUnit } from '@/features/reading-engine/types'
import type { GuidedParagraphReadingWidth, GuidedParagraphFontSize } from './GuidedParagraphReadingModeSettings'

// "How much of the passage is visible" — the comfort-reading measure, same
// convention as Paragraph Reading Mode.
const READING_WIDTH_PX: Record<GuidedParagraphReadingWidth, number> = {
  compact: 560,
  comfortable: 720,
  wide: 900,
}

const CARD_PADDING_PX = 32

const FONT_SIZE_STYLE: Record<GuidedParagraphFontSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 17, lineHeight: 31 },
  medium: { fontSize: 19, lineHeight: 34 },
  large: { fontSize: 22, lineHeight: 40 },
}

const ENGINE_TICK_MS = 100
const CHROME_AUTO_HIDE_DELAY_MS = 2_200

// Cinematic Reader palette — same frosted-glass card every sibling Reading
// Mode in this app shares (own-copy, not a shared import).
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'
const TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

// The glowing guide bar itself — a soft, saturated glow (own-copy color
// choice, deliberately distinct from the app's neutral foreground/primary
// tokens, since a "glow" reads as a glow specifically because it carries
// real, saturated color rather than a flat neutral tint).
const GLOW_BAR_CLASS_NAME = 'rounded-xl bg-sky-400/15 dark:bg-sky-300/15 ring-1 ring-sky-400/40 dark:ring-sky-300/40'
const GLOW_BAR_BOX_SHADOW = '0 0 28px 6px rgba(56, 189, 248, 0.35), 0 0 8px rgba(56, 189, 248, 0.5)'

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

type GuidedParagraphReadingModeCanvasProps = {
  units: readonly ReadingUnit[]
  currentUnitIndex: number
  readingWidth: GuidedParagraphReadingWidth
  fontSize: GuidedParagraphFontSize
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

// Own-copy of Paragraph Reading Mode's proven constant-velocity formula
// (see that file's own extensive doc comment on why this replaced simple
// adjacent-word/line interpolation) — the guide bar glides at one steady
// rate for the *entire* passage duration, from the first line's Y all the
// way to the last, so it is structurally incapable of the old CSS-
// transition's freeze-then-snap jerk between lines.
function computeConstantVelocityOffsetPx(startOffsetPx: number, endOffsetPx: number, totalDurationMs: number, elapsedMs: number): number {
  if (totalDurationMs <= 0) return startOffsetPx
  const fraction = Math.min(Math.max(elapsedMs / totalDurationMs, 0), 1)
  return startOffsetPx + (endOffsetPx - startOffsetPx) * fraction
}

// Vertical Guided Tracking — the full passage stays completely static and
// fully visible (this mode's own "True Multi-Line Comfort Window"
// signature, unchanged from before this overhaul), while a single glowing
// horizontal bar glides continuously downward through it at one constant,
// sub-pixel velocity for the whole passage — replacing the old mechanical
// grey box (a CSS `transform` transition re-triggered every time the
// engine's line index changed, producing a visible hold-then-jump feel)
// with genuine rAF-driven continuous motion. The bar's own height and
// glow are the only "highlight" — the text underneath never dims, fades,
// or changes brightness, exactly like every sibling Reading Mode.
// Stutter fix — isolates the full paragraph text from the 10Hz elapsedMs
// tick driving the rest of this component; see VerticalWordReadingCanvas's
// identical TrackWords for the full rationale. The moving highlight
// itself is a separate ref-driven element (trackRef, above), unaffected
// by this — only the static word spans move out of the tick-driven tree.
const TrackWords = memo(function TrackWords({ units }: { units: readonly ReadingUnit[] }): React.JSX.Element {
  return (
    <>
      {units.map((unit, index) => (
        <span key={unit.id}>
          {unit.text}
          {index < units.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
})

export function GuidedParagraphReadingModeCanvas({
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
}: GuidedParagraphReadingModeCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)
  const viewportWidth = READING_WIDTH_PX[readingWidth]
  const { fontSize: fontSizePx, lineHeight } = FONT_SIZE_STYLE[fontSize]

  // The card renders at `maxWidth: viewportWidth` + `w-full`, so on a
  // narrow mobile viewport its *real* rendered width is smaller than the
  // desktop tier value above — measuring text wrap against the fixed tier
  // value instead of the real width would silently clip lines mid-
  // sentence once the card actually shrinks. This measures the card's own
  // real clientWidth (valid even while `visibility: hidden`, since layout
  // is still computed) and re-measures on resize, so word positions always
  // match what's actually on screen at the current viewport.
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [measuredWrapWidth, setMeasuredWrapWidth] = useState<number | null>(null)
  useLayoutEffect(() => {
    function measure(): void {
      if (cardRef.current) setMeasuredWrapWidth(cardRef.current.clientWidth - CARD_PADDING_PX * 2)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [viewportWidth])

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
  // text below actually renders with.
  const [wordYCenters, setWordYCenters] = useState<number[] | null>(null)
  useLayoutEffect(() => {
    if (measuredWrapWidth === null) return
    setWordYCenters(
      measureWrappedWordYCentersPx(units.map((unit) => unit.text), measuredWrapWidth, '', {
        fontSize: `${fontSizePx}px`,
        lineHeight: `${lineHeight}px`,
        fontWeight: '400',
      }),
    )
  }, [units, measuredWrapWidth, fontSizePx, lineHeight])

  // The card's own height must fit every line of this passage — computed
  // from the real last measured Y rather than a fixed lookup table, so a
  // longer passage never gets silently clipped.
  const cardHeight = useMemo(() => {
    if (!wordYCenters || wordYCenters.length === 0) return lineHeight * 3 + CARD_PADDING_PX * 2
    const lastY = wordYCenters[wordYCenters.length - 1] ?? 0
    return lastY + lineHeight / 2 + CARD_PADDING_PX * 2
  }, [wordYCenters, lineHeight])

  const totalDurationMs = useMemo(
    () => units.reduce((sum, unit) => sum + computeUnitDwellMs(unit.text, targetWpm), 0),
    [units, targetWpm],
  )

  const trackRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  const lastEngineElapsedMsRef = useRef(elapsedMs)
  const lastEngineTickAtRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  useEffect(() => {
    lastEngineElapsedMsRef.current = elapsedMs
    lastEngineTickAtRef.current = performance.now()
  }, [elapsedMs])

  const currentUnitIndexRef = useRef(currentUnitIndex)
  const isPausedRef = useRef(isPaused)
  const totalDurationMsRef = useRef(totalDurationMs)
  currentUnitIndexRef.current = currentUnitIndex
  isPausedRef.current = isPaused
  totalDurationMsRef.current = totalDurationMs

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
  // the glow bar via a ref. Every frame recomputes a fresh constant-
  // velocity offset directly from elapsed time — no per-line branch left
  // to hold or jump on.
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
        track.style.transform = `translate3d(0, ${offsetPx - lineHeight / 2}px, 0)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [wordYCenters, prefersReducedMotion, lineHeight])

  const clampedProgress = Math.min(100, Math.max(0, progressPercent))
  const isWarmingUp = elapsedMs < 1_500
  const chromeClassName = `transition-opacity duration-500 ease-out ${isChromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`

  return (
    <ReadingLayout maxWidthClassName="max-w-3xl" onExit={onExit}>
      <div
        className="flex w-full flex-col items-center"
        onPointerMove={revealChromeAndScheduleHide}
        onTouchStart={revealChromeAndScheduleHide}
        onFocus={revealChromeAndScheduleHide}
      >
        <div className={`w-full max-w-md ${chromeClassName}`}>
          <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Guided Paragraph Reading™ · Vertical</p>
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

        <div
          ref={cardRef}
          className={`relative mx-auto mt-8 w-full overflow-hidden rounded-3xl border border-black/10 p-8 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
          style={{ maxWidth: viewportWidth, height: cardHeight, visibility: wordYCenters === null ? 'hidden' : 'visible' }}
        >
          <div className="relative">
            {wordYCenters && (
              <div
                ref={trackRef}
                className={`pointer-events-none absolute inset-x-0 will-change-transform ${GLOW_BAR_CLASS_NAME}`}
                style={{ height: lineHeight, boxShadow: GLOW_BAR_BOX_SHADOW }}
              />
            )}
            <p
              className={`relative ${TEXT_COLOR_CLASS_NAME}`}
              style={{ fontSize: fontSizePx, lineHeight: `${lineHeight}px`, width: measuredWrapWidth ?? undefined }}
            >
              <TrackWords units={units} />
            </p>
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
