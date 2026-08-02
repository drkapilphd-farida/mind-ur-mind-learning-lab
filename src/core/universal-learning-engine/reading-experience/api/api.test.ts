import { describe, expect, it } from 'vitest'
import { makeBundle } from '../internal/testFixtures'
import { generateReadingSession } from '../generateReadingSession'
import { getReadingSession } from './getReadingSession'
import { getWordStage, getPhraseStage, getSentenceStage, getParagraphStage, getChapterStage } from './getStageByType'
import { getNextStage } from './getNextStage'
import { getSessionProgress } from './getSessionProgress'
import { getDifficultyLevel } from './getDifficultyLevel'

describe('getReadingSession', () => {
  it('is a thin alias over generateReadingSession, same real output', () => {
    const bundle = makeBundle()
    const viaApi = getReadingSession(bundle, { idFactory: () => 'id' })
    const direct = generateReadingSession(bundle, { idFactory: () => 'id' })
    expect(viaApi.stages).toEqual(direct.stages)
  })
})

describe('stage getters', () => {
  const session = generateReadingSession(makeBundle())

  it('return the one real stage of each requested type', () => {
    expect(getWordStage(session)?.type).toBe('word')
    expect(getPhraseStage(session)?.type).toBe('phrase')
    expect(getSentenceStage(session)?.type).toBe('sentence')
    expect(getParagraphStage(session)?.type).toBe('paragraph')
    expect(getChapterStage(session)?.type).toBe('chapter')
  })
})

describe('getNextStage', () => {
  it('returns the real stage at the caller own current index', () => {
    const session = generateReadingSession(makeBundle())
    const next = getNextStage(session, { currentStageIndex: 2, completedStageIds: [], status: 'in-progress' })
    expect(next?.type).toBe('sentence')
  })

  it('is honestly null once every real stage is passed', () => {
    const session = generateReadingSession(makeBundle())
    const next = getNextStage(session, { currentStageIndex: session.stages.length, completedStageIds: [], status: 'completed' })
    expect(next).toBeNull()
  })
})

describe('getSessionProgress', () => {
  it('computes a real, honest percentage from the caller own supplied progress', () => {
    const session = generateReadingSession(makeBundle())
    const firstThreeStageIds = session.stages.slice(0, 3).map((stage) => stage.stageId)
    const summary = getSessionProgress(session, { currentStageIndex: 3, completedStageIds: firstThreeStageIds, status: 'in-progress' })
    expect(summary.completedStages).toBe(3)
    expect(summary.totalStages).toBe(6)
    expect(summary.percentComplete).toBe(50)
    expect(summary.currentStage?.type).toBe('paragraph')
  })
})

describe('getDifficultyLevel', () => {
  it('returns the session own already-computed real level, never recomputed', () => {
    const session = generateReadingSession(makeBundle())
    expect(getDifficultyLevel(session)).toBe(session.difficultyLevel)
  })
})
