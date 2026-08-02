import type { DocumentProcessingProgress, DocumentProcessingProgressStage } from '@/features/learning-mode-runtime/persistence/documentProcessingProgress'

export type ProcessingStateIssueCode =
  | 'zero-total-chunks'
  | 'chunks-enriched-exceeds-total'
  | 'stage-ahead-of-enrichment'
  | 'stage-ahead-of-knowledge-graph'
  | 'stage-ahead-of-learning-analysis'
  | 'blueprints-generated-exceeds-total'
  | 'stage-ahead-of-blueprints'
  | 'learning-assets-generated-exceeds-total'
  | 'complete-without-full-learning-assets'

export type ProcessingStateIssue = {
  code: ProcessingStateIssueCode
  message: string
}

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Objective 4 — real,
// structural corruption detection over an already-loaded
// DocumentProcessingProgress row. A "missing row" or "duplicate row" is
// deliberately NOT this function's concern: a missing row is a normal,
// legitimate state (not yet initialized, or a legacy document —
// recoverLegacyDocumentProcessing.ts's own job), and "duplicate row" is
// structurally impossible given the table's real UNIQUE(document_id)
// constraint — there is nothing for application code to detect there.
// This function only catches states that should be impossible given the
// pipeline's own real, locked stage ordering — e.g. a stage claiming to
// be past Blueprint generation while fewer Blueprints exist than the
// document's own real chapter count.
const STAGE_ORDER: readonly DocumentProcessingProgressStage[] = [
  'enriching_chunks',
  'building_knowledge_graph',
  'building_learning_analysis',
  'generating_blueprints',
  'generating_learning_assets',
  'complete',
]

function stageIndex(stage: DocumentProcessingProgressStage): number {
  return STAGE_ORDER.indexOf(stage)
}

function isAtOrPast(stage: DocumentProcessingProgressStage, target: DocumentProcessingProgressStage): boolean {
  const index = stageIndex(stage)
  return index >= 0 && index >= stageIndex(target)
}

export function validateProcessingState(progress: DocumentProcessingProgress): readonly ProcessingStateIssue[] {
  const issues: ProcessingStateIssue[] = []

  if (progress.stage === 'failed') return issues // already a terminal, honestly-recorded failure — nothing further to validate

  if (progress.totalChunks === 0) {
    issues.push({ code: 'zero-total-chunks', message: 'total_chunks is 0 — enrichment can never report itself complete.' })
  }
  if (progress.chunksEnriched > progress.totalChunks) {
    issues.push({ code: 'chunks-enriched-exceeds-total', message: `chunks_enriched (${progress.chunksEnriched}) exceeds total_chunks (${progress.totalChunks}).` })
  }
  if (isAtOrPast(progress.stage, 'building_knowledge_graph') && progress.chunksEnriched < progress.totalChunks) {
    issues.push({ code: 'stage-ahead-of-enrichment', message: `stage is "${progress.stage}" but only ${progress.chunksEnriched}/${progress.totalChunks} chunks are enriched.` })
  }
  if (isAtOrPast(progress.stage, 'building_learning_analysis') && !progress.knowledgeGraphDone) {
    issues.push({ code: 'stage-ahead-of-knowledge-graph', message: `stage is "${progress.stage}" but knowledge_graph_done is false.` })
  }
  if (isAtOrPast(progress.stage, 'generating_blueprints') && !progress.learningAnalysisDone) {
    issues.push({ code: 'stage-ahead-of-learning-analysis', message: `stage is "${progress.stage}" but learning_analysis_done is false.` })
  }
  if (progress.blueprintsGenerated > progress.totalChapters) {
    issues.push({ code: 'blueprints-generated-exceeds-total', message: `blueprints_generated (${progress.blueprintsGenerated}) exceeds total_chapters (${progress.totalChapters}).` })
  }
  if (isAtOrPast(progress.stage, 'generating_learning_assets') && progress.blueprintsGenerated < progress.totalChapters) {
    issues.push({ code: 'stage-ahead-of-blueprints', message: `stage is "${progress.stage}" but only ${progress.blueprintsGenerated}/${progress.totalChapters} Blueprints exist.` })
  }
  if (progress.learningAssetsGenerated > progress.totalChapters) {
    issues.push({ code: 'learning-assets-generated-exceeds-total', message: `learning_assets_generated (${progress.learningAssetsGenerated}) exceeds total_chapters (${progress.totalChapters}).` })
  }
  if (progress.stage === 'complete' && progress.learningAssetsGenerated < progress.totalChapters) {
    issues.push({ code: 'complete-without-full-learning-assets', message: `stage is "complete" but only ${progress.learningAssetsGenerated}/${progress.totalChapters} Learning Asset Bundles exist.` })
  }

  return issues
}
