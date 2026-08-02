'use client'

import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { FOCUS_MISSION_INTRO_COPY, FOCUS_MISSION_LABEL, FOCUS_MISSION_ORDER, type FocusMissionId } from '@/features/focus-discovery/focusMissions'
import { FocusExperimentLayout } from './FocusExperimentLayout'
import { MissionProgressDots } from './MissionProgressDots'

type MissionIntroCardProps = {
  mission: FocusMissionId
  onReady: () => void
}

// FIX-07 — "Every mission begins with a short AI introduction... Maximum
// one heading, one sentence, one CTA." Mirrors Memory Discovery's own
// `MissionIntroCard` shape exactly.
export function MissionIntroCard({ mission, onReady }: MissionIntroCardProps): React.JSX.Element {
  const currentIndex = FOCUS_MISSION_ORDER.indexOf(mission)

  return (
    <FocusExperimentLayout ctaLabel="Start" onCta={onReady} headerSlot={<MissionProgressDots total={FOCUS_MISSION_ORDER.length} currentIndex={currentIndex} />}>
      <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>
        Mission {currentIndex + 1} of {FOCUS_MISSION_ORDER.length}
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{FOCUS_MISSION_LABEL[mission]}</h1>
      <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{FOCUS_MISSION_INTRO_COPY[mission]}</p>
    </FocusExperimentLayout>
  )
}
