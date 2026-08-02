'use client'

import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { READING_SPRINT_LABEL, READING_SPRINT_MISSION_COPY, READING_SPRINT_ORDER, type ReadingSprintId } from '@/features/reading-discovery/readingSprints'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'
import { SprintProgressDots } from './SprintProgressDots'

type SprintMissionIntroProps = {
  sprint: ReadingSprintId
  onReady: () => void
}

// Reading Discovery Engine™ (Sprint-2 Part-1), copy trimmed per
// Sprint-2.5 FIX-04 — "Mission N / Sprint Label / punchy tagline /
// Start." "Instructions remain visible forever... the user presses
// Start. Never auto-start." Reuses `ReadingExperimentLayout` verbatim
// (same shell every other screen in this module already uses) with the
// new `SprintProgressDots` in its new optional `headerSlot`.
export function SprintMissionIntro({ sprint, onReady }: SprintMissionIntroProps): React.JSX.Element {
  const currentIndex = READING_SPRINT_ORDER.indexOf(sprint)

  return (
    <ReadingExperimentLayout ctaLabel="Start" onCta={onReady} headerSlot={<SprintProgressDots total={READING_SPRINT_ORDER.length} currentIndex={currentIndex} />}>
      <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Mission {currentIndex + 1}</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{READING_SPRINT_LABEL[sprint]}</h1>
      <p className="mt-6 text-lg font-semibold text-foreground sm:text-xl">{READING_SPRINT_MISSION_COPY[sprint]}</p>
    </ReadingExperimentLayout>
  )
}
