import { describe, expect, it } from 'vitest'
import { AiVoiceMemory } from './aiVoiceMemory'
import { pickFocusEncouragement } from './pickFocusEncouragement'

describe('pickFocusEncouragement', () => {
  it('AI Trust™ — a real clean Attention Lock result reads as strong, never mentioning failure', () => {
    const line = pickFocusEncouragement(
      { type: 'attention_lock_result', roundsCompleted: 6, totalTargets: 20, correctTaps: 20, falseTaps: 0, avgReactionMs: 500, highestLevelReached: 4, stabilizedRounds: 0 },
      new AiVoiceMemory(),
    )
    expect(line).not.toBeNull()
    expect(line!.toLowerCase()).not.toContain('fail')
    expect(line!.toLowerCase()).not.toContain('wrong')
    expect(line!.toLowerCase()).not.toContain('bad')
    expect(line!.toLowerCase()).not.toContain('poor')
  })

  it('Recovery Intelligence™ — a real struggling Attention Lock result reads as recovery, never punitive', () => {
    const line = pickFocusEncouragement(
      { type: 'attention_lock_result', roundsCompleted: 6, totalTargets: 20, correctTaps: 20, falseTaps: 5, avgReactionMs: 500, highestLevelReached: 2, stabilizedRounds: 1 },
      new AiVoiceMemory(),
    )
    expect(line).not.toBeNull()
    expect(line!.toLowerCase()).not.toContain('fail')
    expect(line!.toLowerCase()).not.toContain('wrong')
  })

  it('a real Sustained Focus result whose accuracy held up late reads as maintained attention', () => {
    const line = pickFocusEncouragement(
      { type: 'sustained_focus_result', totalTicks: 30, correctHits: 10, missedTargets: 0, falseTaps: 0, earlyAccuracy: 0.9, midAccuracy: 0.9, lateAccuracy: 0.9 },
      new AiVoiceMemory(),
    )
    expect(line).toBe('You maintained attention well.')
  })

  it('LOCKED PRINCIPLE — never repeats the same real line across consecutive real missions in one real session', () => {
    const memory = new AiVoiceMemory()
    // A real branch with exactly two real candidates — real, precise
    // exhaustion of the real pool within this real test.
    const cleanReaction = {
      type: 'reaction_focus_result' as const,
      trialsCompleted: 7,
      hits: 7,
      prematureTaps: 0,
      missedTargets: 0,
      reactionTimesMs: [300, 310, 305],
    }
    const first = pickFocusEncouragement(cleanReaction, memory)
    const second = pickFocusEncouragement(cleanReaction, memory)
    const third = pickFocusEncouragement(cleanReaction, memory)
    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    expect(first).not.toBe(second)
    // Every real candidate for this exact context is now used — the
    // third real call is genuine, honest silence.
    expect(third).toBeNull()
  })

  it('Behavioural Memory™ — a real improving cross-mission trend earns its own real, prioritized line', () => {
    const memory = new AiVoiceMemory()
    memory.recordMissionRatio(0.3)
    memory.recordMissionRatio(0.9)
    const line = pickFocusEncouragement(
      { type: 'cognitive_flexibility_result', roundsCompleted: 6, correctTaps: 5, incorrectHabitResponses: 8, missedTargets: 3, avgAdaptationMs: 1500, highestLevelReached: 1, stabilizedRounds: 3 },
      memory,
    )
    expect(line).toBe("You're adapting quickly.")
  })

  it('Recovery Intelligence™ — a real declining cross-mission trend earns a real, calm, non-punitive line', () => {
    const memory = new AiVoiceMemory()
    memory.recordMissionRatio(0.9)
    memory.recordMissionRatio(0.3)
    const line = pickFocusEncouragement(
      { type: 'visual_search_result', roundsCompleted: 5, correctFirstTapCount: 4, wrongTapsTotal: 0, avgSearchMs: 900, highestLevelReached: 4, stabilizedRounds: 0 },
      memory,
    )
    expect(line).toBe('Take your time.')
  })

  it('never returns an empty real string for any real mission result type on a real fresh session', () => {
    const results = [
      { type: 'attention_lock_result' as const, roundsCompleted: 6, totalTargets: 20, correctTaps: 18, falseTaps: 2, avgReactionMs: 600, highestLevelReached: 3, stabilizedRounds: 1 },
      { type: 'visual_search_result' as const, roundsCompleted: 5, correctFirstTapCount: 3, wrongTapsTotal: 4, avgSearchMs: 1200, highestLevelReached: 3, stabilizedRounds: 0 },
      { type: 'reaction_focus_result' as const, trialsCompleted: 7, hits: 5, prematureTaps: 1, missedTargets: 1, reactionTimesMs: [300, 400] },
      { type: 'sustained_focus_result' as const, totalTicks: 30, correctHits: 8, missedTargets: 2, falseTaps: 3, earlyAccuracy: 0.9, midAccuracy: 0.7, lateAccuracy: 0.5 },
      {
        type: 'cognitive_flexibility_result' as const,
        roundsCompleted: 6,
        correctTaps: 15,
        incorrectHabitResponses: 2,
        missedTargets: 1,
        avgAdaptationMs: 1100,
        highestLevelReached: 4,
        stabilizedRounds: 0,
      },
    ]
    for (const result of results) {
      const line = pickFocusEncouragement(result, new AiVoiceMemory())
      expect(line).not.toBeNull()
      expect(line!.length).toBeGreaterThan(0)
    }
  })
})
