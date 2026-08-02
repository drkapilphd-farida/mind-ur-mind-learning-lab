import type { Metadata } from 'next'
import { getSelectedReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { GoalSelectionGrid } from './GoalSelectionGrid'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'

export const metadata: Metadata = {
  title: 'Choose Your Reading Goal — Quantum Speed Reading™',
}

// Goal-Based Training™ — users may change goals anytime. Selection
// persists server-side (profiles.selected_reading_goal) and influences
// AI Coach recommendations/goal-progress, never Sprint-1's locked
// Passage/Difficulty Selection screen.
export default async function GoalSelectionPage(): Promise<React.JSX.Element> {
  const selectedGoalId = await getSelectedReadingGoal()

  return (
    <div>
      <LabNavHeader currentSection="Goals" />
      <div className="mx-auto max-w-3xl px-6 py-16">
      <LabPageHeader
        eyebrow="Goal-Based Training™"
        title="Choose Your Reading Goal"
        subtitle="Your goal shapes your coaching, difficulty suggestions, and category rotation. Change it anytime."
      />

      <div className="mt-10">
        <GoalSelectionGrid initialGoalId={selectedGoalId} />
      </div>
      </div>
    </div>
  )
}
