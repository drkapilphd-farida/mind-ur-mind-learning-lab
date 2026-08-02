-- ─────────────────────────────────────────────────────────────────────────────
-- 20260802110000_add_pacing_attention_to_reading_intelligence_sessions
--
-- reading_intelligence_sessions was created without the pacing (pause/resume,
-- completion) and attention-tracking columns that saveReadingIntelligenceSession
-- and ReadingExperience.tsx have since started writing. Adds them so those
-- inserts stop targeting nonexistent columns.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.reading_intelligence_sessions
  ADD COLUMN pause_count       integer NOT NULL DEFAULT 0 CHECK (pause_count >= 0),
  ADD COLUMN resume_count      integer NOT NULL DEFAULT 0 CHECK (resume_count >= 0),
  ADD COLUMN completion_percent integer NOT NULL DEFAULT 100 CHECK (completion_percent BETWEEN 0 AND 100),
  ADD COLUMN attention_score   integer NOT NULL DEFAULT 0 CHECK (attention_score BETWEEN 0 AND 100),
  ADD COLUMN attention_level   text CHECK (attention_level IN ('high', 'medium', 'low'));
