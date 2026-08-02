-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000005_create_quantum_document_sessions
--
-- AI Document Transformer™ — Gamification & XP Sync. Records one row per
-- completed Quantum Session (real speed-reading pass + real self-assessed
-- Active Recall quiz) over a `quantum_documents` row. Follows the exact
-- same convention `daily_quantum_sessions` already established for this
-- app's other real-time session flow: an append-only log, streak and
-- lifetime XP always DERIVED from this log (never a separately mutable
-- running total that could drift out of sync) — see
-- quantumDocumentSessionTracking.ts. Kept deliberately separate from
-- `daily_quantum_sessions`'s own streak/XP — a Quantum Document session is
-- a distinct real activity, not a stand-in for the 4-level Daily Quantum
-- Session, the same "never blend into a streak that means something
-- narrower" principle already applied elsewhere in this schema.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.quantum_document_sessions (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  quantum_document_id   uuid        NOT NULL REFERENCES public.quantum_documents (id) ON DELETE CASCADE,
  correct_answers_count integer     NOT NULL CHECK (correct_answers_count >= 0),
  total_questions_count integer     NOT NULL CHECK (total_questions_count > 0),
  xp_earned             integer     NOT NULL CHECK (xp_earned >= 0),
  occurred_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quantum_document_sessions_correct_le_total CHECK (correct_answers_count <= total_questions_count)
);

CREATE INDEX quantum_document_sessions_user_occurred_idx ON public.quantum_document_sessions (user_id, occurred_at DESC);

ALTER TABLE public.quantum_document_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quantum_document_sessions_select_own" ON public.quantum_document_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "quantum_document_sessions_insert_own" ON public.quantum_document_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
