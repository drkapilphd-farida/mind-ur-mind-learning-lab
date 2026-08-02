import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { loadDocumentProcessingProgress, type DocumentProcessingProgressStage } from '@/features/learning-mode-runtime/persistence/documentProcessingProgress'

export type ProcessingDashboardStatusLabel = 'Preparing Journey' | 'Generating Learning Assets' | 'Ready' | 'Needs Attention'

export type ProcessingDashboardStatus = {
  statusLabel: ProcessingDashboardStatusLabel
  progressPercent: number
  chaptersRemaining: number
  lastSuccessfulStage: DocumentProcessingProgressStage
}

const STAGE_TO_LABEL: Record<DocumentProcessingProgressStage, ProcessingDashboardStatusLabel> = {
  enriching_chunks: 'Preparing Journey',
  building_knowledge_graph: 'Preparing Journey',
  building_learning_analysis: 'Preparing Journey',
  generating_blueprints: 'Generating Learning Assets',
  generating_learning_assets: 'Generating Learning Assets',
  complete: 'Ready',
  failed: 'Needs Attention',
}

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Objective 7 — real,
// already-persisted counters reshaped into learner-facing status, never
// internal stage names ("enriching_chunks," "generating_blueprints")
// exposed directly. Backend data only this sprint — no new screen (this
// is explicitly a reliability sprint, not a UI redesign sprint); a
// future dashboard screen consumes this as-is.
//
// progressPercent weighs the five real pipeline stages equally (20%
// each: chunk enrichment, knowledge graph, learning analysis, Blueprint
// generation, Learning Asset generation) — a real, proportional read of
// how much of the document's own real work is done, not a guess.
export async function getProcessingDashboardStatus(supabase: SupabaseClient<Database>, documentId: string): Promise<ProcessingDashboardStatus | null> {
  const progress = await loadDocumentProcessingProgress(supabase, documentId)
  if (!progress) return null

  const enrichmentPercent = progress.totalChunks > 0 ? (progress.chunksEnriched / progress.totalChunks) * 20 : 0
  const knowledgeGraphPercent = progress.knowledgeGraphDone ? 20 : 0
  const learningAnalysisPercent = progress.learningAnalysisDone ? 20 : 0
  const blueprintsPercent = progress.totalChapters > 0 ? (progress.blueprintsGenerated / progress.totalChapters) * 20 : 0
  const learningAssetsPercent = progress.totalChapters > 0 ? (progress.learningAssetsGenerated / progress.totalChapters) * 20 : 0

  const progressPercent = Math.round(enrichmentPercent + knowledgeGraphPercent + learningAnalysisPercent + blueprintsPercent + learningAssetsPercent)
  const chaptersRemaining = Math.max(0, progress.totalChapters - progress.learningAssetsGenerated)

  return {
    statusLabel: STAGE_TO_LABEL[progress.stage],
    progressPercent,
    chaptersRemaining,
    lastSuccessfulStage: progress.stage,
  }
}
