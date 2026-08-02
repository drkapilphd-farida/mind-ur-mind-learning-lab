'use client'

import { useState } from 'react'
import { READING_GOALS } from '@/features/quantum-speed-reading/adaptive-intelligence/goalCatalog'
import type { ReadingGoalId } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceTypes'
import { GoalSelectionCard } from '@/features/quantum-speed-reading/components/adaptive-intelligence/GoalSelectionCard'

type GoalSelectionGridProps = {
  initialGoalId: ReadingGoalId | null
}

// Client wrapper so the "Selected" badge updates immediately after a
// successful server-side write, without a full page reload.
export function GoalSelectionGrid({ initialGoalId }: GoalSelectionGridProps): React.JSX.Element {
  const [selectedGoalId, setSelectedGoalId] = useState(initialGoalId)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {READING_GOALS.map((goal) => (
        <GoalSelectionCard
          key={goal.id}
          goal={goal}
          isSelected={selectedGoalId === goal.id}
          onSelected={setSelectedGoalId}
        />
      ))}
    </div>
  )
}
