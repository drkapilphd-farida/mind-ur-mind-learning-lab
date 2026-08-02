-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705090000_add_delete_policy_to_tratak_mission_sessions
--
-- Visual Intelligence Lab™ — Mandala Tratak™ Multi-Level Progression, Sprint 10C.
--
-- Sprint 10A's original table only defined SELECT/INSERT policies (an
-- honest append-only-log design — nothing in this codebase deleted rows
-- until now). Sprint 10C's dev-only "Reset Mission" tool needs to delete a
-- user's own rows for one mission id, and RLS silently allows zero rows to
-- be affected without an explicit DELETE policy — this was discovered live
-- during QA (the reset button reported success but left rows in place).
-- Purely additive/permissive: only enables users to delete their own rows,
-- changes no existing read/write behavior.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "tratak_mission_sessions_delete_own"
  ON public.tratak_mission_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
