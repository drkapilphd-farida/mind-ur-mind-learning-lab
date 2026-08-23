-- ─────────────────────────────────────────────────────────────────────────────
-- 20260823162303_add_join_url_to_masterclasses
--
-- Member-Exclusive Simplification™ — the /masterclasses hub's "Masterclass"
-- tab becomes a pure Live Member Training Hub (real schedule + join link,
-- recorded vault, direct mentor contact — no enrollment/sales copy, that
-- moves to a future public landing page). `recording_url` already covers
-- the vault; this adds the other real, admin-authored field the hub needs:
-- the live meeting link for an upcoming/current session, distinct from
-- recording_url (a session only ever has one of the two populated at a
-- time — join_url before it happens, recording_url after).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.masterclasses ADD COLUMN join_url text;
