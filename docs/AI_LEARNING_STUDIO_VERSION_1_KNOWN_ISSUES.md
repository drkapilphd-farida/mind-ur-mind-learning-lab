# AI Learning Studio™ — Version-1 Known Issues

**Release Candidate:** RC-1
**Status:** Every item below was found, disclosed, and consciously left unfixed by the sprint that found
it — either because fixing it would mean new architecture, new AI, or Version-2 functionality this arc is
explicitly scoped not to build, or because it's a deployment step outside a code sprint's own authority.
None of these are regressions or surprises; all are carried forward from their own sprint's own handoff
doc, re-confirmed still accurate as of RC-1.

## Deployment prerequisites (not code bugs)

1. **No live, authenticated browser walkthrough has been run in this development environment** — it has
   no seeded test user or processed document. Every sprint's own verification (including this one) has
   instead relied on: full source-level code audits, a complete route-guard sweep (public routes 200,
   every protected route 307 with a correct `next` redirect target), and exhaustive `tsc`/`eslint`/`vitest`
   coverage. **A real, credentialed, click-through QA pass is a required step before launch** — see Launch
   Checklist.

## Disclosed scope boundaries (deliberate, not bugs)

2. **The Learning Blueprint™ screen shows deterministic template content, not real ULO content**, for
   fields that would require real content understanding (chapter list, concepts, AI summary, complexity
   rating) — disclosed since ALS-4, unchanged through RC-1. Content type and reading time *are* real
   (`analyzeDocumentContent`, ALS-3). A visible "Illustrative preview" notice is shown on the page itself.
3. **Mind Map™ is a real document outline, not a concept-relationship graph**; **Flashcards™ are real
   structural review cards, not question/answer pairs**; **MCQs™ are real questions about document
   organization, not comprehension questions**; **Memory Mode™'s Story/Visualization/Association methods
   are real instructional prompts over real content, not AI-generated narratives.** All four are the same
   root cause: no semantic-enrichment AI stage (UCE-3B) is wired into the real document pipeline — `buildLearningKnowledgeGraph`/`buildLearningAnalysis`
   run without `aiFoundation`, by deliberate ALS-10 design, so `LearningChunk.enrichment` is always `{}`
   and the real knowledge graph has zero edges. Every one of these four features was built to be
   forward-compatible: wiring UCE-3B later would let each become the richer version its name implies,
   without changing any of these functions' own return shape for their existing callers.
4. **Quantum Speed Reading™ has no RSVP/word-flash presentation and no learner-facing reading-speed
   control**, despite the "Quantum Speed Reading™" name implying rapid serial visual presentation.
   Disclosed in ALS-14 as the clearest gap against the mode's own name; not built, since it would require
   new architecture (a new presentation mode, a new persisted pacing preference) beyond a "polish only"
   sprint's bounds.
5. **Revision Mode™'s own cross-session history summary is a union across every past session on a
   document, not a per-session breakdown** — worded honestly in its own copy ("across your past
   sessions," not "last time") rather than implying more precision than the real aggregate data has.
6. **Smart Notes™'s own completion screen uses a different visual structure than the other five stepped-
   session modes' completion screens** — it embeds the real, editable notes panel inline (the actual
   deliverable a learner wants immediately after finishing), which the shared Card+Progress-bar template
   the other five modes use isn't built to accommodate. A real, functional reason, confirmed via audit in
   ALS-19, not an oversight.
7. **Nine real, working, but currently unwired functions remain in the codebase**: `getReadingProgress`,
   `getMemoryProgress`, `getMemorySessionIntelligence`, `getMemoryLearningProfile`,
   `getMemorySessionCompletionIntelligence`, `getSmartNotesProgress`, `getSmartNotesSessionIntelligence`,
   `getSmartNotesLearningProfile`, `getSmartNotesSessionCompletionIntelligence` — confirmed zero real
   importers by a dead-code audit in ALS-19, but founder-confirmed (via `AskUserQuestion`) to be left in
   place rather than deleted, since they read as deliberate groundwork for a possible future Learning
   Profile/Session Intelligence dashboard (Version-2 territory), not accidental leftovers.
8. **`runModeSessionDecisionWithClient` (the one shared decision-dispatch function every real session
   action across every stepped-session mode funnels through) has no defensive try/catch** around its core
   decision call. Disclosed in ALS-12: a purely theoretical, evidence-free risk (every function it calls
   is pure and already validated) in mature, heavily-exercised, multi-mode shared code — touching it for a
   hypothetical would cross this arc's own "never redesign working architecture for a guess" rule. Real
   candidate for a future, dedicated hardening sprint if ever warranted by an actual incident.
9. **A separate, older, fully orphaned `src/features/learning-intelligence/generators/` module**
    (`generateFlashcards.ts`, `generateQuiz.ts`, `generateRevision.ts`, `generatePractice.ts`) has zero
    real importers into the live app, confirmed unchanged across two separate audits (ALS-17, ALS-19). Not
    part of AI Learning Studio™'s own real, production code path; not touched.

## Resolved, no longer an issue

- The Focus Mode™ sepia reading theme's contrast — flagged "unmeasured" since Sprint-3 of the earlier QSR
  track — was measured in ALS-14 (OKLCH → linear sRGB → WCAG relative luminance) and confirmed passing AA
  with real margin (5.53:1 to 11.42:1 across every real color pairing). No longer an open question.
- **The 8 (then 9, as of ALS-23) migrations that stood unapplied to the linked, hosted Supabase project
  since ALS-10** — `20260717000001` (Universal Learning Objects) through `20260723000001` (MCQs™ session
  type) — surfaced as two real, live production errors once ALS-22 unblocked the upload pipeline (a 404 on
  loading a Universal Learning Object; a 400 on starting a Smart Notes™/Focus Mode™/MCQs™ session). ALS-23
  applied all 9 via `supabase db push`, confirmed each one directly against the live database (REST probes
  and `supabase db query`), and re-ran the full verification suite with zero code changes required — the
  application code had already matched every one of these migrations exactly. No longer a deployment
  prerequisite; no longer a known issue.

## Severity assessment

None of the items above are release blockers *for a Release Candidate*. Item 1 is the one real prerequisite
remaining before RC-1 can become a live production release — a deployment/QA step, not a code defect,
explicitly called out in the Launch Checklist. Items 2–9 are honest, disclosed scope boundaries consistent
with this platform's own "no fake AI, no fabricated content" discipline, each with a clear,
already-understood path forward if and when a future sprint is explicitly scoped to address it.
