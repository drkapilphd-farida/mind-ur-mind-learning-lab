'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { computeContinuousStreamOffsetPx } from '@/hooks/reading-engine/continuousStreamOffset'
import { measureSingleLineWidthsPx } from '@/hooks/reading-engine/measureSingleLineWidths'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import type { ReadingUnit } from '@/features/reading-engine/types'

// Chunks here are always 3-4 words (see splitIntoChunks in the dataset
// file), a narrower and more consistent shape than Phrase Reading Mode's
// hand-authored 2-4 word phrases — so a single fixed viewport size is
// enough; no per-user size picker is needed. Sized with margin above the
// dataset's own longest real chunk, live-verified to not clip.
const CHUNK_VIEWPORT_WIDTH_PX = 640
const CHUNK_LINE_HEIGHT_PX = 96
const CHUNK_TEXT_CLASS_NAME = 'text-4xl font-semibold whitespace-nowrap'

// Real horizontal gap between consecutive chunks on the track.
const UNIT_GAP_PX = 64

// The engine's own tick (see useReadingRuntime.ts, unmodified/locked) only
// updates elapsedMs in discrete 100ms jumps. This local interpolation
// bridges those jumps into a genuinely continuous, 60fps-smooth motion:
// each rAF frame projects forward from the last real tick by real wall-
// clock time elapsed since it landed, capped at one tick's worth so it can
// never overshoot past where the next real tick will likely arrive.
const ENGINE_TICK_MS = 100

const HAPTIC_TRANSITION_MS = 10

// Zero-distraction focus mode: the header stats/progress bar and the
// Pause/Restart/Finish row fade out after this much pointer inactivity
// while actively running, leaving only the sliding words on screen. Any
// pointer movement (or pausing) brings them straight back — never a
// permanent disappearance, just an auto-hide, the same convention as any
// video player's control bar.
const CHROME_AUTO_HIDE_DELAY_MS = 2_200

// Deep charcoal / crisp near-white — deliberately hardcoded literal
// Tailwind arbitrary-value classes (bg-[#FBF9F4] etc.) rather than theme
// tokens like bg-background/text-foreground, since "razor-sharp, reading-
// optimized contrast" is a stronger guarantee than whatever the app's
// general-purpose tokens happen to resolve to. Written as literal class
// strings directly in the JSX below, not built from JS constants — the
// Tailwind JIT scanner can't resolve interpolated values, so a template
// literal here would silently produce no CSS in production.
const CARD_CLASS_NAME = 'bg-[#FBF9F4] dark:bg-[#16171A]'
const CHUNK_TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

// The same static-frequency singing-bowl drone every Brain Gym exercise
// uses (own-copy, per this app's established convention of duplicating
// small self-contained logic rather than cross-feature coupling) — here a
// calm, distraction-free background presence for focused reading, never a
// pitch sweep. Tuned noticeably softer/deeper/slower than the Brain Gym
// original per direct user-testing feedback ("invisible, profoundly
// calming backdrop") — a full octave down, much heavier low-pass
// filtering to cut the brighter overtones, quieter at rest, and slower to
// fade in/out so it never announces itself.
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

type DynamicChunkSlidingCanvasProps = {
  units: readonly ReadingUnit[]
  currentUnitIndex: number
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

// Dynamic Chunk Sliding™ — a 10/10 rebuild of the sliding channel itself.
// Still reuses the exact same "no dimming, one continuous linear
// transform" streaming model Phrase Reading Mode proved out
// (measureSingleLineWidthsPx for each chunk's true rendered width,
// computeContinuousStreamOffsetPx for the shared frame-by-frame glide
// math — both imported unmodified, since they're shared across every
// horizontal-streaming Reading Mode) — every chunk still renders at full
// opacity/foreground at all times, nothing fades or dims, ever, exactly
// as before. What changed is HOW that transform reaches the screen: it
// used to flow through React state → an inline `transform` style → a CSS
// `transition: 100ms linear`, re-triggered every engine tick. That's
// approximate — a `setInterval`-driven restart isn't frame-synced, and
// any jank from the surrounding re-render can visibly stutter it. Now a
// dedicated requestAnimationFrame loop writes `translate3d` straight to
// the track element via a ref, every real display frame, completely
// bypassing React re-renders for the motion itself — genuinely
// GPU-composited, genuinely 60fps, never blocked by anything else this
// component does.
export function DynamicChunkSlidingCanvas({
  units,
  currentUnitIndex,
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
}: DynamicChunkSlidingCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)

  // Zero-distraction focus mode — see CHROME_AUTO_HIDE_DELAY_MS above.
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
    // Re-arms whenever isPaused changes: pausing cancels the pending hide
    // and keeps chrome visible; resuming re-schedules it fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused])

  const [unitWidths, setUnitWidths] = useState<number[] | null>(null)
  useLayoutEffect(() => {
    setUnitWidths(measureSingleLineWidthsPx(units.map((unit) => unit.text), CHUNK_TEXT_CLASS_NAME))
  }, [units])

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

  // Bridges the engine's own discrete 100ms ticks into a continuous
  // wall-clock reference the rAF loop can project forward from between
  // ticks — refreshed the instant a real tick actually lands, so drift
  // never accumulates.
  const lastEngineElapsedMsRef = useRef(elapsedMs)
  const lastEngineTickAtRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  useEffect(() => {
    lastEngineElapsedMsRef.current = elapsedMs
    lastEngineTickAtRef.current = performance.now()
  }, [elapsedMs])

  // Refs bridge the latest prop values into the rAF loop below without
  // needing to tear the loop down and restart it on every single prop
  // change (currentUnitIndex/targetWpm/isPaused all change far more often
  // than the loop itself needs to be re-created).
  const currentUnitIndexRef = useRef(currentUnitIndex)
  const targetWpmRef = useRef(targetWpm)
  const isPausedRef = useRef(isPaused)
  currentUnitIndexRef.current = currentUnitIndex
  targetWpmRef.current = targetWpm
  isPausedRef.current = isPaused

  // A crisp, subtle tap exactly on every real chunk transition — never on
  // the very first chunk (index 0 is the starting position, not a
  // transition into anything), and only ever fires when the ENGINE's own
  // index genuinely advances, so it can never fire faster than reading
  // actually progresses.
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

  // The actual motion — a dedicated rAF loop, started once real widths
  // are known and re-created only if the unit list or reduced-motion
  // preference itself changes (never on every tick/index/wpm change; see
  // the refs above for how those reach this loop instead).
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
    <ReadingLayout maxWidthClassName="max-w-4xl" onExit={onExit}>
      {/* Zero-distraction focus mode — any pointer activity reveals the
          header/controls and restarts the auto-hide timer; see
          CHROME_AUTO_HIDE_DELAY_MS. Reading-optimized: no color wash, a
          plain neutral surface, so nothing here competes with the text
          itself for attention. */}
      <div
        className="flex w-full flex-col items-center"
        onPointerMove={revealChromeAndScheduleHide}
        onTouchStart={revealChromeAndScheduleHide}
        onFocus={revealChromeAndScheduleHide}
      >
        <div className={`w-full max-w-md ${chromeClassName}`}>
          <p className="mb-3 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Dynamic Chunk Sliding™</p>

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
            wrap out of (whitespace-nowrap per chunk + overflow-hidden on
            the frame). Solid, near-opaque paper/graphite card rather than
            a translucent glass-over-color-wash, so text contrast never
            depends on whatever happens to be behind it. */}
        <div
          className={`relative mx-auto mt-8 w-full overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
          style={{
            maxWidth: CHUNK_VIEWPORT_WIDTH_PX,
            height: CHUNK_LINE_HEIGHT_PX,
            visibility: unitWidths === null ? 'hidden' : 'visible',
          }}
          aria-live="off"
        >
          <div
            ref={trackRef}
            className="absolute top-0 flex h-full items-center will-change-transform"
            style={{ left: '50%', gap: UNIT_GAP_PX }}
          >
            {units.map((unit) => (
              <span key={unit.id} className={`${CHUNK_TEXT_CLASS_NAME} ${CHUNK_TEXT_COLOR_CLASS_NAME}`}>
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
