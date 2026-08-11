'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { ArrowRight, Circle, Contact, Diamond, Flame, type LucideIcon, SkipForward, Star, Triangle, UserRound } from 'lucide-react'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import type { VisualActivationExerciseProps } from './types'

// Tratak Afterimage Stretches™ — Exercise 8 (the suite's closing
// exercise) of the Visual Activation Suite. A modern take on the
// classical trataka gazing practice: each round pairs a 35s open-eyed
// GAZE phase — steady, unblinking focus on a vivid high-contrast
// target, ringed by a real progress ring — with a 35s closed-eyed
// RETENTION phase, where the target vanishes into a soft, slow-pulsing
// wash while the learner holds its retinal afterimage in mind. Three
// rounds cycle through a shuffled pool mixing bright geometric targets
// (a neon red circle, an electric blue triangle, a cyan star, a violet
// diamond) with stark inverted face-silhouette targets, training both
// raw sustained fixation and facial-afterimage retention. Three
// synchronized channels, matching Exercises 1-7's own architecture: the
// two-phase visual above (haptic), a very light tap exactly at each
// phase transition — gaze start, retention start — and nowhere else
// (haptic), and the same static-frequency singing-bowl drone as
// Exercises 1, 3, 4, 5, 6 & 7, here a peaceful, unmodulated background
// presence (audio). Every oscillator's frequency is set once via
// setValueAtTime and never ramped — the same lesson Exercise 1's own
// "siren" bug taught.

type ExercisePhase = 'intro' | 'active' | 'complete'
// 'lead-in' is a genuinely distinct state from 'gaze' — not just gaze
// with progress clamped to 0 — specifically so the edge-triggered haptic
// below fires once, exactly when the real 35s gaze phase begins (at
// LEAD_IN_MS), rather than firing on literally the first animation
// frame just because it differs from the initial `null` ref.
type SubPhase = 'lead-in' | 'gaze' | 'retention'
type HarmonicVoice = { oscillator: OscillatorNode }
type TargetKind = 'geometric' | 'face'
type TargetItem = { id: string; kind: TargetKind; label: string; icon: LucideIcon; glow: string; solid: string }

// Deliberately no photographic assets anywhere in this suite — the
// "face silhouette" targets are stark, high-contrast vector portraits
// (white icon on a solid black disc) rather than real photographs,
// consistent with every other exercise's fully-synthesized visuals.
const TARGET_POOL: readonly TargetItem[] = [
  {
    id: 'neon-red-circle',
    kind: 'geometric',
    label: 'Neon Red Circle',
    icon: Circle,
    glow: 'radial-gradient(circle, rgba(248,113,113,0.95) 0%, rgba(220,38,38,0.65) 55%, transparent 100%)',
    solid: '#ef4444',
  },
  {
    id: 'electric-blue-triangle',
    kind: 'geometric',
    label: 'Electric Blue Triangle',
    icon: Triangle,
    glow: 'radial-gradient(circle, rgba(96,165,250,0.95) 0%, rgba(37,99,235,0.65) 55%, transparent 100%)',
    solid: '#3b82f6',
  },
  {
    id: 'cyan-star',
    kind: 'geometric',
    label: 'Cyan Star',
    icon: Star,
    glow: 'radial-gradient(circle, rgba(103,232,249,0.95) 0%, rgba(8,145,178,0.65) 55%, transparent 100%)',
    solid: '#22d3ee',
  },
  {
    id: 'violet-diamond',
    kind: 'geometric',
    label: 'Violet Diamond',
    icon: Diamond,
    glow: 'radial-gradient(circle, rgba(196,181,253,0.95) 0%, rgba(124,58,237,0.65) 55%, transparent 100%)',
    solid: '#a78bfa',
  },
  { id: 'face-silhouette-one', kind: 'face', label: 'Face Silhouette', icon: UserRound, glow: '', solid: '' },
  { id: 'face-silhouette-two', kind: 'face', label: 'Face Silhouette', icon: Contact, glow: '', solid: '' },
]

// A definite, always-defined fallback — TARGET_POOL[scene.round] is
// logically always populated once 'active' (handleStart always fills
// roundTargetsRef with exactly ROUNDS entries), but noUncheckedIndexedAccess
// still types any array index as possibly undefined, so this exists purely
// to satisfy that, never actually reached in practice.
const FALLBACK_TARGET: TargetItem = {
  id: 'neon-red-circle',
  kind: 'geometric',
  label: 'Neon Red Circle',
  icon: Circle,
  glow: 'radial-gradient(circle, rgba(248,113,113,0.95) 0%, rgba(220,38,38,0.65) 55%, transparent 100%)',
  solid: '#ef4444',
}

const ROUNDS = 3
const GAZE_MS = 35_000
const RETENTION_MS = 35_000
const LEAD_IN_MS = 900 // a settling moment before the very first gaze
const ROUND_TRANSITION_GAP_MS = 1_000 // a slightly longer pause between rounds — this is a slower, deeper exercise
const TOTAL_EXERCISE_MS = LEAD_IN_MS + ROUNDS * (GAZE_MS + RETENTION_MS) + ROUND_TRANSITION_GAP_MS * (ROUNDS - 1)

// Cheap enough for label/round-counter React state (~5 renders/sec) —
// each phase here is a full 35 seconds long, so unlike the suite's
// fast-flash exercises, this lag is utterly imperceptible; only the
// progress ring itself needs frame-accurate driving (see the rAF loop).
const PHASE_TICK_MS = 200

// A very light tap — silent through the whole 35s of each phase, firing
// only at the instant it begins.
const HAPTIC_TRANSITION_MS = 12

const RING_SIZE_PX = 176
const RING_RADIUS_PX = 78

const SUBPHASE_LABEL: Record<SubPhase, string> = {
  'lead-in': 'Gaze steadily…',
  gaze: 'Gaze steadily…',
  retention: 'Close your eyes — hold the afterimage…',
}

// A single fixed grounding fundamental (A3), the same root note
// Exercises 1, 3, 4, 5, 6 & 7 already settled on — every harmonic layer
// below is set once at start and NEVER re-pitched.
const FUNDAMENTAL_HZ = 220
const RESTING_GAIN = 0.03 // a peaceful, unmodulated background presence
const AMBIENT_FADE_IN_TIME_CONSTANT_S = 1.0
const RELEASE_TIME_CONSTANT_S = 0.6
const RELEASE_SETTLE_MS = RELEASE_TIME_CONSTANT_S * 5 * 1000
const LOWPASS_CUTOFF_HZ = 2_600
const REVERB_WET_LEVEL = 0.3
const REVERB_DURATION_S = 2.0
const REVERB_DECAY = 2.8

// The same singing-bowl-style partial stack as Exercises 1, 3, 4, 5, 6 &
// 7's own drones — fundamental, a few-cents-sharp unison for warm
// natural beating, and two falling-gain upper partials — a consistent
// sonic identity across the whole suite.
const HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

// A tiny, dependency-free seeded PRNG (mulberry32) — just enough
// determinism that one exercise run has one fixed, reproducible target
// order (computed once at start, never re-shuffled mid-run), while a
// fresh seed each run keeps the sequence varied session to session.
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const a = result[i]
    const b = result[j]
    if (a === undefined || b === undefined) continue
    result[i] = b
    result[j] = a
  }
  return result
}

// Round/phase timing is a pure function of elapsed time — the same
// technique every exercise in this suite already uses. Only WHICH
// target is assigned to each round is randomized (see handleStart);
// timing itself never depends on that.
function computeScene(elapsedMs: number): { round: number; subPhase: SubPhase; progress: number } {
  if (elapsedMs < LEAD_IN_MS) {
    return { round: 0, subPhase: 'lead-in', progress: 0 }
  }
  let cursor = LEAD_IN_MS
  for (let round = 0; round < ROUNDS; round++) {
    const gazeEnd = cursor + GAZE_MS
    const retentionEnd = gazeEnd + RETENTION_MS
    if (elapsedMs < gazeEnd) {
      const phaseElapsedMs = elapsedMs - cursor
      return { round, subPhase: 'gaze', progress: phaseElapsedMs / GAZE_MS }
    }
    if (elapsedMs < retentionEnd) {
      const phaseElapsedMs = elapsedMs - gazeEnd
      return { round, subPhase: 'retention', progress: phaseElapsedMs / RETENTION_MS }
    }
    cursor = retentionEnd + ROUND_TRANSITION_GAP_MS
  }
  return { round: ROUNDS - 1, subPhase: 'retention', progress: 1 }
}

// A short, softly-decaying stereo noise tail — the cheapest way to get a
// real convolution-reverb "bloom" without shipping an audio sample.
// Regenerated once per AudioContext, since a ConvolverNode's buffer
// can't be reused across contexts. Identical technique to Exercises 1,
// 3, 4, 5, 6 & 7.
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

export function TratakAfterimageStretches({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const roundTargetsRef = useRef<readonly TargetItem[]>([])
  const lastSubPhaseKeyRef = useRef<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const harmonicVoicesRef = useRef<readonly HarmonicVoice[]>([])

  // The gaze ring's own progress (0→1 across the 35s gaze phase) —
  // driven every animation frame from real elapsed time, never React
  // state, so the ring sweep stays a true 60fps.
  const ringProgress = useMotionValue(0)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Cleanup mirrors Exercises 1-7's own guard exactly: the returned
  // function fires on every `phase` change AND on unmount, but must only
  // actually tear audio down when LEAVING 'active' — never when entering
  // it. See ThetaBreathingAnchor.tsx for the full reasoning.
  useEffect(() => {
    return () => {
      if (phase !== 'active') return
      teardownAudio()
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'active') return undefined
    const interval = setInterval(() => {
      if (!isMountedRef.current || startedAtRef.current === null) return
      const realElapsedMs = performance.now() - startedAtRef.current
      setElapsedMs(Math.min(TOTAL_EXERCISE_MS, realElapsedMs))
    }, PHASE_TICK_MS)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase === 'active' && elapsedMs >= TOTAL_EXERCISE_MS) {
      finishExercise()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, elapsedMs])

  // The real, frame-accurate driver: recomputes the gaze ring's progress
  // from real elapsed time every frame, and edge-triggers the haptic
  // exactly once per phase transition by comparing against the
  // last-fired round+subPhase key.
  useAnimationFrame(() => {
    if (phaseRef.current !== 'active' || startedAtRef.current === null) return
    const elapsed = Math.min(TOTAL_EXERCISE_MS, performance.now() - startedAtRef.current)
    const scene = computeScene(elapsed)
    ringProgress.set(scene.subPhase === 'gaze' ? scene.progress : 0)

    const key = `${scene.round}:${scene.subPhase}`
    if (key !== lastSubPhaseKeyRef.current) {
      lastSubPhaseKeyRef.current = key
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(HAPTIC_TRANSITION_MS)
    }
  })

  function initAudio(): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    if (audioContextRef.current) return

    const audioContext = new AudioContext()
    const now = audioContext.currentTime

    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0, now)
    // A single, gentle settling-in swell — and nothing else ever touches
    // this gain again until teardown. A peaceful, unmodulated presence.
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
      // Set once, here, and never scheduled again — a fixed, stable
      // drone with no frequency automation anywhere in its lifetime.
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
  }

  function teardownAudio(): void {
    const audioContext = audioContextRef.current
    const masterGain = masterGainRef.current
    const voices = harmonicVoicesRef.current
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
      void audioContext?.close().catch(() => undefined)
    }, RELEASE_SETTLE_MS)
    audioContextRef.current = null
    masterGainRef.current = null
    harmonicVoicesRef.current = []
  }

  function handleStart(): void {
    initAudio()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(0)
    roundTargetsRef.current = shuffle(TARGET_POOL, mulberry32(Date.now())).slice(0, ROUNDS)
    lastSubPhaseKeyRef.current = null
    startedAtRef.current = performance.now()
    ringProgress.set(0)
    setElapsedMs(0)
    setPhase('active')
  }

  function finishExercise(): void {
    teardownAudio()
    setPhase('complete')
  }

  function handleSkip(): void {
    teardownAudio()
    setPhase('complete')
  }

  const scene = computeScene(elapsedMs)
  const phaseDurationMs = scene.subPhase === 'retention' ? RETENTION_MS : GAZE_MS
  const phaseRemainingSeconds = Math.ceil((phaseDurationMs - phaseDurationMs * scene.progress) / 1000)
  const currentRound = scene.round + 1
  const targetItem = roundTargetsRef.current[scene.round] ?? FALLBACK_TARGET

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
      <BrandWatermark className="absolute top-4 left-6" />
      {/* Rich, layered ambient wash — the same indigo/violet/cyan
          treatment as the rest of the suite, for a consistent Brain Gym
          identity. */}
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

      {/* The retention wash — a slow, calm breathing pulse that replaces
          the gaze target once eyes close. A simple declarative loop is
          all this needs; it never needs frame-accurate driving. */}
      {phase === 'active' && scene.subPhase === 'retention' && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 50% 45%, rgba(139,92,246,0.4) 0%, rgba(67,56,202,0.3) 45%, transparent 75%)' }}
        />
      )}

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Tratak Afterimage Stretches</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Flame className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Steady Your Gaze</h2>
          <p className="text-sm text-muted-foreground">
            A slower, deeper practice — 35 seconds gazing steadily at a vivid target, then 35 seconds with your eyes closed, holding its
            afterimage. Repeats across 3 rounds (about 3.5 minutes total). A light tap marks each transition.
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

      {phase === 'active' && (
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center" style={{ width: RING_SIZE_PX, height: RING_SIZE_PX }}>
            {scene.subPhase !== 'retention' && (
              <>
                <svg
                  aria-hidden="true"
                  viewBox={`0 0 ${RING_SIZE_PX} ${RING_SIZE_PX}`}
                  className="absolute inset-0 size-full -rotate-90"
                >
                  <circle
                    cx={RING_SIZE_PX / 2}
                    cy={RING_SIZE_PX / 2}
                    r={RING_RADIUS_PX}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4}
                    className="text-violet-500/15 dark:text-violet-300/12"
                  />
                  <motion.circle
                    cx={RING_SIZE_PX / 2}
                    cy={RING_SIZE_PX / 2}
                    r={RING_RADIUS_PX}
                    fill="none"
                    stroke="url(#tratakRingGradient)"
                    strokeWidth={4}
                    strokeLinecap="round"
                    // Framer Motion computes the correct strokeDasharray/
                    // strokeDashoffset internally from this 0..1 progress
                    // motion value every frame — no manual dash math
                    // needed.
                    style={{ pathLength: ringProgress }}
                  />
                  <defs>
                    <linearGradient id="tratakRingGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>

                {targetItem.kind === 'geometric' ? (
                  <div className="relative flex size-20 items-center justify-center">
                    <div aria-hidden="true" className="absolute inset-[-18px] rounded-full blur-xl" style={{ background: targetItem.glow }} />
                    <targetItem.icon aria-hidden="true" className="relative size-16" style={{ color: targetItem.solid }} strokeWidth={2} />
                  </div>
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-full bg-black shadow-[0_0_30px_-4px_rgba(0,0,0,0.6)]">
                    <targetItem.icon aria-hidden="true" className="size-11 text-white" strokeWidth={1.5} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="max-w-[260px] font-heading text-lg font-semibold text-foreground">{SUBPHASE_LABEL[scene.subPhase]}</span>
            <span className="text-sm font-medium text-muted-foreground">
              Round {currentRound} of {ROUNDS}
            </span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: ROUNDS }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < scene.round
                      ? 'size-1.5 rounded-full bg-violet-500'
                      : index === scene.round
                        ? 'size-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_1px_rgba(34,211,238,0.8)]'
                        : 'size-1.5 rounded-full bg-muted-foreground/25'
                  }
                />
              ))}
            </div>
            <p className="text-sm font-medium tabular-nums text-muted-foreground">{phaseRemainingSeconds}s remaining in this phase</p>
          </div>

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
            <Flame className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Inner Vision Sharpened</h2>
          <p className="text-sm text-muted-foreground">Your gaze held steady, and your mind held the image after your eyes closed.</p>
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
