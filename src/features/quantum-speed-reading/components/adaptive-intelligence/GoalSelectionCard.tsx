'use client'

import { useTransition } from 'react'
import { GraduationCap, Zap, Brain, Briefcase, BookOpen, Target, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { GoalDefinition, ReadingGoalId } from '../../adaptive-intelligence/readingIntelligenceTypes'
import { updateReadingGoal } from '../../adaptive-intelligence/actions/updateReadingGoal'

const GOAL_ICON: Record<ReadingGoalId, LucideIcon> = {
  'academic-excellence': GraduationCap,
  'faster-reading': Zap,
  'better-comprehension': Brain,
  'professional-reading': Briefcase,
  'book-reading-mastery': BookOpen,
  'competitive-exam-prep': Target,
}

type GoalSelectionCardProps = {
  goal: GoalDefinition
  isSelected: boolean
  onSelected: (goalId: ReadingGoalId) => void
}

// Same visual language as ReadingModeCard (Sprint 1) — icon tile, title,
// description, selected-state ring/badge — but selection persists
// server-side (users may change goals anytime, across devices) rather
// than being a URL-param choice for one navigation flow.
export function GoalSelectionCard({ goal, isSelected, onSelected }: GoalSelectionCardProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const Icon = GOAL_ICON[goal.id]

  function handleClick(): void {
    startTransition(async () => {
      const result = await updateReadingGoal({ goalId: goal.id })
      if (result.success) onSelected(goal.id)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="block w-full text-left focus-visible:outline-none disabled:opacity-70"
    >
      <Card
        className={cn(
          'h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring',
          isSelected ? 'ring-2 ring-primary' : 'ring-1 ring-foreground/10',
        )}
      >
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-foreground/70">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <h3 className="text-base font-semibold tracking-tight text-foreground">{goal.title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{goal.description}</p>
          {isSelected && (
            <Badge variant="secondary" className="w-fit">Selected</Badge>
          )}
        </CardContent>
      </Card>
    </button>
  )
}
