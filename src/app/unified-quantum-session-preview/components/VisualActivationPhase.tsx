'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Heart,
  Cloud,
  Sun,
  Moon,
  Leaf,
  Snowflake,
  Flame,
  Zap,
  Anchor,
  Gem,
  Compass,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { playClickChime, playCorrectChime, playGentleMissChime } from './soundEngine'
import {
  FLASH_SPEED_OPTIONS,
  DEFAULT_FLASH_SPEED_MS,
  ITEMS_PER_ROUND,
  buildRounds,
  computeVisualActivationAccuracy,
  computeVisualActivationSpeedScore,
  type FlashSpeedMs,
  type VisualActivationRound,
} from './visualActivationDataset'

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Star,
  Heart,
  Cloud,
  Sun,
  Moon,
  Leaf,
  Snowflake,
  Flame,
  Zap,
  Anchor,
  Gem,
  Compass,
}

const COUNTDOWN_STATES: readonly string[] = ['3', '2', '1', 'GO!']
const COUNTDOWN_TOTAL_MS = 3_000
const COUNTDOWN_STEP_MS = COUNTDOWN_TOTAL_MS / COUNTDOWN_STATES.length
const FEEDBACK_DURATION_MS = 500

type Phase = 'config' | 'countdown' | 'flash' | 'response' | 'feedback'

type VisualActivationPhaseProps = { onComplete: (accuracyPercent: number, speedScore: number) => void }

// A depleting circular ring for one countdown tick — own local copy per
// this project's established "each area owns its own copy" convention.
function CountdownRing({ durationMs, children }: { durationMs: number; children: React.ReactNode }): React.JSX.Element {
  const [depleted, setDepleted] = useState(false)
  const secondFrameRef = useRef<number | null>(null)
  const size = 112
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const firstFrame = requestAnimationFrame(() => {
      secondFrameRef.current = requestAnimationFrame(() => setDepleted(true))
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      if (secondFrameRef.current !== null) cancelAnimationFrame(secondFrameRef.current)
    }
  }, [])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-foreground/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="stroke-primary"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: depleted ? circumference : 0,
            transition: `stroke-dashoffset ${durationMs}ms linear`,
          }}
        />
      </svg>
      <span className="absolute font-heading text-3xl font-bold tracking-tight text-foreground">{children}</span>
    </div>
  )
}

// Level 2 — pick a flash speed, then a flash-then-recognize icon drill.
// Auto-advances through all rounds on its own; the only user choice is
// the speed config screen at the start. Reports accuracy once, via
// onComplete, when the last round's feedback window ends — the caller
// (orchestrator) is responsible for the reward popup and XP.
export function VisualActivationPhase({ onComplete }: VisualActivationPhaseProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('config')
  const [speedMs, setSpeedMs] = useState<FlashSpeedMs>(DEFAULT_FLASH_SPEED_MS)
  const [countdownIndex, setCountdownIndex] = useState(0)
  const [rounds, setRounds] = useState<readonly VisualActivationRound[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const isMountedRef = useRef(true)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  function handlePickSpeed(ms: FlashSpeedMs): void {
    playClickChime()
    setSpeedMs(ms)
    setRounds(buildRounds(ITEMS_PER_ROUND))
    setPhase('countdown')
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    const timeout = setTimeout(() => {
      const nextIndex = countdownIndex + 1
      if (nextIndex >= COUNTDOWN_STATES.length) {
        setPhase('flash')
      } else {
        setCountdownIndex(nextIndex)
      }
    }, COUNTDOWN_STEP_MS)
    return () => clearTimeout(timeout)
  }, [phase, countdownIndex])

  useEffect(() => {
    if (phase !== 'flash') return
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return
      setPhase('response')
    }, speedMs)
    return () => clearTimeout(timeout)
  }, [phase, speedMs, roundIndex])

  function handleSelect(option: string): void {
    if (phase !== 'response') return
    const currentRound = rounds[roundIndex]
    if (currentRound === undefined) return

    const isCorrect = option === currentRound.targetLabel
    setSelectedOption(option)
    if (isCorrect) {
      setCorrectCount((count) => count + 1)
      playCorrectChime()
    } else {
      playGentleMissChime()
    }
    setPhase('feedback')

    setTimeout(() => {
      if (!isMountedRef.current) return
      const nextIndex = roundIndex + 1
      if (nextIndex >= rounds.length) {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true
          const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount
          onComplete(computeVisualActivationAccuracy(finalCorrectCount, rounds.length), computeVisualActivationSpeedScore(speedMs))
        }
        return
      }
      setRoundIndex(nextIndex)
      setSelectedOption(null)
      setPhase('flash')
    }, FEEDBACK_DURATION_MS)
  }

  const currentRound = rounds[roundIndex]
  const TargetIcon = currentRound !== undefined ? ICON_COMPONENTS[currentRound.targetName] : undefined

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Right-Brain Visual Activation</p>

      {phase === 'config' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex w-full max-w-xs flex-col items-center gap-6"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Choose Your Flash Speed</h2>
          <p className="text-sm text-muted-foreground">Faster speeds train sharper visual retention.</p>
          <div className="flex w-full flex-col gap-3">
            {FLASH_SPEED_OPTIONS.map((option) => (
              <button
                key={option.ms}
                type="button"
                onClick={() => handlePickSpeed(option.ms)}
                className={cn(
                  'flex items-center justify-between rounded-2xl border-2 border-border bg-card/60 px-5 py-4 text-left',
                  'transition-colors duration-200 hover:border-primary/40 hover:bg-accent/20',
                )}
              >
                <span className="text-sm font-semibold text-foreground">{option.label}</span>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">{option.hint}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'countdown' && (
        <CountdownRing key={countdownIndex} durationMs={COUNTDOWN_STEP_MS}>
          {COUNTDOWN_STATES[countdownIndex]}
        </CountdownRing>
      )}

      {(phase === 'flash' || phase === 'response' || phase === 'feedback') && currentRound !== undefined && (
        <div className="flex w-full max-w-xs flex-col items-center gap-6">
          <p className="text-xs font-medium tabular-nums text-muted-foreground">
            Round {roundIndex + 1} of {rounds.length}
          </p>

          {phase === 'flash' && TargetIcon !== undefined && (
            <motion.div
              key={`flash-${roundIndex}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex size-32 items-center justify-center rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10"
            >
              <TargetIcon className="size-16 text-indigo-500" aria-hidden="true" />
            </motion.div>
          )}

          {(phase === 'response' || phase === 'feedback') && (
            <div className="grid w-full grid-cols-2 gap-3">
              {currentRound.options.map((option) => {
                const isPickedCorrect = phase === 'feedback' && selectedOption === option && option === currentRound.targetLabel
                const isPickedWrong = phase === 'feedback' && selectedOption === option && option !== currentRound.targetLabel
                const isCorrectReveal = phase === 'feedback' && option === currentRound.targetLabel && selectedOption !== option
                let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
                if (phase === 'feedback') {
                  if (isPickedCorrect || isCorrectReveal) stateClassName = 'border-emerald-500 bg-emerald-500/5'
                  else if (isPickedWrong) stateClassName = 'border-red-500 bg-red-500/5'
                  else stateClassName = 'border-border opacity-40'
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={phase !== 'response'}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'rounded-2xl border-2 px-4 py-4 text-sm font-medium text-foreground transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      stateClassName,
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
