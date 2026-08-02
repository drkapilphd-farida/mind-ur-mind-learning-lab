import type { SessionSnapshot } from '@/core/learning-session-runtime'

// Quantum Speed Reading™ Production Sprint-1. Analytics — reuses LSE-3's
// own already-real, already-derived `SessionSnapshot` fields directly; no
// new analytics system, no new metric.
export type GetReadingProgressResult =
  | { success: true; status: SessionSnapshot['status']; completionPercentage: SessionSnapshot['completionPercentage']; metrics: SessionSnapshot['metrics'] }
  | { success: false; error: string }
