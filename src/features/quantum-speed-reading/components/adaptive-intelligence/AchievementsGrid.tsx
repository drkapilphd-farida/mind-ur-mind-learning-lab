import type { UnlockedAchievement } from '../../adaptive-intelligence/readingIntelligenceTypes'
import { AchievementCard } from './AchievementCard'

type AchievementsGridProps = {
  achievements: readonly UnlockedAchievement[]
}

export function AchievementsGrid({ achievements }: AchievementsGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  )
}
