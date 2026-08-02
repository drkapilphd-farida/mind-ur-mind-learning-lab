// Adaptive Learning Runtime™ (LSE-2). The brief's original 9 named
// runtime decisions, plus `previous-chunk` — added by the QSR Sprint-1
// amendment (see decisions/previousChunk.ts) as the one real,
// evidence-driven addition both the QSR architecture review and its
// Final Lock document explicitly deferred until a real production
// sprint needed it. Each maps to one real function under decisions/ —
// see index.ts for the full list. This type exists for callers that
// need to name a decision generically (e.g. logging, a future
// dispatcher); no production file switches on it today — every decision
// is called directly by name, the same "no invented dispatch layer"
// discipline as LSE-1's own actions/.
export type RuntimeDecisionType = 'start' | 'continue' | 'pause' | 'resume' | 'repeat-chunk' | 'skip-chunk' | 'revisit-later' | 'checkpoint' | 'complete' | 'previous-chunk'
