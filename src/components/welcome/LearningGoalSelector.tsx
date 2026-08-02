'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LEARNING_GOALS, type LearningGoalId } from '@/constants/learning'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ArrivalBackground } from './ArrivalBackground'
import { OnboardingJourneyIndicator } from './OnboardingJourneyIndicator'

// Sprint LW-1A — Learning Goal™ (Screen 2). Single-select card grid, real
// <button> elements with role="group" + aria-pressed — the same accessible
// single-select pattern already established elsewhere in this codebase
// (e.g. ImagePersistenceReflectionScreen.tsx, ChoiceGrid.tsx). No database
// write: the selection travels forward only as a URL query param, per this
// sprint's explicit "no business logic changes / no database changes"
// constraint — LW-1C decides what, if anything, gets persisted.
//
// Immersive Onboarding Polish™ (Sprint LW-1C.3) — cards upgraded to the
// premium treatment established by SourceTypeCard/PrimaryLearningMethodCard
// (larger radius, hover lift, soft glow) and the interaction brought in
// line with those same cards' "Hover → Lift → Glow → Selection → Continue"
// sequence: selecting a goal now holds a brief confirmation glow, then
// auto-navigates — no separate manual Continue button. The `?goal=` query
// param contract is unchanged.
const SELECTION_HOLD_MS = 280

export function LearningGoalSelector(): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<LearningGoalId | null>(null)
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-700' : ''

  function handleSelect(goalId: LearningGoalId): void {
    if (selectedId !== null) return
    setSelectedId(goalId)
    const target = `/welcome/choose-method?goal=${goalId}`
    if (prefersReducedMotion) {
      router.push(target)
      return
    }
    window.setTimeout(() => router.push(target), SELECTION_HOLD_MS)
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <ArrivalBackground />
      <div className={cn('mx-auto flex w-full max-w-2xl flex-col items-center gap-8 text-center', fadeClass)}>
        <OnboardingJourneyIndicator currentStepId="goal" className="w-full max-w-sm" />

        <div>
          <h1 className={TYPOGRAPHY.display}>What brings you here today?</h1>
          <p className={cn(TYPOGRAPHY.bodyLarge, 'mt-3 text-muted-foreground')}>Tell us your goal. We&rsquo;ll build the smartest learning experience around it.</p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2" role="group" aria-label="What brings you here today?">
          {LEARNING_GOALS.map((goal) => {
            const isSelected = selectedId === goal.id
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleSelect(goal.id)}
                aria-pressed={isSelected}
                disabled={selectedId !== null && !isSelected}
                className={cn(
                  'group relative flex min-h-[120px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[2rem] border bg-background/60 px-6 py-8 text-center backdrop-blur-sm transition-all duration-300 ease-out',
                  'shadow-sm hover:-translate-y-1 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected ? 'scale-[1.02] border-primary shadow-xl' : 'border-border hover:border-foreground/20',
                )}
              >
                <div
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-foreground/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-primary/[0.05] blur-2xl transition-opacity duration-300',
                    isSelected ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden="true"
                />

                <span className="text-4xl" aria-hidden="true">
                  {goal.emoji}
                </span>
                <span className={TYPOGRAPHY.h3}>{goal.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
