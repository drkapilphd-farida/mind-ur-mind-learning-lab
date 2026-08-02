import type { ProcessingStageId } from '@/types/learning/processing'

export type ProcessingStageDefinition = {
  id: ProcessingStageId
  label: string
  description: string
}

// ALS-15 Instant Learning Engine™ — Phase 1 "Quick Intelligence" only.
// All four genuinely complete within one real, fast, zero-AI call
// (`runPhase1QuickIntelligence`) — never GPT/Claude/LLM/token/model/API
// language, matching this experience's established "learning language
// only" discipline. No "Preparing AI Mentor"/"Building Memory Activities"
// entries here or anywhere in this pipeline: both are already fully
// usable the instant Phase 1 finishes (Memory Mode has zero AI
// dependency; AI Mentor is a live per-message call with no indexing
// step) — showing a fake pending state for either would misrepresent
// real, already-available work.
export const QUICK_INTELLIGENCE_STAGES: readonly ProcessingStageDefinition[] = [
  {
    id: 'upload-complete',
    label: 'Upload Complete',
    description: 'Your document is safely stored and ready.',
  },
  {
    id: 'reading-structure',
    label: 'Reading Structure Identified',
    description: "We're reviewing what you brought and estimating its scope.",
  },
  {
    id: 'chapters-organized',
    label: 'Chapters Organized',
    description: "We're mapping how this material is organized.",
  },
  {
    id: 'blueprint-ready',
    label: 'Learning Blueprint Ready',
    description: 'A first pass is ready now — richer detail arrives shortly after.',
  },
] as const

export type BackgroundIntelligenceStageId = 'understanding-document' | 'mapping-relationships' | 'analyzing-difficulty'

export type BackgroundIntelligenceStageDefinition = {
  id: BackgroundIntelligenceStageId
  label: string
  description: string
}

// Phase 3 "Background AI Intelligence" — each milestone named after the
// real gate it unlocks, shown only on the workspace/detail page's small
// background status strip (never on the Phase 1 processing screen,
// which has already navigated away by the time any of this starts).
export const BACKGROUND_INTELLIGENCE_STAGES: readonly BackgroundIntelligenceStageDefinition[] = [
  {
    id: 'understanding-document',
    label: 'Understanding Your Document',
    description: 'Unlocks a richer Learning Blueprint, Flashcards, and MCQs.',
  },
  {
    id: 'mapping-relationships',
    label: 'Mapping Concept Relationships',
    description: 'Unlocks Mind Map.',
  },
  {
    id: 'analyzing-difficulty',
    label: 'Analyzing Difficulty & Learning Path',
    description: 'Polishes your Learning Blueprint.',
  },
] as const
