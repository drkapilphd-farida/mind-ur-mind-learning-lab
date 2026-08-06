-- ─────────────────────────────────────────────────────────────────────────────
-- 20260805000004_fix_family_members_rls_recursion
--
-- family_members_select_same_family (20260711000001_create_families_and_members.sql)
-- has the exact same self-referencing-EXISTS shape that caused a real,
-- reproduced "infinite recursion detected in policy for relation
-- school_members" error during School Dashboard Phase 1 testing (see
-- 20260805000002_fix_school_dashboard_rls_recursion.sql) — a table's own
-- RLS policy querying that same table inside its USING clause. It was
-- flagged then as almost certainly latent here too, unverified until now.
--
-- Confirmed live: `family_members_select_same_family`'s USING clause is
--   EXISTS (SELECT 1 FROM family_members AS self WHERE self.family_id =
--     family_members.family_id AND self.user_id = auth.uid() AND
--     self.status = 'active')
-- — a self-join on family_members, evaluated inside family_members' own
-- SELECT policy. Every other policy on families/family_members queries
-- the OTHER table (family_members's own INSERT/UPDATE/DELETE policies
-- and families_select_member reference `families`, not `family_members`
-- itself) and is therefore NOT affected — this migration touches only
-- the one genuinely self-referencing policy.
--
-- Fix: identical technique used for schools — move the self-referencing
-- check into a SECURITY DEFINER helper function. A SECURITY DEFINER
-- function owned by the migration role (table owner) bypasses RLS on
-- the tables it reads internally, so the recursive re-entry never
-- happens. Policy logic is unchanged; only how it's expressed.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_active_family_member(p_family_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = p_family_id AND user_id = auth.uid() AND status = 'active'
  )
$$;

DROP POLICY IF EXISTS "family_members_select_same_family" ON public.family_members;
CREATE POLICY "family_members_select_same_family"
  ON public.family_members FOR SELECT TO authenticated
  USING (public.is_active_family_member(family_id));
