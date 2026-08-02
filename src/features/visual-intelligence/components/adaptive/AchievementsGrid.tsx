import type { UnlockedAchievement } from '../../adaptive/types/adaptiveTypes'
import { AdaptiveAchievementCard } from './AdaptiveAchievementCard'

type AchievementsGridProps = {
  achievements: readonly UnlockedAchievement[]
}

export function AchievementsGrid({ achievements }: AchievementsGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {achievements.map((achievement) => (
        <AdaptiveAchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  )
}
