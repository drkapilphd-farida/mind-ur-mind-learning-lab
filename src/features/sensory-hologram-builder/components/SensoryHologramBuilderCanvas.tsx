'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import type { HologramGoal } from '../hologramDatabase'
import { buildNarrationPhases, type NarrationPhase } from '../hologramNarrationScript'
import { estimateSpeechDurationMs } from '../hologramSpeechTiming'
import { NARRATION_LANGUAGE_TAGS, pickVoiceForLanguage, type NarrationLanguage } from '../hologramVoiceSelection'

const TICK_MS = 100
const SPEECH_RATE = 0.85
// Pause between consecutive lines within a phase, and the longer pause at
// a phase boundary — both purely pacing/breathing room, independent of
// however long the actual utterance itself takes to speak.
const LINE_GAP_MS = 1600
const PHASE_GAP_MS = 2400
// Safety net for real speech synthesis: some browsers occasionally drop
// the utterance's own `onend` callback (a known Web Speech API
// reliability gap, worse after a backgrounded tab or a long pause) — this
// guarantees the session can never hang forever waiting for a callback
// that isn't coming.
const SPEECH_SAFETY_BUFFER_MS = 4000

// The default position of the volume slider (60%) is calibrated to
// reproduce the exact same RESTING_GAIN every other ambient-drone
// exercise in this app already uses — sliding above or below it scales
// gain proportionally, never past a comfortable ambient ceiling.
const DEFAULT_VOLUME = 0.6

// Frosted-glass palette — own-copy, matching every other exercise built
// this app, per this exercise's explicit "frosted-glass focus framing"
// spec.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'

// The exact tuned 110Hz drone recipe (own-copy) shared by every ambient
// exercise this app has built — a full octave down from the original
// Brain Gym recipe, heavily low-passed, quiet at rest, slow to fade
// in/out.
const FUNDAMENTAL_HZ = 110
// A second, independent "healing frequency" layer at 432Hz, per this
// exercise's own explicit spec ("combining healing frequencies like
// 432Hz / 110Hz lowpass waves") — deliberately NOT a harmonic multiple of
// 110 (unlike HARMONIC_LAYERS below), so it reads as a genuinely separate
// blended tone rather than just another overtone of the same fundamental.
const HEALING_OVERTONE_HZ = 432
const HEALING_OVERTONE_WEIGHT = 0.22
const RESTING_GAIN = 0.014
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 2.5
const RELEASE_TIME_CONSTANT_S = 1.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
const VOLUME_RAMP_TIME_CONSTANT_S = 0.4
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

type SensoryHologramBuilderCanvasProps = {
  goal: HologramGoal
  language: NarrationLanguage
  onComplete: (elapsedMs: number) => void
  onExitRequested: (elapsedMs: number) => void
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

// Sensory Hologram Builder™ — deliberately NOT built on useReadingRuntime:
// that hook paces plain text forward at a target WPM, which has no
// honest meaning for a slow, voice-narrated guided meditation with
// natural pauses between phrases. Its own minimal 100ms tick drives only
// an honest live stopwatch, and the two generic shell atoms
// (ReadingProgressBar, ReadingStatTile) are reused directly, matching
// every non-WPM exercise's own established precedent.
//
// There is no existing `speechSynthesis` precedent anywhere in this
// codebase — this establishes that pattern for the first time: a phase/
// line state machine (mirroring ColorSceneTransformationCanvas.tsx's own
// timer-driven phase shape) advanced by each utterance's `onend`, with a
// word-count-based fallback timer (hologramSpeechTiming.ts) whenever
// speech synthesis is unavailable, voiceless for the chosen language, or
// errors mid-utterance — the session always keeps moving regardless of
// what the browser's speech engine actually supports.
export function SensoryHologramBuilderCanvas({ goal, language, onComplete, onExitRequested }: SensoryHologramBuilderCanvasProps): React.JSX.Element {
  const phases = useMemo(() => buildNarrationPhases(goal), [goal])
  const totalPhases = phases.length

  const [attemptNonce, setAttemptNonce] = useState(0)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)

  const [elapsedMs, setElapsedMs] = useState(0)
  useEffect(() => {
    if (isSessionComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isSessionComplete])
  const elapsedMsRef = useRef(0)
  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  const currentPhase: NarrationPhase | undefined = phases[phaseIndex]
  const currentLine = currentPhase?.lines[lineIndex] ?? null
  const captionText = currentLine ? (language === 'hi' ? currentLine.hi : currentLine.en) : ''

  // ---- Voice list (getVoices() can be empty until the async
  // 'voiceschanged' event fires the first time, a well-known Web Speech
  // API quirk in Chrome) ----
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    function loadVoices(): void {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  // ---- The narration/pacing engine itself ----
  useEffect(() => {
    if (isSessionComplete || isPaused) return
    const phase = phases[phaseIndex]
    const line = phase?.lines[lineIndex]
    if (!phase || !line) return

    let isCancelled = false
    let hasAdvanced = false
    let gapTimeoutId: ReturnType<typeof setTimeout> | null = null
    let safetyTimeoutId: ReturnType<typeof setTimeout> | null = null

    function scheduleAdvance(): void {
      if (isCancelled || hasAdvanced) return
      hasAdvanced = true
      const isLastLineOfPhase = lineIndex + 1 >= phase!.lines.length
      const isLastPhase = phaseIndex + 1 >= totalPhases
      if (isLastLineOfPhase && isLastPhase) {
        setIsSessionComplete(true)
        return
      }
      const gapMs = isLastLineOfPhase ? PHASE_GAP_MS : LINE_GAP_MS
      gapTimeoutId = setTimeout(() => {
        if (isCancelled) return
        if (isLastLineOfPhase) {
          setPhaseIndex((p) => p + 1)
          setLineIndex(0)
        } else {
          setLineIndex((i) => i + 1)
        }
      }, gapMs)
    }

    const text = language === 'hi' ? line.hi : line.en
    const supportsSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window
    const estimatedMs = estimateSpeechDurationMs(text, SPEECH_RATE)

    if (supportsSpeech) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = NARRATION_LANGUAGE_TAGS[language]
      utterance.rate = SPEECH_RATE
      const voice = pickVoiceForLanguage(voicesRef.current, language)
      if (voice) utterance.voice = voice
      utterance.onend = scheduleAdvance
      utterance.onerror = scheduleAdvance
      window.speechSynthesis.speak(utterance)
      safetyTimeoutId = setTimeout(scheduleAdvance, estimatedMs * 2 + SPEECH_SAFETY_BUFFER_MS)
    } else {
      safetyTimeoutId = setTimeout(scheduleAdvance, estimatedMs)
    }

    return () => {
      isCancelled = true
      if (gapTimeoutId) clearTimeout(gapTimeoutId)
      if (safetyTimeoutId) clearTimeout(safetyTimeoutId)
      if (supportsSpeech) window.speechSynthesis.cancel()
    }
  }, [phaseIndex, lineIndex, isPaused, isSessionComplete, phases, totalPhases, language, attemptNonce])

  useEffect(() => {
    if (!isSessionComplete) return
    if (hasCalledCompleteRef.current) return
    hasCalledCompleteRef.current = true
    onComplete(elapsedMsRef.current)
  }, [isSessionComplete, onComplete])

  // ---- Ambient drone: 110Hz base + 432Hz healing overtone, with
  // user-facing volume/mute/soundscape controls layered on top via the
  // master gain node — own-copy audio graph, matching every other
  // exercise's identical recipe/lifecycle discipline. ----
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [isMuted, setIsMuted] = useState(false)
  const [isSoundscapeEnabled, setIsSoundscapeEnabled] = useState(true)

  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  useEffect(() => {
    const audioContext = new AudioContext()
    const now = audioContext.currentTime

    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0, now)

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

    const healingOscillator = audioContext.createOscillator()
    healingOscillator.type = 'sine'
    healingOscillator.frequency.setValueAtTime(HEALING_OVERTONE_HZ, now)
    const healingGain = audioContext.createGain()
    healingGain.gain.setValueAtTime(HEALING_OVERTONE_WEIGHT, now)
    const healingPanner = audioContext.createStereoPanner()
    healingPanner.pan.setValueAtTime(0, now)
    healingOscillator.connect(healingGain)
    healingGain.connect(healingPanner)
    healingPanner.connect(masterGain)
    healingOscillator.start()
    voices.push({ oscillator: healingOscillator })

    masterGain.gain.setTargetAtTime(RESTING_GAIN, now, AMBIENT_FADE_IN_TIME_CONSTANT_S)

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

  // Volume/mute/soundscape controls all reduce to one target gain,
  // ramped smoothly (never an abrupt jump) whenever any of the three
  // changes.
  useEffect(() => {
    const gain = masterGainRef.current
    const context = audioContextRef.current
    if (!gain || !context) return
    const targetGain = isSoundscapeEnabled && !isMuted ? RESTING_GAIN * (volume / DEFAULT_VOLUME) : 0
    gain.gain.setTargetAtTime(targetGain, context.currentTime, VOLUME_RAMP_TIME_CONSTANT_S)
  }, [volume, isMuted, isSoundscapeEnabled])

  function handleRestart(): void {
    setPhaseIndex(0)
    setLineIndex(0)
    setElapsedMs(0)
    setIsPaused(false)
    setIsSessionComplete(false)
    hasCalledCompleteRef.current = false
    setAttemptNonce((nonce) => nonce + 1)
  }

  const progressPercent = Math.round((phaseIndex / totalPhases) * 100)

  return (
    <ReadingLayout maxWidthClassName="max-w-xl" onExit={() => onExitRequested(elapsedMs)}>
      <div className="w-full max-w-md">
        <p className="mb-3 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Sensory Hologram Builder™</p>
        <div className="grid grid-cols-2 gap-3 text-center">
          <ReadingStatTile label="Phase" value={`${phaseIndex + 1} / ${totalPhases}`} />
          <ReadingStatTile label="Time" value={formatElapsedTime(elapsedMs)} />
        </div>
        <div className="mt-4">
          <ReadingProgressBar progressPercent={progressPercent} />
        </div>
      </div>

      {/* Phase stepper — names every stop of the journey, per the spec's
          own "phase progress indicators" requirement. */}
      <div className="mt-5 flex w-full max-w-md flex-wrap items-center justify-center gap-x-1 gap-y-2" data-session-phase={currentPhase?.id}>
        {phases.map((phase, index) => (
          <div key={phase.id} className="flex items-center gap-1">
            <span
              data-phase-step={phase.id}
              data-phase-step-state={index < phaseIndex ? 'done' : index === phaseIndex ? 'active' : 'upcoming'}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase transition-colors ${
                index === phaseIndex
                  ? 'bg-foreground text-background'
                  : index < phaseIndex
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-foreground/5 text-muted-foreground'
              }`}
            >
              {language === 'hi' ? phase.labelHi : phase.labelEn}
            </span>
            {index < phases.length - 1 && <span aria-hidden="true" className="text-muted-foreground/30">→</span>}
          </div>
        ))}
      </div>

      {/* The immersion caption card — frosted-glass framing, the current
          narration line displayed as an accessible caption (doubling as
          the on-screen anchor regardless of whether audio narration is
          actually available in this browser). */}
      <div
        className={`mt-6 flex min-h-40 w-full items-center justify-center rounded-3xl border border-black/10 p-8 text-center shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}
        aria-live="polite"
        data-caption-language={language}
      >
        <p className="text-lg leading-relaxed font-medium text-foreground" dir={language === 'hi' ? 'auto' : 'ltr'}>
          {captionText}
        </p>
      </div>

      {/* Ambient soundscape controls — volume slider, mute toggle, and a
          persistent on/off switch, per the spec's own explicit "intuitive
          audio volume controls, soundscape toggle, and mute options". */}
      <div className="mt-6 flex w-full max-w-md flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setIsSoundscapeEnabled((enabled) => !enabled)}
          data-soundscape-enabled={isSoundscapeEnabled}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
            isSoundscapeEnabled ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground'
          }`}
        >
          Soundscape {isSoundscapeEnabled ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          onClick={() => setIsMuted((muted) => !muted)}
          data-is-muted={isMuted}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Volume
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            data-volume-percent={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            className="w-24 accent-foreground"
            aria-label="Ambient soundscape volume"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
        {isPaused ? (
          <button onClick={() => setIsPaused(false)} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Resume
          </button>
        ) : (
          <button onClick={() => setIsPaused(true)} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Pause
          </button>
        )}
        <button onClick={handleRestart} className={SECONDARY_TEXT_BUTTON_CLASSES}>
          Restart
        </button>
      </div>
    </ReadingLayout>
  )
}

const PRIMARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
