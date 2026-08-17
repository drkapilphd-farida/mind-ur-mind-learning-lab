'use client'

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { measureWrappedWordPositionsPx, type WrappedLineMeta } from '@/hooks/reading-engine/measureWrappedWordPositions'
import { computeUnitDwellMs } from '@/features/reading-engine/readingMetrics'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import type { ReadingUnit } from '@/features/reading-engine/types'
import type { GuidedParagraphReadingWidth, GuidedParagraphFontSize } from './GuidedParagraphReadingModeSettings'

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

// How wide the glowing marker itself is — roughly a small reading cluster,
// not a single character and not a full line, so it reads as "a spotlight
// following your eyes" rather than either a caret or a full highlight bar.
const MARKER_WIDTH_PX = 110

// The final portion of each line's own sweep where the marker begins
// blending toward the *next* line's start — a smooth, continuous "return
// sweep" (own-copy rationale of Paragraph Reading Mode's constant-
// velocity fix, extended to two axes: X sweeps across the current line,
// then both X and Y glide together toward the next line's start during
// this blend window, rather than an instant CSS-transition snap).
const LINE_BLEND_START_FRACTION = 0.8

const ENGINE_TICK_MS = 100
const HAPTIC_TRANSITION_MS = 10
const CHROME_AUTO_HIDE_DELAY_MS = 2_200

const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'
const TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'
const GLOW_MARKER_CLASS_NAME = 'rounded-full bg-sky-400/20 dark:bg-sky-300/20 ring-1 ring-sky-400/50 dark:ring-sky-300/50'
const GLOW_MARKER_BOX_SHADOW = '0 0 24px 6px rgba(56, 189, 248, 0.4), 0 0 8px rgba(56, 189, 248, 0.55)'

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

type GuidedParagraphReadingModeHorizontalCanvasProps = {
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

// Pure, deterministic 2D guide position for any point in time — no event-
// driven transition state needed. Within a line, X sweeps at one constant
// velocity from that line's first word to its last (own-copy of Paragraph
// Reading Mode's constant-velocity idea, scoped per line instead of per
// whole passage, since X resets at every line break rather than being
// monotonic across the entire text). Y holds steady at that line's own
// height for most of the line, then during the final
// LINE_BLEND_START_FRACTION portion, both X and Y glide together toward
// the next line's start — a smooth, continuous "return sweep" rather than
// an instant reset.
function computeGuidePosition(
  lines: readonly WrappedLineMeta[],
  dwellPerWordMs: number,
  totalWords: number,
  elapsedMs: number,
): { x: number; y: number } {
  if (lines.length === 0 || dwellPerWordMs <= 0) return { x: 0, y: 0 }

  const virtualIndex = Math.min(Math.max(elapsedMs / dwellPerWordMs, 0), Math.max(totalWords - 1, 0))
  let lineIndex = lines.findIndex((line) => virtualIndex >= line.firstWordIndex && virtualIndex <= line.lastWordIndex + 1)
  if (lineIndex === -1) lineIndex = virtualIndex < (lines[0]?.firstWordIndex ?? 0) ? 0 : lines.length - 1

  const line = lines[lineIndex]
  if (!line) return { x: 0, y: 0 }
  const nextLine = lines[lineIndex + 1] ?? null

  const span = Math.max(line.lastWordIndex - line.firstWordIndex, 1)
  const fraction = Math.min(Math.max((virtualIndex - line.firstWordIndex) / span, 0), 1)

  let x = line.firstWordX + (line.lastWordX - line.firstWordX) * fraction
  let y = line.y

  if (fraction > LINE_BLEND_START_FRACTION && nextLine) {
    const blend = (fraction - LINE_BLEND_START_FRACTION) / (1 - LINE_BLEND_START_FRACTION)
    x = x + (nextLine.firstWordX - x) * blend
    y = y + (nextLine.y - y) * blend
  }

  return { x, y }
}

// Horizontal Guided Sweeping — the same static, fully-visible multi-line
// passage as Vertical Guided Tracking, but here a small glowing marker
// sweeps left to right along the *current line*, training lateral reading
// eye-span directly, then glides smoothly down and back to the next
// line's start once that line finishes — the natural "return sweep" a
// real reading guide (finger, ruler, index card) makes, now genuinely
// continuous and rAF-driven rather than a CSS-transition snap.
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

export function GuidedParagraphReadingModeHorizontalCanvas({
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
}: GuidedParagraphReadingModeHorizontalCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)
  const viewportWidth = READING_WIDTH_PX[readingWidth]
  const { fontSize: fontSizePx, lineHeight } = FONT_SIZE_STYLE[fontSize]

  // The card renders at `maxWidth: viewportWidth` + `w-full`, so on a
  // narrow mobile viewport its *real* rendered width is smaller than the
  // desktop tier value above — measuring text wrap (and X sweep bounds)
  // against the fixed tier value instead of the real width would silently
  // clip lines mid-sentence once the card actually shrinks. This measures
  // the card's own real clientWidth (valid even while `visibility:
  // hidden`, since layout is still computed) and re-measures on resize.
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

  const [positions, setPositions] = useState<{ y: number[]; lines: readonly WrappedLineMeta[] } | null>(null)
  useLayoutEffect(() => {
    if (measuredWrapWidth === null) return
    const measured = measureWrappedWordPositionsPx(units.map((unit) => unit.text), measuredWrapWidth, '', {
      fontSize: `${fontSizePx}px`,
      lineHeight: `${lineHeight}px`,
      fontWeight: '400',
    })
    setPositions({ y: measured.y, lines: measured.lines })
  }, [units, measuredWrapWidth, fontSizePx, lineHeight])

  const cardHeight = useMemo(() => {
    if (!positions || positions.y.length === 0) return lineHeight * 3 + CARD_PADDING_PX * 2
    const lastY = positions.y[positions.y.length - 1] ?? 0
    return lastY + lineHeight / 2 + CARD_PADDING_PX * 2
  }, [positions, lineHeight])

  const dwellPerWordMs = useMemo(() => computeUnitDwellMs(units[0]?.text ?? '', targetWpm), [units, targetWpm])

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
  const isPausedRef = useRef(isPaused)
  const dwellPerWordMsRef = useRef(dwellPerWordMs)
  currentUnitIndexRef.current = currentUnitIndex
  isPausedRef.current = isPaused
  dwellPerWordMsRef.current = dwellPerWordMs

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

  // The actual motion — a dedicated rAF loop writing a 2D translate
  // straight to the marker via a ref. Every frame recomputes a fresh
  // position directly from elapsed time via computeGuidePosition, a pure
  // function with zero mutable transition state.
  useEffect(() => {
    if (positions === null || positions.lines.length === 0) return undefined

    const lines = positions.lines
    const totalWords = units.length
    let rafId: number

    function tick(): void {
      const track = trackRef.current
      if (track) {
        const effectiveElapsedMs = prefersReducedMotion
          ? (currentUnitIndexRef.current + 0.5) * dwellPerWordMsRef.current
          : isPausedRef.current
            ? lastEngineElapsedMsRef.current
            : lastEngineElapsedMsRef.current + Math.min(performance.now() - lastEngineTickAtRef.current, ENGINE_TICK_MS)
        const { x, y } = computeGuidePosition(lines, dwellPerWordMsRef.current, totalWords, effectiveElapsedMs)
        track.style.transform = `translate3d(${x - MARKER_WIDTH_PX / 2}px, ${y - lineHeight / 2}px, 0)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [positions, units.length, prefersReducedMotion, lineHeight])

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
          <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Guided Paragraph Reading™ · Horizontal</p>
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
          style={{ maxWidth: viewportWidth, height: cardHeight, visibility: positions === null ? 'hidden' : 'visible' }}
        >
          <div className="relative">
            {positions && (
              <div
                ref={trackRef}
                className={`pointer-events-none absolute top-0 left-0 will-change-transform ${GLOW_MARKER_CLASS_NAME}`}
                style={{ width: MARKER_WIDTH_PX, height: lineHeight, boxShadow: GLOW_MARKER_BOX_SHADOW }}
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
