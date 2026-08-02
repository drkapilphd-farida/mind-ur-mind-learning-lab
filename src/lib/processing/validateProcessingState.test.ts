import { describe, expect, it } from 'vitest'
import type { DocumentProcessingProgress } from '@/features/learning-mode-runtime/persistence/documentProcessingProgress'
import { validateProcessingState } from './validateProcessingState'

function progress(overrides: Partial<DocumentProcessingProgress> = {}): DocumentProcessingProgress {
  return {
    documentId: 'doc-1',
    stage: 'enriching_chunks',
    totalChunks: 4,
    chunksEnriched: 0,
    knowledgeGraphDone: false,
    learningAnalysisDone: false,
    totalChapters: 4,
    blueprintsGenerated: 0,
    learningAssetsGenerated: 0,
    errorMessage: null,
    ...overrides,
  }
}

describe('validateProcessingState', () => {
  it('reports no issues for a healthy, in-progress row', () => {
    expect(validateProcessingState(progress({ chunksEnriched: 2 }))).toEqual([])
  })

  it('reports no issues for a genuinely complete row', () => {
    expect(
      validateProcessingState(
        progress({ stage: 'complete', chunksEnriched: 4, knowledgeGraphDone: true, learningAnalysisDone: true, blueprintsGenerated: 4, learningAssetsGenerated: 4 }),
      ),
    ).toEqual([])
  })

  it('never flags a failed row — already an honest terminal state', () => {
    expect(validateProcessingState(progress({ stage: 'failed', totalChunks: 0 }))).toEqual([])
  })

  it('flags zero total chunks', () => {
    const issues = validateProcessingState(progress({ totalChunks: 0 }))
    expect(issues.map((i) => i.code)).toContain('zero-total-chunks')
  })

  it('flags chunks_enriched exceeding total_chunks', () => {
    const issues = validateProcessingState(progress({ chunksEnriched: 5, totalChunks: 4 }))
    expect(issues.map((i) => i.code)).toContain('chunks-enriched-exceeds-total')
  })

  it('flags a stage past enrichment while enrichment is still incomplete', () => {
    const issues = validateProcessingState(progress({ stage: 'building_knowledge_graph', chunksEnriched: 2, totalChunks: 4 }))
    expect(issues.map((i) => i.code)).toContain('stage-ahead-of-enrichment')
  })

  it('flags a stage past the knowledge graph while knowledge_graph_done is false', () => {
    const issues = validateProcessingState(progress({ stage: 'building_learning_analysis', chunksEnriched: 4, knowledgeGraphDone: false }))
    expect(issues.map((i) => i.code)).toContain('stage-ahead-of-knowledge-graph')
  })

  it('flags a stage past learning analysis while learning_analysis_done is false', () => {
    const issues = validateProcessingState(progress({ stage: 'generating_blueprints', chunksEnriched: 4, knowledgeGraphDone: true, learningAnalysisDone: false }))
    expect(issues.map((i) => i.code)).toContain('stage-ahead-of-learning-analysis')
  })

  it('flags generating_learning_assets while Blueprints are incomplete', () => {
    const issues = validateProcessingState(
      progress({ stage: 'generating_learning_assets', chunksEnriched: 4, knowledgeGraphDone: true, learningAnalysisDone: true, blueprintsGenerated: 2, totalChapters: 4 }),
    )
    expect(issues.map((i) => i.code)).toContain('stage-ahead-of-blueprints')
  })

  it('flags "complete" while Learning Assets are incomplete — the real Objective 5 case', () => {
    const issues = validateProcessingState(
      progress({ stage: 'complete', chunksEnriched: 4, knowledgeGraphDone: true, learningAnalysisDone: true, blueprintsGenerated: 4, learningAssetsGenerated: 2, totalChapters: 4 }),
    )
    expect(issues.map((i) => i.code)).toContain('complete-without-full-learning-assets')
  })

  it('flags counters that overshoot their own real totals', () => {
    const issues = validateProcessingState(progress({ blueprintsGenerated: 5, totalChapters: 4 }))
    expect(issues.map((i) => i.code)).toContain('blueprints-generated-exceeds-total')
  })
})
