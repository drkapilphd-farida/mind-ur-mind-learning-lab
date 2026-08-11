'use client'

import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { computeContinuousStreamOffsetPx } from '@/hooks/reading-engine/continuousStreamOffset'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import type { ReadingUnit } from '@/features/reading-engine/types'
import type { PhraseSize } from './PhraseReadingModeSettings'

// Vertical Phrase Flow — the vertical companion to the horizontal channel,
// same GPU-accelerated teleprompter waterfall as Vertical Chunk Sliding™ /
// Vertical Word Reading™ (own-copy of that proven pattern). Phrases stack
// top-to-bottom in a fixed-height row rather than side-by-side, so —
// unlike the horizontal Canvas — no DOM measurement is needed:
// offsetForIndex below is pure closed-form arithmetic. Reuses the same
// per-PhraseSize channel width and row height as the horizontal Canvas
// (own-copy, not a shared import) so the size picker means the same thing
// in both orientations.
const PHRASE_CHANNEL_WIDTH_PX: Record<PhraseSize, number> = {
  small: 420,
  medium: 620,
  large: 1040,
}

const PHRASE_ROW_HEIGHT_PX: Record<PhraseSize, number> = {
  small: 56,
  medium: 76,
  large: 108,
}

// Responsive per tier — same rationale and same breakpoints as the
// horizontal Canvas's own copy of this map (own-copy, not a shared
// import) — see that file's comment for why a fixed size clips the
// longest real phrase chunks on narrow mobile viewports.
const PHRASE_SIZE_TEXT_CLASSES: Record<PhraseSize, string> = {
  small: 'text-lg sm:text-xl md:text-2xl font-semibold whitespace-nowrap',
  medium: 'text-2xl sm:text-3xl md:text-4xl font-semibold whitespace-nowrap',
  large: 'text-4xl sm:text-5xl md:text-6xl font-semibold whitespace-nowrap',
}

const UNIT_GAP_PX = 20
const VISIBLE_ROWS = 3
const ENGINE_TICK_MS = 100
const HAPTIC_TRANSITION_MS = 10
const CHROME_AUTO_HIDE_DELAY_MS = 2_200

// Same frosted-glass palette as the horizontal Canvas (own-copy).
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'
const PHRASE_TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

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

type PhraseReadingModeVerticalCanvasProps = {
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

export function PhraseReadingModeVerticalCanvas({
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
}: PhraseReadingModeVerticalCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)
  const channelWidth = PHRASE_CHANNEL_WIDTH_PX[phraseSize]
  const rowHeight = PHRASE_ROW_HEIGHT_PX[phraseSize]
  const textClassName = PHRASE_SIZE_TEXT_CLASSES[phraseSize]
  const channelHeight = rowHeight * VISIBLE_ROWS + UNIT_GAP_PX * (VISIBLE_ROWS - 1)

  // Every row is the same fixed height, so a unit's vertical center is
  // pure arithmetic — no measurement of any kind needed.
  function offsetForIndex(index: number): number {
    return index * (rowHeight + UNIT_GAP_PX) + rowHeight / 2
  }

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

  // The actual motion — a dedicated rAF loop writing translateY straight to
  // the track element via a ref, same GPU-composited direct-DOM pattern as
  // the horizontal Canvas's translateX, just the other axis.
  useEffect(() => {
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
        track.style.transform = `translate3d(0, -${offsetPx}px, 0)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, prefersReducedMotion, rowHeight])

  const clampedProgress = Math.min(100, Math.max(0, progressPercent))
  const isWarmingUp = elapsedMs < 1_500
  const chromeClassName = `transition-opacity duration-500 ease-out ${isChromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={onExit}>
      <div
        className="flex w-full flex-col items-center"
        onPointerMove={revealChromeAndScheduleHide}
        onTouchStart={revealChromeAndScheduleHide}
        onFocus={revealChromeAndScheduleHide}
      >
        <div className={`w-full max-w-md ${chromeClassName}`}>
          <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Phrase Reading Mode™ · Vertical</p>
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

        {/* The teleprompter waterfall — a fixed 3-row window (previous /
            current / next, current centered) the track can never wrap or
            spill out of (overflow-hidden on the frame). One phrase per
            row, flowing smoothly downward at a constant, WPM-paced rate. */}
        <div
          className={`relative mx-auto mt-8 w-full overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
          style={{ maxWidth: channelWidth, height: channelHeight }}
          aria-live="off"
        >
          <div
            ref={trackRef}
            className="absolute left-0 flex w-full flex-col items-center will-change-transform"
            style={{ top: '50%', gap: UNIT_GAP_PX }}
          >
            {units.map((unit) => (
              <div key={unit.id} className="flex items-center justify-center px-6" style={{ height: rowHeight, width: '100%' }}>
                <span className={`${textClassName} ${PHRASE_TEXT_COLOR_CLASS_NAME}`}>{unit.text}</span>
              </div>
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
