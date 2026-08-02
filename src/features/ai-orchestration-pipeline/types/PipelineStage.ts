// "Initialized, Context Ready, Prompt Ready, Request Ready, Response
// Normalized, Completed, Failed" — the Sprint 34 brief's own Section 3
// list, verbatim. Companion type, not one of the 5 named models.
export type PipelineStage = 'initialized' | 'context-ready' | 'prompt-ready' | 'request-ready' | 'response-normalized' | 'completed' | 'failed'
