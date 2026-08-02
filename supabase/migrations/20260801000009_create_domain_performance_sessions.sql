-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000009_create_domain_performance_sessions
--
-- 21-Day Transformation Journey™ — Smart Weakness Targeting. Real,
-- server-side, cross-device accuracy history for the 3 non-reading
-- domains (Intuition, Right Brain, Visualisation) — before this table,
-- every one of those exercises' accuracy/streak stats lived in browser
-- localStorage only (per-device, not queryable). One row per real
-- completed attempt of a domain-mapped exercise (never Word Flash or
-- Schulte Grid — neither maps to one of these 3 tracked domains, and
-- Schulte Grid has no accuracy% concept at all). Reading domain weakness
-- deliberately has no row here — `daily_quantum_sessions.accuracy_percent`
-- already covers it, and blending a second "reading accuracy" source
-- would be exactly the kind of metric confusion this feature exists to
-- prevent.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.domain_performance_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  domain           text        NOT NULL CHECK (domain IN ('intuition', 'right_brain', 'visualisation')),
  exercise_id      text        NOT NULL,
  accuracy_percent integer     NOT NULL CHECK (accuracy_percent >= 0 AND accuracy_percent <= 100),
  occurred_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX domain_performance_sessions_user_domain_occurred_idx
  ON public.domain_performance_sessions (user_id, domain, occurred_at DESC);

ALTER TABLE public.domain_performance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domain_performance_sessions_select_own" ON public.domain_performance_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "domain_performance_sessions_insert_own" ON public.domain_performance_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
