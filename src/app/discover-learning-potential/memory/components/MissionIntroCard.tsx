'use client'

import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { MEMORY_MISSION_INTRO_COPY, MEMORY_MISSION_LABEL, MEMORY_MISSION_ORDER, type MemoryMissionId } from '@/features/memory-discovery/memoryMissions'
import { MemoryExperimentLayout } from './MemoryExperimentLayout'
import { MissionProgressDots } from './MissionProgressDots'

type MissionIntroCardProps = {
  mission: MemoryMissionId
  onReady: () => void
}

// Memory Discovery Foundation™ (Sprint-1) FIX-02/FIX-03 — "Before every
// mission, display a very short AI introduction... Maximum: one heading,
// one sentence, one button." Mirrors Reading Discovery's own
// `SprintMissionIntro` shape exactly (same shell, same "Mission N of 5"
// framing, same never-auto-start discipline).
export function MissionIntroCard({ mission, onReady }: MissionIntroCardProps): React.JSX.Element {
  const currentIndex = MEMORY_MISSION_ORDER.indexOf(mission)

  return (
    <MemoryExperimentLayout ctaLabel="Start" onCta={onReady} headerSlot={<MissionProgressDots total={MEMORY_MISSION_ORDER.length} currentIndex={currentIndex} />}>
      <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>
        Mission {currentIndex + 1} of {MEMORY_MISSION_ORDER.length}
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{MEMORY_MISSION_LABEL[mission]}</h1>
      <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{MEMORY_MISSION_INTRO_COPY[mission]}</p>
    </MemoryExperimentLayout>
  )
}
