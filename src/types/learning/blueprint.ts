// Learning Blueprint™ types (Sprint 1, Chunk 4). Production AI
// Integration — the blueprint is now built entirely from the real,
// Claude-enriched Universal Learning Object™
// (src/lib/blueprint/generateRealLearningBlueprint.ts), never a mock or
// template generator. This same return shape was deliberately kept
// stable across that swap — nothing that reads a LearningBlueprint
// needed to change.

export type BlueprintDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type BlueprintConcept = {
  id: string
  title: string
  description: string
}

export type BlueprintChapter = {
  id: string
  title: string
}

// Sprint 2, Chunk 2 — the seven-step Learning Journey™, one step per
// study mode (Chunk 3 builds the matching Study Mode cards). `id` is a
// closed union, not a free string — JourneyTimeline resolves it to an
// icon via a local registry (never a LucideIcon reference on this type
// itself: that would cross the Server→Client prop boundary as a
// function reference, the exact class of bug fixed in Sprint 0's
// ShellNavItem/iconRegistry). Deliberately excludes `status` — whether
// a step is locked/available/complete depends on real per-step
// progress that doesn't exist yet, so it's derived separately by
// deriveJourneyStepStatuses() rather than baked into this mock content.
export type BlueprintJourneyStepId = 'overview' | 'key-concepts' | 'flashcards' | 'mind-maps' | 'practice' | 'quiz' | 'revision'

export type BlueprintJourneyStep = {
  id: BlueprintJourneyStepId
  title: string
  description: string
  estimatedMinutes: number
}

// Sprint 2, Chunk 2 — Knowledge Map Preview node. "Not a real graph" —
// one representative Topic → Subtopic → Definition → Example →
// Application chain, not a full concept graph. `level` picks the
// card's visual treatment in KnowledgeMapPreview.
export type KnowledgeMapNodeLevel = 'topic' | 'subtopic' | 'definition' | 'example' | 'application'

export type KnowledgeMapNode = {
  id: string
  level: KnowledgeMapNodeLevel
  label: string
}

// Sprint 2, Chunk 1 — the Blueprint Overview Cards' seven real (mock)
// counts. Deliberately excludes Memory Score / Understanding Score:
// those have nothing to derive from until real learning sessions exist
// (Sprint 2+ Workspace), so they render as honest "not available yet"
// placeholders in the component rather than invented numbers here.
export type BlueprintOverview = {
  conceptCount: number
  topicCount: number
  studySessionCount: number
  quizCount: number
  flashcardCount: number
  mindMapCount: number
  practiceQuestionCount: number
}

// Sprint 2, Chunk 3 — AI Insights Panel. "Mock insights only... No AI
// calls." strongAreas/weakAreas reuse this document's own already-
// generated concepts (real mock content, split from the same array —
// never a second, separately-invented claim about the material).
// memoryPrediction/confidenceLevel are qualitative bands, deliberately
// never a fabricated precise percentage — this platform's own "never
// fake a number" rule (see BlueprintOverview's Memory/Understanding
// Score) applies here too, just expressed as a label instead of a
// missing stat, since a qualitative insight is a defensible mock
// preview in a way a fake 87% confidence score would not be.
export type BlueprintInsightLevel = 'building' | 'moderate' | 'strong'

export type BlueprintInsights = {
  strongAreas: readonly string[]
  weakAreas: readonly string[]
  suggestedStudyOrder: string
  estimatedCompletionSummary: string
  memoryPrediction: BlueprintInsightLevel
  confidenceLevel: BlueprintInsightLevel
  recommendation: string
}

// Sprint LW-1E — AI Learning Blueprint™'s Recommendation Engine inputs.
// Distinct from BlueprintInsightLevel: memoryDensity describes the
// *material itself* (how much this document asks you to remember), not a
// prediction about the learner — a different concept, so it gets its own
// type rather than reusing insights' qualitative bands.
export type BlueprintDensityLevel = 'low' | 'medium' | 'high'

export type LearningBlueprint = {
  documentId: string
  summary: string
  difficulty: BlueprintDifficulty
  estimatedMinutes: number
  concepts: readonly BlueprintConcept[]
  chapters: readonly BlueprintChapter[]
  topics: readonly string[]
  journey: readonly BlueprintJourneyStep[]
  overview: BlueprintOverview
  knowledgeMap: readonly KnowledgeMapNode[]
  insights: BlueprintInsights
  // Sprint LW-1E — AI Observations™/Recommendation Engine inputs. Same
  // deterministic-mock honesty level as every other field above (seeded
  // from the document id, never a live analysis).
  memoryDensity: BlueprintDensityLevel
  diagramCount: number
}
