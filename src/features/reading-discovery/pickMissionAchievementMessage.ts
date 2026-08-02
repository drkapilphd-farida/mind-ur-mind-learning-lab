import type { ReadingSprintId } from './readingSprints'

// Sprint-2.7 FIX-29 — "Dynamic Mission Rewards... each mission should
// celebrate a different cognitive achievement... avoid repeating
// identical messages." A real, fixed mapping — each Sprint's own real
// cognitive skill gets its own real, distinct celebration, never the
// same generic line every mission.
const MISSION_ACHIEVEMENT_MESSAGE: Record<ReadingSprintId, string> = {
  word: '🎯 Great Recognition!',
  phrase: '⚡ Nice Chunk Reading!',
  sentence: '🚀 Excellent Reading Flow!',
  paragraph: '💪 Strong Reading Endurance!',
  meaning: '🧠 Great Comprehension!',
}

export function pickMissionAchievementMessage(sprint: ReadingSprintId): string {
  return MISSION_ACHIEVEMENT_MESSAGE[sprint]
}
