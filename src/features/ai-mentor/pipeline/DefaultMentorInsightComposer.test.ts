import { describe, expect, it, vi } from 'vitest'
import { createMentorInsightComposer } from './DefaultMentorInsightComposer'
import { makeMentorActivitySnapshot } from '../testFixtures'

describe('createMentorInsightComposer — real analyzers (integration)', () => {
  it('aggregates output from all six analyzers into one list', async () => {
    const composer = createMentorInsightComposer()
    const insights = await composer.compose(makeMentorActivitySnapshot({ sessionCount: 5, studyModesUsed: ['quiz'] }))

    const types = insights.map((insight) => insight.type)
    expect(types).toContain('progress')
    expect(types).toContain('pattern')
    expect(types).toContain('strength')
    expect(types).toContain('motivation')
    expect(types).toContain('goal')
  })

  it('never includes a weakness insight once active recall has been used', async () => {
    const composer = createMentorInsightComposer()
    const insights = await composer.compose(makeMentorActivitySnapshot({ sessionCount: 2, studyModesUsed: ['quiz'] }))
    expect(insights.some((insight) => insight.type === 'weakness')).toBe(false)
  })
})

describe('createMentorInsightComposer — dependency injection (unit)', () => {
  it('calls every injected analyzer exactly once with the same snapshot', async () => {
    const snapshot = makeMentorActivitySnapshot()
    const progressAnalyzer = { analyze: vi.fn().mockResolvedValue({ id: 'p', type: 'progress', summary: 's', detail: 'd' }) }
    const patternAnalyzer = { analyze: vi.fn().mockResolvedValue({ id: 'pa', type: 'pattern', summary: 's', detail: 'd' }) }
    const weaknessDetector = { detect: vi.fn().mockResolvedValue([]) }
    const strengthDetector = { detect: vi.fn().mockResolvedValue([]) }
    const motivationEngine = { assess: vi.fn().mockResolvedValue({ id: 'm', type: 'motivation', summary: 's', detail: 'd' }) }
    const goalTrackingEngine = { track: vi.fn().mockResolvedValue({ id: 'g', type: 'goal', summary: 's', detail: 'd' }) }

    const composer = createMentorInsightComposer({ progressAnalyzer, patternAnalyzer, weaknessDetector, strengthDetector, motivationEngine, goalTrackingEngine })
    await composer.compose(snapshot)

    expect(progressAnalyzer.analyze).toHaveBeenCalledExactlyOnceWith(snapshot)
    expect(patternAnalyzer.analyze).toHaveBeenCalledExactlyOnceWith(snapshot)
    expect(weaknessDetector.detect).toHaveBeenCalledExactlyOnceWith(snapshot)
    expect(strengthDetector.detect).toHaveBeenCalledExactlyOnceWith(snapshot)
    expect(motivationEngine.assess).toHaveBeenCalledExactlyOnceWith(snapshot)
    expect(goalTrackingEngine.track).toHaveBeenCalledExactlyOnceWith(snapshot)
  })

  it('flattens collection-returning detectors into the final list', async () => {
    const composer = createMentorInsightComposer({
      strengthDetector: {
        detect: vi.fn().mockResolvedValue([
          { id: 's1', type: 'strength', summary: 'a', detail: 'a' },
          { id: 's2', type: 'strength', summary: 'b', detail: 'b' },
        ]),
      },
    })
    const insights = await composer.compose(makeMentorActivitySnapshot())
    expect(insights.filter((insight) => insight.type === 'strength')).toHaveLength(2)
  })
})
