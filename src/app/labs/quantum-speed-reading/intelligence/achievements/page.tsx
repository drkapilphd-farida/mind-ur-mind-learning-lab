import type { Metadata } from 'next'
import { getReadingIntelligenceSessions } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { computePersonalBests } from '@/features/quantum-speed-reading/adaptive-intelligence/personalBestsEngine'
import { computeUnlockedAchievements } from '@/features/quantum-speed-reading/adaptive-intelligence/achievementEngine'
import { AchievementsGrid } from '@/features/quantum-speed-reading/components/adaptive-intelligence/AchievementsGrid'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'

export const metadata: Metadata = {
  title: 'Achievements — Quantum Speed Reading™',
}

export default async function AchievementsPage(): Promise<React.JSX.Element> {
  const sessions = await getReadingIntelligenceSessions()
  const profile = computeReadingProfile(sessions)
  const bests = computePersonalBests(sessions)
  const achievements = computeUnlockedAchievements(profile, bests)
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div>
      <LabNavHeader currentSection="Achievements" />
      <div className="mx-auto max-w-4xl px-6 py-16">
      <LabPageHeader
        eyebrow="Adaptive Intelligence Engine™"
        title="Achievements"
        subtitle={`${unlockedCount} of ${achievements.length} brain milestones reached.`}
      />

      <div className="mt-10">
        <AchievementsGrid achievements={achievements} />
      </div>
      </div>
    </div>
  )
}
