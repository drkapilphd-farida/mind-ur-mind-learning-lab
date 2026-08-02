-- ─────────────────────────────────────────────────────────────────────────────
-- 20260726000001_create_qsr_reading_assessments
--
-- Reading Assessment Engine™ (Production Prompt 01A). The real, one-time
-- (per document) measurement of how a learner actually reads, taken
-- before AI begins recommending a Quantum Speed Reading mode — never a
-- guess. Four real stages (word-chunk / phrase-chunk / sentence /
-- paragraph), each a real passage from the learner's own uploaded
-- document, each measured for real WPM + real comprehension via real
-- questions built from that document's own AI enrichment (zero new
-- Claude calls — see `assessment/questions/`).
--
-- Deliberately NOT append-only, unlike `qsr_reading_speed_samples` or
-- `reading_intelligence_sessions`: this table holds the current Reading
-- Profile for a document, not a log of practice events. "Retake
-- Assessment" (from Settings) genuinely means replacing this row, not
-- appending a new one — hence the unique index and the delete-own policy
-- below (the real retake mechanism: delete, then the next `/read` visit
-- naturally re-triggers the assessment flow and re-inserts).
--
-- `comprehension_percent` and `accuracy_percent` inside each
-- `stage_results` entry are written from the same one real measured
-- quantity (correct answers ÷ total questions) — the same honest
-- precedent `reading_intelligence_sessions`' own migration already
-- established, not two independently-measured signals.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.qsr_reading_assessments (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id           uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  user_id               uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Array of 4 real per-stage results: [{ stage, chunkNodeId,
  -- selfSelectedPace, wpm, readingTimeMs, comprehensionPercent,
  -- accuracyPercent, questionCount, correctCount }] — see
  -- `assessment/actions/saveReadingAssessment.ts` for the exact real
  -- shape written.
  stage_results         jsonb       NOT NULL,
  -- Comfortable Reading Speed: the paragraph-stage's own real measured
  -- WPM (closest real stage to natural, un-decomposed reading).
  overall_wpm           integer     NOT NULL CHECK (overall_wpm >= 0),
  reading_style         text        NOT NULL,
  recommended_mode      text        NOT NULL,
  recommendation_reason text        NOT NULL,
  completed_at          timestamptz NOT NULL DEFAULT now()
);

-- One current Reading Profile per document per learner — a fresh
-- assessment replaces (delete + reinsert), never duplicates.
CREATE UNIQUE INDEX qsr_reading_assessments_user_document_idx
  ON public.qsr_reading_assessments (user_id, document_id);

ALTER TABLE public.qsr_reading_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qsr_reading_assessments_select_own"
  ON public.qsr_reading_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "qsr_reading_assessments_insert_own"
  ON public.qsr_reading_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Real "Retake Assessment" mechanism (from Settings) — delete this
-- learner's own row for a document; the next `/read` visit finds no
-- assessment and naturally re-enters the assessment flow.
CREATE POLICY "qsr_reading_assessments_delete_own"
  ON public.qsr_reading_assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
