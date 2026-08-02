// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Smart Continue —
// a real, deterministic recommendation for what "continue" should mean
// when a learner returns to a document, never an automatic runtime
// action. LSE-2's own real Session Recovery (`restoreFromSnapshot`)
// always still runs exactly as before; this is additional, optional
// guidance layered on top, for a future presentation sprint to surface.
export type SmartContinueAction = 'resume' | 'quick-refresh'

export type SmartContinueRecommendation = {
  action: SmartContinueAction
  reason: string
}
