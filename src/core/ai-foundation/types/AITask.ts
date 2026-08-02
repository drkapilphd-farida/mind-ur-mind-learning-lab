// AI Foundation Layer™ — AIF-1. Labels only, per the brief: "Do NOT
// implement business logic. Only define supported tasks." A future
// engine (UCE-3B, UCE-5, a mentor/flashcard/MCQ feature, ...) decides
// what prompt a task means and builds AIFoundationPayload.messages
// itself; AIFoundation.execute() never branches on which task this is —
// it only uses the value to namespace the result cache (so the same
// content processed for two different tasks never collides) and to tag
// cost/observability records.
export const AI_TASKS = [
  'extract-concepts',
  'semantic-enrichment',
  'relationship-detection',
  'topic-detection',
  'keyword-extraction',
  'difficulty-analysis',
  'learning-objective-detection',
  'summarization',
  'question-answering',
  'mentor-conversation',
  'flashcard-generation',
  'mcq-generation',
  'research-assistance',
  // Reading Intelligence Engine™ Upgrade — Sprint-1: Learning Blueprint
  // Generator™. One combined per-chapter request (memory hooks, mentor
  // context, recall/application questions, per-concept explanations) —
  // see src/core/universal-learning-engine/learning-blueprint/.
  'chapter-blueprint-generation',
] as const

export type AITask = (typeof AI_TASKS)[number]
