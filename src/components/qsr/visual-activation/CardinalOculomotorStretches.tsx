'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, Eye, SkipForward } from 'lucide-react'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import type { VisualActivationExerciseProps } from './types'

// Cardinal Oculomotor Stretches™ — Exercise 2 of the Visual Activation
// Suite. A glowing target dot stretches the eyes through the 4 cardinal
// and 4 diagonal directions (center → vertex → center, one at a time),
// then finishes with two smooth laps around the circle those vertices
// sit on — three synchronized channels, matching Exercise 1's own
// architecture: a trailing, richly-lit glow dot (visual), a light tap
// exactly when the target reaches a vertex or starts a new direction
// (haptic), and a soft one-shot directional chime — pitch maps to the
// vertical axis, stereo pan to the horizontal one — at the same moments
// (audio). Every oscillator here is a short, one-shot transient with a
// frequency set once and never ramped — the lesson from Exercise 1's own
// "siren" bug: a moving pitch is what reads as an alarm, not a static
// tone, so nothing in this file ever glides a frequency.

type Direction = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right'
type ExercisePhase = 'intro' | 'active' | 'complete'
type LegPhase = 'outward' | 'hold' | 'return'

type Scene =
  | { kind: 'stretch'; direction: Direction; legPhase: LegPhase; x: number; y: number; scale: number; stepIndex: number }
  | { kind: 'circular'; x: number; y: number; scale: number; quadrant: number; revolution: number }
  | { kind: 'done' }

const SIZE_PX = 280
const CENTER_PX = SIZE_PX / 2
const TARGET_RADIUS_PX = 96

const OUTWARD_MS = 950
const HOLD_MS = 320
const RETURN_MS = 950
const DIRECTION_LEG_MS = OUTWARD_MS + HOLD_MS + RETURN_MS

// Cardinals first, then a clockwise sweep through the diagonals — the
// same order the spec calls out (Up, Down, Left, Right, Diagonals).
const STRETCH_SEQUENCE: readonly Direction[] = ['up', 'down', 'left', 'right', 'up-right', 'down-right', 'down-left', 'up-left']
const STRETCH_PHASE_MS = DIRECTION_LEG_MS * STRETCH_SEQUENCE.length

const REVOLUTION_MS = 5_500
const CIRCULAR_REVOLUTIONS = 2
const CIRCULAR_PHASE_MS = REVOLUTION_MS * CIRCULAR_REVOLUTIONS
const TOTAL_EXERCISE_MS = STRETCH_PHASE_MS + CIRCULAR_PHASE_MS

// Cheap enough for label/step-counter React state (~5 renders/sec) — the
// actual pixel motion and haptic/audio event timing never touch this;
// both are driven off a real-elapsed-time rAF loop below for
// frame-accurate precision instead.
const PHASE_TICK_MS = 200

// A light tap, distinctly lighter than Exercise 1's multi-pulse breathing
// pattern — this exercise's cues are single momentary taps, not a
// sustained rhythm. Slightly firmer at a vertex (arrival) than at a
// direction-start (departure), and lightest during the continuous
// circular sweep.
const HAPTIC_DIRECTION_START_MS = 10
const HAPTIC_VERTEX_MS = 18
const HAPTIC_CIRCULAR_MS = 12

// One-shot chime envelope — linear attack into an exponential decay
// (never a sustained tone, never a frequency ramp), the same idiom
// already proven throughout this app's UI sound effects.
const CHIME_ATTACK_S = 0.018
const CHIME_DURATION_S = 0.38
const CHIME_PEAK_GAIN = 0.11

const ALL_DIRECTIONS: readonly Direction[] = ['up', 'up-right', 'right', 'down-right', 'down', 'down-left', 'left', 'up-left']

const DIRECTION_VERTEX: Record<Direction, { x: number; y: number }> = (() => {
  const diagonal = TARGET_RADIUS_PX / Math.SQRT2
  return {
    up: { x: 0, y: -TARGET_RADIUS_PX },
    down: { x: 0, y: TARGET_RADIUS_PX },
    left: { x: -TARGET_RADIUS_PX, y: 0 },
    right: { x: TARGET_RADIUS_PX, y: 0 },
    'up-left': { x: -diagonal, y: -diagonal },
    'up-right': { x: diagonal, y: -diagonal },
    'down-left': { x: -diagonal, y: diagonal },
    'down-right': { x: diagonal, y: diagonal },
  }
})()

const DIRECTION_LABEL: Record<Direction, string> = {
  up: 'Look Up',
  down: 'Look Down',
  left: 'Look Left',
  right: 'Look Right',
  'up-left': 'Look Up-Left',
  'up-right': 'Look Up-Right',
  'down-left': 'Look Down-Left',
  'down-right': 'Look Down-Right',
}

// The chime's pitch maps to the vertical axis (up = brighter, down =
// deeper) and its stereo pan maps to the horizontal axis — so the sound
// itself carries the same directional information the eyes are tracking.
const DIRECTION_TONE: Record<Direction, { freq: number; pan: number }> = {
  up: { freq: 587.33, pan: 0 }, // D5
  down: { freq: 293.66, pan: 0 }, // D4
  left: { freq: 440, pan: -0.6 }, // A4
  right: { freq: 440, pan: 0.6 },
  'up-left': { freq: 587.33, pan: -0.5 },
  'up-right': { freq: 587.33, pan: 0.5 },
  'down-left': { freq: 293.66, pan: -0.5 },
  'down-right': { freq: 293.66, pan: 0.5 },
}

// The 4 compass points crossed on every lap of the circular phase, in
// crossing order — reuses the exact same tones as the cardinal stretches
// above for a consistent sonic identity across both halves of the
// exercise.
const QUADRANT_DIRECTION: readonly Direction[] = ['up', 'right', 'down', 'left']

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function easeInCubic(t: number): number {
  return t ** 3
}

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t))
}

function computeScene(elapsedMs: number): Scene {
  if (elapsedMs < STRETCH_PHASE_MS) {
    const stepIndex = Math.min(STRETCH_SEQUENCE.length - 1, Math.floor(elapsedMs / DIRECTION_LEG_MS))
    // STRETCH_SEQUENCE.length is a fixed 8 and stepIndex is clamped above,
    // so this index is always in range — the fallback only exists to
    // satisfy noUncheckedIndexedAccess, never actually reached.
    const direction = STRETCH_SEQUENCE[stepIndex] ?? 'up'
    const vertex = DIRECTION_VERTEX[direction]
    const legElapsed = elapsedMs - stepIndex * DIRECTION_LEG_MS

    if (legElapsed < OUTWARD_MS) {
      const t = easeOutCubic(clamp01(legElapsed / OUTWARD_MS))
      return { kind: 'stretch', direction, legPhase: 'outward', x: vertex.x * t, y: vertex.y * t, scale: 1 + 0.32 * t, stepIndex }
    }
    if (legElapsed < OUTWARD_MS + HOLD_MS) {
      return { kind: 'stretch', direction, legPhase: 'hold', x: vertex.x, y: vertex.y, scale: 1.32, stepIndex }
    }
    const t = easeInCubic(clamp01((legElapsed - OUTWARD_MS - HOLD_MS) / RETURN_MS))
    return { kind: 'stretch', direction, legPhase: 'return', x: vertex.x * (1 - t), y: vertex.y * (1 - t), scale: 1.32 - 0.32 * t, stepIndex }
  }

  if (elapsedMs < TOTAL_EXERCISE_MS) {
    const circularElapsed = elapsedMs - STRETCH_PHASE_MS
    const angle = (circularElapsed / REVOLUTION_MS) * Math.PI * 2
    const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    return {
      kind: 'circular',
      x: TARGET_RADIUS_PX * Math.sin(angle),
      y: -TARGET_RADIUS_PX * Math.cos(angle),
      scale: 1.08,
      quadrant: Math.floor(normalizedAngle / (Math.PI / 2)),
      revolution: Math.floor(circularElapsed / REVOLUTION_MS),
    }
  }

  return { kind: 'done' }
}

// A single soft, bell-like tap — linear attack, exponential decay,
// frequency set once via setValueAtTime and never touched again. Panned
// per direction so left/right cues are audible as well as visible.
function playDirectionalChime(audioContext: AudioContext, direction: Direction): void {
  const { freq, pan } = DIRECTION_TONE[direction]
  const now = audioContext.currentTime
  const stopTime = now + CHIME_DURATION_S

  const oscillator = audioContext.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(freq, now)

  // One soft overtone (an octave up, at low gain) gives the tap a gentle
  // "bell" character instead of a flat, sterile beep.
  const overtone = audioContext.createOscillator()
  overtone.type = 'sine'
  overtone.frequency.setValueAtTime(freq * 2, now)

  const gain = audioContext.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(CHIME_PEAK_GAIN, now + CHIME_ATTACK_S)
  gain.gain.exponentialRampToValueAtTime(0.0001, stopTime)

  const overtoneGain = audioContext.createGain()
  overtoneGain.gain.setValueAtTime(0, now)
  overtoneGain.gain.linearRampToValueAtTime(CHIME_PEAK_GAIN * 0.28, now + CHIME_ATTACK_S)
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, stopTime)

  const panner = audioContext.createStereoPanner()
  panner.pan.setValueAtTime(pan, now)

  oscillator.connect(gain)
  overtone.connect(overtoneGain)
  gain.connect(panner)
  overtoneGain.connect(panner)
  panner.connect(audioContext.destination)

  oscillator.start(now)
  overtone.start(now)
  oscillator.stop(stopTime + 0.05)
  overtone.stop(stopTime + 0.05)
}

export function CardinalOculomotorStretches({ onComplete, onExit }: VisualActivationExerciseProps): React.JSX.Element {
  const [phase, setPhase] = useState<ExercisePhase>('intro')
  const [elapsedMs, setElapsedMs] = useState(0)

  const isMountedRef = useRef(true)
  const phaseRef = useRef<ExercisePhase>('intro')
  const startedAtRef = useRef<number | null>(null)
  const lastEventKeyRef = useRef<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // The leader dot's real position — driven every animation frame from
  // real elapsed time, never from React state, so the glide stays a true
  // 60fps regardless of what the cheap display tick below is doing. Three
  // useSpring "chasers" at falling stiffness trail behind it, the
  // standard framer-motion technique for a comet-style motion trail.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const trail1X = useSpring(x, { stiffness: 220, damping: 26 })
  const trail1Y = useSpring(y, { stiffness: 220, damping: 26 })
  const trail2X = useSpring(x, { stiffness: 120, damping: 22 })
  const trail2Y = useSpring(y, { stiffness: 120, damping: 22 })
  const trail3X = useSpring(x, { stiffness: 65, damping: 18 })
  const trail3Y = useSpring(y, { stiffness: 65, damping: 18 })

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Cleanup mirrors Exercise 1's own guard exactly: the returned function
  // fires on every `phase` change AND on unmount, but must only actually
  // tear audio down when LEAVING 'active' — never when entering it. See
  // ThetaBreathingAnchor.tsx for the full reasoning.
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

  // The real, frame-accurate driver: recomputes position from real
  // elapsed time every frame (never accumulated), and edge-triggers each
  // haptic/chime exactly once per vertex/direction-change/compass
  // crossing by comparing against the last-fired event's own identity.
  useAnimationFrame(() => {
    if (phaseRef.current !== 'active' || startedAtRef.current === null) return
    const elapsedMs = Math.min(TOTAL_EXERCISE_MS, performance.now() - startedAtRef.current)
    const scene = computeScene(elapsedMs)
    if (scene.kind === 'done') return

    x.set(scene.x)
    y.set(scene.y)
    scale.set(scene.scale)

    if (scene.kind === 'stretch') {
      if (scene.legPhase === 'outward') {
        const key = `stretch:${scene.stepIndex}:start`
        if (key !== lastEventKeyRef.current) {
          lastEventKeyRef.current = key
          fireCue(scene.direction, HAPTIC_DIRECTION_START_MS)
        }
      } else if (scene.legPhase === 'hold') {
        const key = `stretch:${scene.stepIndex}:vertex`
        if (key !== lastEventKeyRef.current) {
          lastEventKeyRef.current = key
          fireCue(scene.direction, HAPTIC_VERTEX_MS)
        }
      }
    } else {
      const key = `circular:${scene.revolution}:${scene.quadrant}`
      if (key !== lastEventKeyRef.current) {
        lastEventKeyRef.current = key
        // scene.quadrant is always 0-3 (see computeScene's own modulo
        // math) and QUADRANT_DIRECTION has exactly 4 entries — the
        // fallback only exists to satisfy noUncheckedIndexedAccess.
        fireCue(QUADRANT_DIRECTION[scene.quadrant] ?? 'up', HAPTIC_CIRCULAR_MS)
      }
    }
  })

  function initAudio(): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    if (audioContextRef.current) return
    audioContextRef.current = new AudioContext()
  }

  function teardownAudio(): void {
    const audioContext = audioContextRef.current
    audioContextRef.current = null
    if (audioContext) void audioContext.close().catch(() => undefined)
  }

  function fireCue(direction: Direction, hapticMs: number): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(hapticMs)
    const audioContext = audioContextRef.current
    if (audioContext) playDirectionalChime(audioContext, direction)
  }

  function handleStart(): void {
    initAudio()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(0)
    lastEventKeyRef.current = null
    startedAtRef.current = performance.now()
    x.set(0)
    y.set(0)
    scale.set(1)
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

  const displayScene = computeScene(elapsedMs)
  const remainingSeconds = Math.ceil((TOTAL_EXERCISE_MS - elapsedMs) / 1000)
  const currentStepIndex = displayScene.kind === 'stretch' ? displayScene.stepIndex : STRETCH_SEQUENCE.length
  const displayLabel = displayScene.kind === 'stretch' ? DIRECTION_LABEL[displayScene.direction] : displayScene.kind === 'circular' ? 'Trace the Circle' : 'Almost there…'
  const totalSteps = STRETCH_SEQUENCE.length + 1

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
      <BrandWatermark className="absolute top-4 left-6" />
      {/* Rich, layered ambient wash — the same indigo/violet/cyan
          treatment as Exercise 1, for a consistent Brain Gym identity. */}
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

      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Cardinal Oculomotor Stretches</p>

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex max-w-sm flex-col items-center gap-5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/25 text-violet-600 shadow-lg shadow-violet-500/20 dark:text-violet-300">
            <Eye className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Stretch Your Eye Muscles</h2>
          <p className="text-sm text-muted-foreground">
            Follow the glowing dot with your eyes only — up, down, left, right, the diagonals, then two smooth laps around the circle. A soft
            tap and chime mark every direction.
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
          <div className="relative" style={{ width: SIZE_PX, height: SIZE_PX }}>
            {/* A faint compass guide — the 8 vertices and the circle they
                sit on — so the eyes can anticipate where the dot travels
                next, matching a real vision-therapy chart. */}
            <svg aria-hidden="true" viewBox={`0 0 ${SIZE_PX} ${SIZE_PX}`} className="absolute inset-0 size-full">
              <circle
                cx={CENTER_PX}
                cy={CENTER_PX}
                r={TARGET_RADIUS_PX}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray="2 6"
                className="text-violet-500/25 dark:text-violet-300/20"
              />
              {ALL_DIRECTIONS.map((direction) => {
                const vertex = DIRECTION_VERTEX[direction]
                return (
                  <line
                    key={direction}
                    x1={CENTER_PX}
                    y1={CENTER_PX}
                    x2={CENTER_PX + vertex.x}
                    y2={CENTER_PX + vertex.y}
                    stroke="currentColor"
                    strokeWidth={1}
                    className="text-indigo-500/15 dark:text-indigo-300/10"
                  />
                )
              })}
            </svg>

            {/* Trailing ghosts, back-to-front: larger, blurrier, fainter
                the further they lag — a cheap, fully GPU-driven comet
                trail via three useSpring "chasers" of the leader's own
                motion values, never a React re-render. */}
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-[22px] -mt-[22px] size-11 rounded-full opacity-20 blur-md"
                style={{ x: trail3X, y: trail3Y, background: 'radial-gradient(circle, rgba(34,211,238,0.9) 0%, rgba(139,92,246,0.8) 100%)' }}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-5 -mt-5 size-10 rounded-full opacity-35 blur-sm"
                style={{ x: trail2X, y: trail2Y, background: 'radial-gradient(circle, rgba(34,211,238,0.9) 0%, rgba(139,92,246,0.85) 100%)' }}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div
                aria-hidden="true"
                className="-ml-[18px] -mt-[18px] size-9 rounded-full opacity-55 blur-[2px]"
                style={{ x: trail1X, y: trail1Y, background: 'radial-gradient(circle, rgba(34,211,238,0.95) 0%, rgba(139,92,246,0.9) 100%)' }}
              />
            </div>

            {/* The leader — a small glass-bright core inside a soft
                bloom, the same premium indigo/violet/cyan depth treatment
                as Exercise 1's breathing orb. */}
            <div className="absolute left-1/2 top-1/2 size-0">
              <motion.div className="-ml-4 -mt-4 flex size-8 items-center justify-center rounded-full" style={{ x, y, scale }}>
                <div
                  aria-hidden="true"
                  className="absolute inset-[-12px] rounded-full blur-lg"
                  style={{ background: 'radial-gradient(circle, rgba(165,243,252,0.9) 0%, rgba(139,92,246,0.75) 55%, transparent 100%)' }}
                />
                <div
                  aria-hidden="true"
                  className="relative size-full rounded-full border border-white/70 shadow-[0_0_28px_-3px_rgba(139,92,246,0.9)]"
                  style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(34,211,238,0.95) 45%, rgba(79,70,229,0.95) 100%)' }}
                />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="font-heading text-lg font-semibold text-foreground">{displayLabel}</span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: totalSteps }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < currentStepIndex
                      ? 'size-1.5 rounded-full bg-violet-500'
                      : index === currentStepIndex
                        ? 'size-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_1px_rgba(34,211,238,0.8)]'
                        : 'size-1.5 rounded-full bg-muted-foreground/25'
                  }
                />
              ))}
            </div>
            <p className="text-sm font-medium tabular-nums text-muted-foreground">{remainingSeconds}s remaining</p>
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
            <Eye className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Eyes Stretched</h2>
          <p className="text-sm text-muted-foreground">Your eye muscles are warmed up and tracking smoothly.</p>
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
