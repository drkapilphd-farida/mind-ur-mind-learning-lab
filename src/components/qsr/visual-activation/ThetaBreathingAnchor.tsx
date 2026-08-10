'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, SkipForward, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VisualActivationExerciseProps } from './types'

// Theta Breathing & Focal Anchor™ — Exercise 1 of the Visual Activation
// Suite. An alpha/theta-state warm-up: a slow, paced breath cycle with
// three synchronized channels — a scaling, richly-lit glass-morphism glow
// orb (visual), a gentle rhythmic vibration strictly on inhale (haptic),
// and a multi-layered Web Audio harmonic drone — a singing-bowl-style
// stack of tuned partials with a soft algorithmic reverb tail — that
// glides up in pitch on inhale and back down on exhale (audio) — so the
// whole nervous system settles into the same pace before the eyes ever
// start working.
const INHALE_MS = 4_000
const EXHALE_MS = 4_000
const CYCLE_MS = INHALE_MS + EXHALE_MS
const EXERCISE_DURATION_MS = 90_000
// How often the phase scheduler checks for a transition — cheap (5
// ticks/sec) and only ever drives side-effect scheduling, never the
// visual animation itself (that's one continuous framer-motion loop
// declared once, interpolated off the JS thread for real 60fps).
const PHASE_TICK_MS = 200

// A gentle, consonant glide (a perfect fifth) rather than a jarring pitch
// sweep — genuinely calming, not an alarm. Every harmonic layer below
// glides in lockstep with this base frequency, so the whole chord moves
// together.
const LOW_FREQ_HZ = 220 // A3
const HIGH_FREQ_HZ = 330 // E4
const PEAK_GAIN = 0.055 // deliberately quiet — an ambient tone, not music
// Exponential-approach time constants (setTargetAtTime), not linear
// ramps — a linear fade has a perceptible "mechanical" edge; an
// exponential one breathes in and settles out the way a struck bowl
// actually does. ~5 time constants is a full, click-free settle.
const ATTACK_TIME_CONSTANT_S = 1.1
const RELEASE_TIME_CONSTANT_S = 0.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
// Warms the tone and, more importantly, shapes the reverb tail below —
// the convolver's impulse response is broadband noise, and without this
// its tail would read as a soft hiss rather than a resonant bloom.
const LOWPASS_CUTOFF_HZ = 2_600
// A short, gentle bloom (not a cathedral) — just enough decaying tail to
// read as "resonance" rather than a dry, flat tone.
const REVERB_WET_LEVEL = 0.32
const REVERB_DURATION_S = 2.2
const REVERB_DECAY = 2.8
// A slow shimmer synced to exactly one breath cycle (not an independent
// rhythm) — the ear reinforces the same pacing the eyes and haptics
// already carry. Kept well under PEAK_GAIN so it can never push the
// master gain negative during the attack swell.
const TREMOLO_DEPTH = PEAK_GAIN * 0.1

// A singing-bowl-style partial stack: the fundamental, a few-cents-sharp
// unison for warm natural beating, and two upper partials (an octave and
// an octave-plus-fifth) at falling gain — the same overtone relationships
// a real struck bowl produces. Panned slightly apart so the chord has
// width instead of collapsing into one point source.
const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

// A soothing pulse-rest pattern (never a continuous buzz), sized to
// exactly span one inhale — computed from INHALE_MS so the two can never
// drift out of sync if the timing constants above ever change.
const HAPTIC_PULSE_ON_MS = 180
const HAPTIC_PULSE_OFF_MS = 320
const HAPTIC_PULSE_COUNT = Math.floor(INHALE_MS / (HAPTIC_PULSE_ON_MS + HAPTIC_PULSE_OFF_MS))
const HAPTIC_PATTERN: readonly number[] = Array.from({ length: HAPTIC_PULSE_COUNT }, () => [HAPTIC_PULSE_ON_MS, HAPTIC_PULSE_OFF_MS]).flat()

type ExercisePhase = 'intro' | 'breathing' | 'complete'
type BreathPhase = 'inhale' | 'exhale'
type HarmonicVoice = { oscillator: OscillatorNode; multiplier: number }

function computeBreathPhase(elapsedMs: number): BreathPhase {
  return elapsedMs % CYCLE_MS < INHALE_MS ? 'inhale' : 'exhale'
}

// A short, softly-decaying stereo noise tail — the cheapest way to get a
// real convolution-reverb "bloom" (the shimmering resonance a struck bowl
// actually has) without shipping an audio sample. Regenerated once per
// AudioContext, since a ConvolverNode's buffer can't be reused across
// contexts.
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

export function ThetaBreathingAnchor({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale')

  const isMountedRef = useRef(true)
  const lastBreathPhaseRef = useRef<BreathPhase | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])
  const lfoRef = useRef<OscillatorNode | null>(null)
  // The tone's own current target BASE frequency (before each harmonic
  // layer's multiplier is applied), tracked ourselves rather than read
  // back via oscillator.frequency.value — that getter isn't guaranteed to
  // reflect a just-scheduled setValueAtTime call before at least one
  // audio-rendering quantum has actually processed, which silently
  // pinned the wrong starting value (the AudioParam's built-in 440Hz
  // default, not our own 220Hz) the first time this was tried.
  const currentFreqTargetRef = useRef(LOW_FREQ_HZ)
  // Real elapsed wall-clock time (performance.now()-based), not an
  // accumulated `+= PHASE_TICK_MS` counter — setInterval only guarantees
  // "at least" its delay, so accumulating a fixed increment per tick can
  // drift from real time under any load, which desyncs the visual/haptic
  // phase-transition detection from the AudioContext's own real-time
  // hardware clock.
  const startedAtRef = useRef(0)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Audio + haptic cleanup. The returned function fires whenever `phase`
  // changes AND on unmount, but it must only actually tear anything down
  // when LEAVING 'breathing' (finished/skipped/exited) or unmounting
  // mid-breathing — never when ENTERING it. Each effect instance's
  // closure captures `phase` as it was AT REGISTRATION time, so the
  // guard below is checking "was this the breathing instance?", not the
  // phase we're transitioning to: the very first instance is registered
  // while phase is still 'intro', and without this guard its cleanup
  // (firing the instant phase flips to 'breathing') would immediately
  // null out the refs initAudio() just populated and stop every
  // oscillator ~350ms after they start — which is exactly what happened
  // before this guard existed.
  useEffect(() => {
    return () => {
      if (phase !== 'breathing') return
      stopHaptics()
      teardownAudio()
    }
  }, [phase])

  // The exercise timer (time remaining + phase-transition detection) —
  // recomputed from real elapsed time on every tick, never accumulated,
  // so it can't drift regardless of how irregularly the interval itself
  // actually fires.
  useEffect(() => {
    if (phase !== 'breathing') return undefined
    const interval = setInterval(() => {
      if (!isMountedRef.current) return
      const realElapsedMs = performance.now() - startedAtRef.current
      setElapsedMs(Math.min(EXERCISE_DURATION_MS, realElapsedMs))
    }, PHASE_TICK_MS)
    return () => clearInterval(interval)
  }, [phase])

  // Phase-transition scheduler — audio ramps and haptic pulses are
  // scheduled exactly once per transition (never per-tick), detected by
  // comparing against the last-known phase in a ref.
  useEffect(() => {
    if (phase !== 'breathing') return
    const nextBreathPhase = computeBreathPhase(elapsedMs)
    if (nextBreathPhase === lastBreathPhaseRef.current) return
    lastBreathPhaseRef.current = nextBreathPhase
    setBreathPhase(nextBreathPhase)

    if (nextBreathPhase === 'inhale') {
      scheduleTone(HIGH_FREQ_HZ, INHALE_MS)
      triggerInhaleHaptics()
    } else {
      scheduleTone(LOW_FREQ_HZ, EXHALE_MS)
      stopHaptics()
    }
  }, [phase, elapsedMs])

  useEffect(() => {
    if (phase === 'breathing' && elapsedMs >= EXERCISE_DURATION_MS) {
      finishExercise()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, elapsedMs])

  function initAudio(): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    if (audioContextRef.current) return

    const audioContext = new AudioContext()
    const now = audioContext.currentTime
    currentFreqTargetRef.current = LOW_FREQ_HZ

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
      oscillator.frequency.setValueAtTime(LOW_FREQ_HZ * multiplier, now)

      const voiceGain = audioContext.createGain()
      voiceGain.gain.setValueAtTime(weight, now)

      const panner = audioContext.createStereoPanner()
      panner.pan.setValueAtTime(pan, now)

      oscillator.connect(voiceGain)
      voiceGain.connect(panner)
      panner.connect(masterGain)
      oscillator.start()

      return { oscillator, multiplier }
    })

    // A slow tremolo synced exactly to one breath cycle — a living
    // shimmer, not a separate rhythm, so the ear reinforces the same
    // pacing the eyes and haptics already carry.
    const lfo = audioContext.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(1000 / CYCLE_MS, now)
    const lfoDepth = audioContext.createGain()
    lfoDepth.gain.setValueAtTime(TREMOLO_DEPTH, now)
    lfo.connect(lfoDepth)
    lfoDepth.connect(masterGain.gain)
    lfo.start()

    // A gentle, artifact-free swell — an exponential approach, never a
    // hard linear ramp, so the tone breathes in rather than fading up
    // mechanically.
    masterGain.gain.setTargetAtTime(PEAK_GAIN, now, ATTACK_TIME_CONSTANT_S)

    audioContextRef.current = audioContext
    masterGainRef.current = masterGain
    harmonicVoicesRef.current = voices
    lfoRef.current = lfo
  }

  function scheduleTone(targetHz: number, durationMs: number): void {
    const audioContext = audioContextRef.current
    const voices = harmonicVoicesRef.current
    if (!audioContext || voices.length === 0) return
    const now = audioContext.currentTime
    const fromHz = currentFreqTargetRef.current
    for (const voice of voices) {
      voice.oscillator.frequency.cancelScheduledValues(now)
      voice.oscillator.frequency.setValueAtTime(fromHz * voice.multiplier, now)
      voice.oscillator.frequency.linearRampToValueAtTime(targetHz * voice.multiplier, now + durationMs / 1000)
    }
    currentFreqTargetRef.current = targetHz
  }

  function teardownAudio(): void {
    const audioContext = audioContextRef.current
    const masterGain = masterGainRef.current
    const voices = harmonicVoicesRef.current
    const lfo = lfoRef.current
    if (audioContext && masterGain) {
      const now = audioContext.currentTime
      masterGain.gain.cancelScheduledValues(now)
      masterGain.gain.setValueAtTime(masterGain.gain.value, now)
      masterGain.gain.setTargetAtTime(0, now, RELEASE_TIME_CONSTANT_S)
    }
    // Stop only after the release has fully settled (~5 time constants)
    // so the oscillators never cut off mid-decay — stopping any earlier
    // is exactly what produces an audible click.
    setTimeout(() => {
      for (const voice of voices) voice.oscillator.stop()
      lfo?.stop()
      void audioContext?.close().catch(() => undefined)
    }, RELEASE_SETTLE_MS)
    audioContextRef.current = null
    masterGainRef.current = null
    harmonicVoicesRef.current = []
    lfoRef.current = null
  }

  function triggerInhaleHaptics(): void {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
    navigator.vibrate([...HAPTIC_PATTERN])
  }

  function stopHaptics(): void {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
    // Explicit per the exercise's own physical-relaxation requirement:
    // exhale must be vibration-free, never a lingering pulse from a
    // pattern that overran its inhale window.
    navigator.vibrate(0)
  }

  function handleStart(): void {
    initAudio()
    lastBreathPhaseRef.current = null
    startedAtRef.current = performance.now()
    setElapsedMs(0)
    setBreathPhase('inhale')
    setPhase('breathing')
  }

  function finishExercise(): void {
    stopHaptics()
    teardownAudio()
    setPhase('complete')
  }

  function handleSkip(): void {
    stopHaptics()
    teardownAudio()
    setPhase('complete')
  }

  const remainingSeconds = Math.ceil((EXERCISE_DURATION_MS - elapsedMs) / 1000)
  const isInhale = breathPhase === 'inhale'

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
      {/* Rich, layered ambient wash — deep indigo bleeding into electric
          violet and a luminous cyan core, static (only the orb itself
          carries motion) but saturated enough to read as premium in both
          themes rather than a faint tint. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(103,232,249,0.35) 0%, rgba(139,92,246,0.32) 38%, rgba(67,56,202,0.4) 68%, transparent 100%)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.35) 0%, transparent 70%)' }}
        />
      </div>

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Theta Breathing &amp; Focal Anchor</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Wind className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Settle In. Just Breathe.</h2>
          <p className="text-sm text-muted-foreground">
            90 seconds of paced breathing with a glowing focal anchor. On phones, you&rsquo;ll feel a soft pulse while you breathe in — nothing on the exhale.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30"
          >
            Begin
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onExit} className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Exit
          </button>
        </motion.div>
      )}

      {phase === 'breathing' && (
        <div className="flex flex-col items-center gap-10">
          {/* Glass-morphism fluid glow orb — one continuous framer-motion
              loop declared once per layer (never re-created per render),
              so the actual scale interpolation runs off the JS thread at
              a real 60fps regardless of what the phase-scheduler effects
              above are doing. Three layers give it real depth: a wide
              soft bloom, a tighter hot core, and the glass ring itself. */}
          <div className="relative flex size-64 items-center justify-center">
            <motion.div
              aria-hidden="true"
              animate={{ scale: [0.72, 1.18, 0.72], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: CYCLE_MS / 1000, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-[-24px] rounded-full blur-2xl"
              style={{
                background: 'radial-gradient(circle at 50% 45%, rgba(165,243,252,0.9) 0%, rgba(139,92,246,0.85) 40%, rgba(67,56,202,0.85) 72%, transparent 100%)',
              }}
            />
            <motion.div
              aria-hidden="true"
              animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 0.95, 0.6] }}
              transition={{ duration: CYCLE_MS / 1000, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-8 rounded-full blur-xl"
              style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.8) 0%, rgba(129,140,248,0.7) 55%, transparent 100%)' }}
            />
            <motion.div
              aria-hidden="true"
              animate={{ scale: [0.78, 1.12, 0.78] }}
              transition={{ duration: CYCLE_MS / 1000, repeat: Infinity, ease: 'easeInOut' }}
              className={cn(
                'absolute inset-6 rounded-full border border-white/50 bg-white/15 shadow-[0_0_70px_-8px_rgba(139,92,246,0.75),inset_0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-xl',
                'dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_0_90px_-8px_rgba(129,140,248,0.85),inset_0_1px_1px_rgba(255,255,255,0.1)]',
              )}
            />
            <span className="relative font-heading text-lg font-semibold text-foreground drop-shadow-sm">{isInhale ? 'Breathe In' : 'Breathe Out'}</span>
          </div>

          <p className="text-sm font-medium tabular-nums text-muted-foreground">{remainingSeconds}s remaining</p>

          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
          >
            Finish Early
            <SkipForward className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Wind className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Mind Settled</h2>
          <p className="text-sm text-muted-foreground">Your focus is anchored. Ready for what&rsquo;s next.</p>
          <button
            type="button"
            onClick={onComplete}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30"
          >
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </div>
  )
}
