'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useContentCrossfade } from '@/hooks/reading-engine/useContentCrossfade'
import { computeUnitDwellMs } from '@/features/reading-engine/readingMetrics'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { SPATIAL_QUADRANTS, type SpatialQuadrant } from '../spatialQuadrantAssignment'

// The Spatial Quadrant Flashing Engine — every other Reading Mode this
// session flashes content at one fixed on-screen point. This one
// deliberately doesn't: each cluster appears in a different corner (or the
// center) of the stage than the one before it, so the eyes are forced to
// physically relocate for every cluster rather than settle on one spot —
// the specific skill "non-linear reading / peripheral layout capture /
// photographic memory" training calls for.
const STAGE_WIDTH_PX = 680
const STAGE_HEIGHT_PX = 420
const CLUSTER_TEXT_CLASS_NAME = 'text-2xl leading-snug font-bold md:text-3xl'

const ENGINE_TICK_MS = 100

// Frosted-glass palette — own-copy, matching every sibling Reading Mode
// built this session, per this exercise's explicit "frosted-glass focus
// framing" spec.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'
const CLUSTER_TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

// The exact tuned 110Hz drone recipe (own-copy) shared by every Reading
// Mode this session — a full octave down from the original Brain Gym
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

type PhotographicReadingCanvasProps = {
  units: readonly string[]
  quadrants: readonly SpatialQuadrant[]
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

// Each quadrant maps to a fixed absolute-position + text-alignment pair on
// the stage — a lone switch, not a lookup table, so TypeScript can prove
// every SpatialQuadrant case is actually handled.
function quadrantPositionClassName(quadrant: SpatialQuadrant): string {
  switch (quadrant) {
    case 'top-left':
      return 'top-7 left-7 text-left'
    case 'top-right':
      return 'top-7 right-7 text-right'
    case 'bottom-left':
      return 'bottom-7 left-7 text-left'
    case 'bottom-right':
      return 'bottom-7 right-7 text-right'
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'
  }
}

export function PhotographicReadingCanvas({
  units,
  quadrants,
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
}: PhotographicReadingCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)

  // Unlike the RSVP exercises (uniform per-word dwell), each spatial
  // cluster here is 3-5 words, so its dwell time genuinely varies — this
  // is the per-unit start-time boundary each cluster's dwell window
  // begins at, mirroring computeUnitDwellMs's own "word count scales
  // dwell time" contract. Stable for the lifetime of a run (units and
  // targetWpm don't change once reading starts).
  const cumulativeStartMs = useMemo(() => {
    const starts: number[] = []
    let cursor = 0
    for (const unit of units) {
      starts.push(cursor)
      cursor += computeUnitDwellMs(unit, targetWpm)
    }
    return starts
  }, [units, targetWpm])

  // The word/cluster actually on screen right now. Driven by a dedicated
  // rAF loop rather than reading currentUnitIndex directly — the locked
  // useReadingRuntime only updates its own index on a 100ms tick boundary,
  // which isn't fine-grained enough for the swap moment itself to land
  // accurately at every target WPM — this projects forward from the last
  // real tick using performance.now(), the same proven pattern every
  // sibling Reading Mode this session uses.
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const displayedIndexRef = useRef(0)

  const lastEngineElapsedMsRef = useRef(elapsedMs)
  const lastEngineTickAtRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  useEffect(() => {
    lastEngineElapsedMsRef.current = elapsedMs
    lastEngineTickAtRef.current = performance.now()
  }, [elapsedMs])

  const isPausedRef = useRef(isPaused)
  isPausedRef.current = isPaused

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedIndex(currentUnitIndex)
      return
    }

    let rafId: number

    function tick(): void {
      const interpolatedElapsedMs = isPausedRef.current
        ? lastEngineElapsedMsRef.current
        : lastEngineElapsedMsRef.current + Math.min(performance.now() - lastEngineTickAtRef.current, ENGINE_TICK_MS)

      let expectedIndex = 0
      for (let i = 0; i < cumulativeStartMs.length; i++) {
        if (cumulativeStartMs[i]! <= interpolatedElapsedMs) expectedIndex = i
        else break
      }
      expectedIndex = Math.min(expectedIndex, units.length - 1)

      if (expectedIndex !== displayedIndexRef.current) {
        displayedIndexRef.current = expectedIndex
        setDisplayedIndex(expectedIndex)
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [cumulativeStartMs, units.length, prefersReducedMotion, currentUnitIndex])

  // The fade + spatial relocation must swap atomically — the old cluster
  // fully fades out at its old corner before the new cluster (new text AND
  // new position, together) fades in at its new corner. Feeding the index
  // itself (not just the text) through the shared crossfade hook is what
  // keeps text and position perfectly in sync with the same exit → pause →
  // enter timing every other Reading Mode already uses — a real "content
  // value" as far as the hook is concerned, just not literally the
  // rendered string.
  const crossfade = useContentCrossfade(String(displayedIndex), prefersReducedMotion)
  const shownIndex = Number(crossfade.displayedValue)
  const shownText = units[shownIndex] ?? ''
  const shownQuadrant = quadrants[shownIndex] ?? 'center'

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

  return (
    <ReadingLayout maxWidthClassName="max-w-3xl" onExit={onExit}>
      <div className="w-full max-w-md">
        <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Photographic Reading™</p>
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

      {/* The spatial stage — exactly one cluster visible at a time,
          relocating to a different corner (or center) every time, framed
          by five faint dot markers hinting at the full quadrant grid even
          when nothing is currently flashing there. */}
      <div
        className={`relative mx-auto mt-8 w-full overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
        style={{ maxWidth: STAGE_WIDTH_PX, height: STAGE_HEIGHT_PX }}
        aria-live="off"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {SPATIAL_QUADRANTS.map((quadrant) => (
            <span key={quadrant} className={`absolute h-1.5 w-1.5 rounded-full bg-foreground/15 ${quadrantPositionClassName(quadrant)}`} />
          ))}
        </div>

        <div
          data-spatial-role="cluster"
          data-spatial-quadrant={shownQuadrant}
          className={`absolute ${quadrantPositionClassName(shownQuadrant)}`}
          style={{
            maxWidth: shownQuadrant === 'center' ? '62%' : '42%',
            opacity: crossfade.isVisible ? 1 : 0,
            transition: prefersReducedMotion ? undefined : `opacity ${crossfade.transitionMs}ms ease-out`,
          }}
        >
          <span className={`${CLUSTER_TEXT_CLASS_NAME} ${CLUSTER_TEXT_COLOR_CLASS_NAME}`}>{shownText}</span>
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
