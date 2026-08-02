-- ─────────────────────────────────────────────────────────────────────────────
-- 20260725000001_create_qsr_reading_speed_samples
--
-- Quantum Speed Reading Experience Engine™ (QSR-E1). Real per-document
-- reading-speed persistence — confirmed, before this migration, to not
-- exist anywhere for a learner's own uploaded content (the existing real
-- WPM system, `reading_intelligence_sessions`, only ever tracks the
-- separate, fixed 24-passage Lab library, never a real uploaded
-- document). Powers Speed Ladder™'s real Current/Best/Level/Target
-- figures and the AI Recommendation Layer's real WPM signal — deliberately
-- minimal fields only ("do not overwhelm with analytics. Store them
-- internally," per this sprint's own brief).
--
-- Append-only, same convention as `reading_intelligence_sessions`: a
-- recorded sample is a real, historical fact about one real reading
-- moment and is never edited or deleted after the fact.
--
-- Quantum Speed Reading Hub Experience™ (Sprint-1) amendment — `wpm` is
-- nullable: this table doubles as the real completion log every one of
-- the 6 real Hub modes writes to (not just the WPM-bearing ones), backing
-- real "Today's Sessions"/"Current Streak" figures the Hub now shows.
-- Presence Reading/Guided Eye Flow/Comprehension Check log a real
-- completion with `wpm: null` ("this happened, no WPM applies") rather
-- than a fabricated number; Sprint/Smart Chunk Reading still log a real
-- measured WPM exactly as before.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.qsr_reading_speed_samples (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  mode         text        NOT NULL,
  wpm          integer     CHECK (wpm >= 0),
  recorded_at  timestamptz NOT NULL DEFAULT now()
);

-- Hot path: "this learner's samples for this document, most recent
-- first" — feeds Speed Ladder's own Current/Best/history queries and
-- "Today's Sessions."
CREATE INDEX qsr_reading_speed_samples_user_document_idx
  ON public.qsr_reading_speed_samples (user_id, document_id, recorded_at DESC);

-- Second hot path: "this learner's samples across every document, most
-- recent first" — feeds the real, cross-document "Current Streak" figure.
CREATE INDEX qsr_reading_speed_samples_user_idx
  ON public.qsr_reading_speed_samples (user_id, recorded_at DESC);

ALTER TABLE public.qsr_reading_speed_samples ENABLE ROW LEVEL SECURITY;

-- Append-only: select/insert only, no update/delete policies — same
-- convention as `reading_intelligence_sessions`' own migration.
CREATE POLICY "qsr_reading_speed_samples_select_own"
  ON public.qsr_reading_speed_samples
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "qsr_reading_speed_samples_insert_own"
  ON public.qsr_reading_speed_samples
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
