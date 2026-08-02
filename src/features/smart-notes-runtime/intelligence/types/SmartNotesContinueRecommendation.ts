// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Smart Continue — a
// real, deterministic recommendation for what "continue" should mean
// when a learner returns to a document, never an automatic runtime
// action. LSE-2's own real Session Recovery (`restoreFromSnapshot`)
// always still runs exactly as before; this is additional, optional
// guidance. Mirrors Memory Mode™'s own `SmartContinueRecommendation`
// (Sprint-3) exactly.
export type SmartNotesContinueAction = 'resume' | 'quick-refresh'

export type SmartNotesContinueRecommendation = {
  action: SmartNotesContinueAction
  reason: string
}
