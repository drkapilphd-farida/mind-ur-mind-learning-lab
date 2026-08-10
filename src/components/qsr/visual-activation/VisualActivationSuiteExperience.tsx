'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, PartyPopper } from 'lucide-react'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { CardinalOculomotorStretches } from './CardinalOculomotorStretches'
import { InfinityFigureEightGliding } from './InfinityFigureEightGliding'
import { ThetaBreathingAnchor } from './ThetaBreathingAnchor'
import { VISUAL_ACTIVATION_SUITE } from './visualActivationSuite'

const LAB_HREF = '/labs/quantum-speed-reading'

type SuitePhase = 'theta-breathing-anchor' | 'cardinal-oculomotor-stretches' | 'infinity-figure-eight-gliding' | 'complete'

// Brain Gym™ — the orchestrator for the whole 7-exercise Visual Activation
// Suite, mounted as its own ungated pillar (see LabPillarsGrid.tsx).
// Exercises 1, 2, and 3 are real today; rather than force learners through
// 4 fake blocking screens, completing them leads straight to an honest
// roadmap of what's coming next. Progress is recorded the same way it
// always was — one savePracticeSession call per completed exercise,
// `labId: 'visual-intelligence'` — kept unchanged so no already-saved
// progress data is orphaned; purely cosmetic/analytics now that no
// paywall gate depends on it.
export function VisualActivationSuiteExperience(): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<SuitePhase>('theta-breathing-anchor')
  const startedAtRef = useRef(Date.now())

  function handleExit(): void {
    router.push(LAB_HREF)
  }

  function handleThetaBreathingComplete(): void {
    const durationMs = Math.max(1, Date.now() - startedAtRef.current)
    void savePracticeSession({
      labId: 'visual-intelligence',
      exerciseId: 'theta-breathing-anchor',
      durationMs,
      completed: true,
    })
    startedAtRef.current = Date.now()
    setPhase('cardinal-oculomotor-stretches')
  }

  function handleCardinalOculomotorComplete(): void {
    const durationMs = Math.max(1, Date.now() - startedAtRef.current)
    void savePracticeSession({
      labId: 'visual-intelligence',
      exerciseId: 'cardinal-oculomotor-stretches',
      durationMs,
      completed: true,
    })
    startedAtRef.current = Date.now()
    setPhase('infinity-figure-eight-gliding')
  }

  function handleInfinityFigureEightComplete(): void {
    const durationMs = Math.max(1, Date.now() - startedAtRef.current)
    void savePracticeSession({
      labId: 'visual-intelligence',
      exerciseId: 'infinity-figure-eight-gliding',
      durationMs,
      completed: true,
    })
    setPhase('complete')
  }

  if (phase === 'theta-breathing-anchor') {
    return <ThetaBreathingAnchor onComplete={handleThetaBreathingComplete} onExit={handleExit} />
  }

  if (phase === 'cardinal-oculomotor-stretches') {
    return <CardinalOculomotorStretches onComplete={handleCardinalOculomotorComplete} onExit={handleExit} />
  }

  if (phase === 'infinity-figure-eight-gliding') {
    return <InfinityFigureEightGliding onComplete={handleInfinityFigureEightComplete} onExit={handleExit} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-16 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-teal-500/20 text-indigo-500">
        <PartyPopper className="size-7" aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Visual Activation Started</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Theta Breathing &amp; Focal Anchor, Cardinal Oculomotor Stretches, and Infinity Figure-8 Gliding are complete. The rest of the suite is
          on its way.
        </p>
      </div>

      <ul className="w-full space-y-2 text-left">
        {VISUAL_ACTIVATION_SUITE.map((exercise) => (
          <li
            key={exercise.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3"
          >
            {exercise.isImplemented ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden="true" />
            ) : (
              <exercise.icon className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{exercise.title}</span>
            {exercise.isImplemented ? (
              <span className="shrink-0 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Done</span>
            ) : (
              <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-600 uppercase dark:text-amber-400">
                Soon
              </span>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleExit}
        className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30"
      >
        Return to Lab
      </button>
    </motion.div>
  )
}
