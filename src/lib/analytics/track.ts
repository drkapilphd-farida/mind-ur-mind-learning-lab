import { logger } from '@/lib/logger'

// Sprint 1's product analytics events (First Learning Project™) —
// distinct from `services/analytics`'s `audit_logs` (a security/
// compliance trail written server-side only, not a general "log this"
// call — see docs/adr/0002-domain-layered-architecture.md). Prepare
// only, per this sprint's explicit scope: no analytics backend is wired,
// this only names the events and gives every call site one place to
// call instead of inventing its own tracking call.
export type LearningProjectAnalyticsEvent =
  | 'project_created'
  | 'project_opened'
  | 'upload_started'
  | 'upload_completed'
  | 'processing_started'
  | 'processing_completed'
  | 'blueprint_viewed'
  | 'ready_to_learn_clicked'
  | 'reading_session_started'
  | 'reading_session_completed'
  // Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading
  // Experience Integration™. Quantum Reading Journey™ events — tracked
  // from the journey controller only, never from inside the reused
  // engine components/functions it sequences (Word Flash,
  // Progressive Chunk Reading, Reading Assessment stay untouched).
  | 'qsr_journey_started'
  | 'qsr_journey_resumed'
  | 'qsr_journey_word_flash_completed'
  | 'qsr_journey_chunk_reading_completed'
  // QSR-INTEGRATION-1 — Phrase/Sentence/Paragraph/Reading Sprint stages.
  | 'qsr_journey_phrase_reading_completed'
  | 'qsr_journey_sentence_reading_completed'
  | 'qsr_journey_paragraph_reading_completed'
  | 'qsr_journey_reading_sprint_completed'
  | 'qsr_journey_assessment_completed'
  | 'qsr_journey_chapter_completed'
  | 'qsr_journey_abandoned'
  // Phase 2 — Mode A / Mode B Fork™. Which mode a learner picked right
  // after their upload finished processing (see ModeChoiceExperience.tsx).
  | 'mode_choice_selected'

// Dev-only console output today (via the existing logger, silent in
// production) — swapping in a real analytics backend later is a change
// to this one function's body, never to any call site.
export function trackEvent(event: LearningProjectAnalyticsEvent, properties?: Record<string, unknown>): void {
  logger.debug(`[analytics] ${event}`, properties)
}
