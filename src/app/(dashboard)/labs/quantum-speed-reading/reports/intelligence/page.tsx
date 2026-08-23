import type { Metadata } from 'next'
import { getReadingIntelligenceSessions, getSelectedReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { computeReadingDna } from '@/features/quantum-speed-reading/adaptive-intelligence/readingDnaEngine'
import { computePersonalBests } from '@/features/quantum-speed-reading/adaptive-intelligence/personalBestsEngine'
import { computeCategoryIntelligence } from '@/features/quantum-speed-reading/adaptive-intelligence/categoryIntelligenceEngine'
import { computeUnlockedAchievements } from '@/features/quantum-speed-reading/adaptive-intelligence/achievementEngine'
import { computeUnlockedAchievementsV2 } from '@/features/quantum-speed-reading/ai-reading-coach/achievementEngineV2'
import { computeGoalProgress } from '@/features/quantum-speed-reading/adaptive-intelligence/goalProgressEngine'
import { getReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/goalCatalog'
import { recommendNextSession } from '@/features/quantum-speed-reading/ai-reading-coach/nextSessionRecommendationEngine'
import { ReportHeader } from '@/features/quantum-speed-reading/components/reports/ReportHeader'
import { LAB_STAT_LABEL_CLASS } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'
import { ReadingProfileStats } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingProfileStats'
import { ReadingDnaCard } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingDnaCard'
import { PersonalBestsGrid } from '@/features/quantum-speed-reading/components/adaptive-intelligence/PersonalBestsGrid'
import { GoalProgressBar } from '@/features/quantum-speed-reading/components/adaptive-intelligence/GoalProgressBar'
import { AchievementsGrid } from '@/features/quantum-speed-reading/components/adaptive-intelligence/AchievementsGrid'
import { AchievementCardV2 } from '@/features/quantum-speed-reading/components/ai-reading-coach/AchievementCardV2'
import { NextSessionRecommendationCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/NextSessionRecommendationCard'
import { ReadingHistoryTable } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingHistoryTable'

export const metadata: Metadata = {
  title: 'Reading Intelligence Report™ — Reading Intelligence Lab™',
}

// Sprint-6, Part 4 — the combined Reading Intelligence Report™: every
// section from the Dashboard, laid out for print/PDF export in one place.
// Reuses every Sprint-4/5 engine unmodified — purely a new arrangement.
export default async function ReadingIntelligenceReportPage(): Promise<React.JSX.Element> {
  const [sessions, selectedGoalId] = await Promise.all([getReadingIntelligenceSessions(), getSelectedReadingGoal()])

  const profile = computeReadingProfile(sessions)
  const dnaTraits = computeReadingDna(sessions)
  const bests = computePersonalBests(sessions)
  const categoryIntelligence = computeCategoryIntelligence(sessions)
  const achievements = computeUnlockedAchievements(profile, bests)
  const achievementsV2 = computeUnlockedAchievementsV2(sessions, dnaTraits, profile.longestStreak)
  const goal = selectedGoalId ? getReadingGoal(selectedGoalId) : null

  const latest = sessions[0] ?? null
  const previous = sessions[1] ?? null
  const recommendation = recommendNextSession(profile, categoryIntelligence, latest, previous, selectedGoalId)

  const generatedAtLabel = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <ReportHeader eyebrow="Reading Intelligence Report™" title="Your Reading Brain, Mapped" generatedAtLabel={generatedAtLabel} />

        <div className="mt-8 space-y-6">
          <div data-report-section>
            <p className={`mb-3 ${LAB_STAT_LABEL_CLASS}`}>Reading Profile</p>
            <ReadingProfileStats profile={profile} />
          </div>

          {goal && (
            <div data-report-section className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className={LAB_STAT_LABEL_CLASS}>Goal Progress</p>
              <div className="mt-3">
                <GoalProgressBar label={goal.title} percent={computeGoalProgress(goal.id, profile, sessions)} />
              </div>
            </div>
          )}

          <div data-report-section>
            <ReadingDnaCard traits={dnaTraits} />
          </div>

          <div data-report-section>
            <p className={`mb-3 ${LAB_STAT_LABEL_CLASS}`}>Personal Bests</p>
            <PersonalBestsGrid bests={bests} />
          </div>

          <div data-report-section>
            <p className={`mb-3 ${LAB_STAT_LABEL_CLASS}`}>Achievements</p>
            <AchievementsGrid achievements={achievements} />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievementsV2.map((achievement) => (
                <AchievementCardV2 key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>

          {recommendation && (
            <div data-report-section>
              <NextSessionRecommendationCard recommendation={recommendation} />
            </div>
          )}

          <div data-report-section>
            <p className={`mb-3 ${LAB_STAT_LABEL_CLASS}`}>Complete Session History</p>
            <ReadingHistoryTable sessions={sessions} />
          </div>
        </div>
      </div>
    </div>
  )
}
