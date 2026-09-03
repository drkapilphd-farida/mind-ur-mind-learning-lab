-- ─────────────────────────────────────────────────────────────────────────────
-- 20260903000001_add_why_interested_to_franchise_leads
--
-- The rebuilt /franchise-individual application form separates "Your
-- Background/Experience" from a distinct "Why Are You Interested?"
-- question — kept as its own nullable column (not folded into
-- `background`) so the admin review queue can read the applicant's
-- motivation separately from their credentials.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.franchise_leads
  ADD COLUMN why_interested text;
