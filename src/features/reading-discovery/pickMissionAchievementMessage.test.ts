import { describe, expect, it } from 'vitest'
import { pickMissionAchievementMessage } from './pickMissionAchievementMessage'
import { READING_SPRINT_ORDER } from './readingSprints'

describe('pickMissionAchievementMessage', () => {
  it('FIX-29 — every real Sprint gets its own distinct real achievement message', () => {
    const messages = READING_SPRINT_ORDER.map((sprint) => pickMissionAchievementMessage(sprint))
    expect(new Set(messages).size).toBe(messages.length)
  })

  it('FIX-29 — Reading Understanding celebrates comprehension, not speed', () => {
    expect(pickMissionAchievementMessage('meaning')).toContain('Comprehension')
  })
})
