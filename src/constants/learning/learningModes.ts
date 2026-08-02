export type LearningModeId = 'quantum-speed-reading' | 'memory-mode' | 'smart-notes' | 'focus-mode' | 'mind-map' | 'flashcards' | 'mcqs' | 'revision-mode' | 'research-mode' | 'exam-prep' | 'ai-mentor'

export type LearningModeDefinition = {
  id: LearningModeId
  emoji: string
  title: string
  description: string
}

// The eleven AI Learning Modes™ — never "features," "tools," or
// "utilities" in any user-facing copy, per the brief's explicit
// vocabulary rule. "Exam Preparation™" (still without a real runtime) is
// listed here, visible and honestly unavailable, rather than omitted —
// see resolveLearningModeHref below for what "unavailable" means today.
// Research Mode™ gained a real runtime in Production AI Integration
// (ALS-24) — see UNAVAILABLE_MODE_IDS below.
export const LEARNING_MODES: readonly LearningModeDefinition[] = [
  { id: 'quantum-speed-reading', emoji: '📖', title: 'Quantum Speed Reading™', description: 'Read using the AI Reading Engine.' },
  { id: 'memory-mode', emoji: '🧠', title: 'Memory Mode™', description: 'Improve long-term retention using AI-guided memory strategies.' },
  { id: 'smart-notes', emoji: '📝', title: 'Smart Notes™', description: 'Structured AI-generated notes.' },
  // AI Learning Studio™ Sprint ALS-16 — a real, stepped session like the
  // three above, not a generate-once-and-cache view like Mind Map™/
  // Flashcards™ below. Three real variants (Deep Focus Timer, Reading
  // Sprint, Pomodoro Mode), chosen at start — see
  // src/features/focus-mode-runtime/types/FocusVariant.ts.
  { id: 'focus-mode', emoji: '⏱️', title: 'Focus Mode™', description: 'A calm, timed space to read without distraction.' },
  // AI Learning Studio™ Sprint ALS-13 — descriptions kept honest about
  // what's actually real today: a structural outline / structural review
  // cards, not a concept-relationship map or active-recall Q&A, since
  // neither exists in the real pipeline without semantic enrichment (AI,
  // out of scope this sprint). See generateMindMapOutline.ts/
  // generateFlashCards.ts for exactly why.
  { id: 'mind-map', emoji: '🗺', title: 'Mind Map™', description: "A structured outline of your document's sections." },
  { id: 'flashcards', emoji: '🃏', title: 'Flashcards™', description: 'Review cards built from every real section.' },
  // AI Learning Studio™ Sprint ALS-17 — descriptions kept honest, the
  // same discipline ALS-13 established for Mind Map™/Flashcards™: MCQs™
  // are real structural questions about the document's own organization
  // (never fabricated comprehension questions), and Revision Mode™ is a
  // real guided review pass with a real, honest cross-session history
  // summary — never "AI-powered," since no AI generates either. See
  // src/features/mcqs-mode-runtime/presentation/buildStructureQuestion.ts
  // and src/features/revision-mode-runtime/queries/getDocumentRevisionContext.ts.
  { id: 'mcqs', emoji: '❓', title: 'MCQs™', description: "Real questions about how this document is organized." },
  { id: 'revision-mode', emoji: '🔄', title: 'Revision Mode™', description: 'A guided review pass through this document.' },
  // Production AI Integration — ALS-24. Real, AI-extracted concepts,
  // definitions, and semantic summaries now genuinely back this
  // description — see src/features/research-mode-runtime/components/ResearchCard.tsx.
  { id: 'research-mode', emoji: '🔬', title: 'Research Mode™', description: 'Deep concept exploration, powered by real AI-extracted concepts.' },
  { id: 'exam-prep', emoji: '🎯', title: 'Exam Preparation™', description: 'Structured practice for an upcoming exam.' },
  { id: 'ai-mentor', emoji: '🤖', title: 'AI Mentor™', description: 'Ask questions and receive personalized guidance.' },
] as const

// AI Learning Studio™ Sprint ALS-5 → Sprint ALS-8 → Sprint ALS-13 →
// Sprint ALS-16. Every Learning Mode now resolves to a real destination —
// no more Sprint-0 mock catalog hrefs, no more `null`. AI Mentor™ routes
// directly to its own real, non-project-scoped route — it doesn't use the
// ULO/session model at all (see docs/PRODUCTION_HANDOFF_AI_MENTOR_FINAL.md).
// Every other mode routes to the universal Learning Workspace™
// (`/workspace?mode=...`), which honestly shows either a real, connected
// session (Quantum Speed Reading™, Memory Mode™, Smart Notes™, Focus
// Mode™), a real generate-once-and-cache view (Mind Map™, Flashcards™ —
// see resolveLearningWorkspaceState), or "Coming in a future production
// sprint" for every mode with no real runtime yet — one single,
// consistent entry point for all eleven modes, never a second fallback
// screen or a stale demo link.
// Sprint QSR-3.5 — Unified Entry Experience & Workspace Integration™.
// Quantum Speed Reading™ is a real, second special case alongside AI
// Mentor™ — it has its own real, dedicated experience (the Quantum
// Reading Journey™, /quantum-journey) rather than the generic
// /workspace?mode=X shell every other mode uses. Before this, this mode
// silently routed through the generic shell to /read — the pre-signup
// WPM assessment tool, a genuinely different, unrelated flow — a real
// bug, not a design choice.
export function resolveLearningModeHref(mode: LearningModeDefinition, projectId: string): string {
  if (mode.id === 'ai-mentor') return '/preview/ai-mentor'
  if (mode.id === 'quantum-speed-reading') return `/preview/learning-projects/${projectId}/quantum-journey`
  return `/preview/learning-projects/${projectId}/workspace?mode=${mode.id}`
}

// AI Learning Studio™ Sprint ALS-21. The real modes with no runtime yet —
// kept in exactly one place, reused by both `LearningModeCard`'s own
// "Coming Soon" badge and `recommendLearningMode.ts`'s own real
// recommendation logic (which must never pick a mode from this set as its
// top recommendation — a real, found bug that sprint fixed). Adding a
// mode here is the one place a future sprint needs to touch once that
// mode gets a real runtime — removing it, not adding new logic elsewhere.
//
// Production AI Integration — ALS-24. `research-mode` removed —
// Research Mode™ gained a real runtime this sprint
// (`src/features/research-mode-runtime/`), reusing the Shared Learning
// Runtime exactly like every other stepped-session mode. It is not yet
// folded into `recommendLearningMode.ts`'s own recommendation logic —
// that engine's own IF/THEN branches are unchanged, a deliberate,
// separate decision from making the mode itself real and reachable.
const UNAVAILABLE_MODE_IDS: ReadonlySet<LearningModeId> = new Set(['exam-prep'])

export function isLearningModeAvailable(modeId: LearningModeId): boolean {
  return !UNAVAILABLE_MODE_IDS.has(modeId)
}
