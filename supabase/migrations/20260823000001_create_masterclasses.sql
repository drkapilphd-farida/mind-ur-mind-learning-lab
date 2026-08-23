-- ─────────────────────────────────────────────────────────────────────────────
-- 20260823000001_create_masterclasses
--
-- 3-Pillar Command Center™ (Phase 5) — the /masterclasses hub page has, up
-- to now, only ever shown static enrollment/waitlist content because no
-- table anywhere stored a real, bookable live session. This is that real
-- table: each row is one of Dr. Kapil Dev Sharma's live masterclass
-- sessions. Content is admin-managed only (no self-serve authoring UI
-- exists yet) — rows are written via createServiceClient()
-- (src/lib/supabase/service.ts), the same service-role path every other
-- admin-only write in this app already goes through, so no INSERT/UPDATE/
-- DELETE policy is granted to `authenticated` below.
--
-- scheduled_at and recording_url are both nullable on purpose: a session
-- can exist as "coming soon, date to be announced" before a date is set,
-- and only gains a recording_url after it has actually happened — the app
-- must never fabricate either value, only display what's really there.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.masterclasses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  description   text        NOT NULL,
  scheduled_at  timestamptz,
  recording_url text,
  mentor_name   text        NOT NULL DEFAULT 'Dr. Kapil Dev Sharma',
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_masterclasses_updated_at
  BEFORE UPDATE ON public.masterclasses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.masterclasses ENABLE ROW LEVEL SECURITY;

-- Every signed-in student may read active sessions — this is shared
-- program content, not per-user data (mirrors profiles_select_authenticated's
-- USING (true) read posture for the same reason). Inactive rows (e.g. a
-- draft session being prepared, or one pulled after the fact) stay
-- invisible to students entirely, not just unlinked.
CREATE POLICY "masterclasses_select_active_authenticated"
  ON public.masterclasses FOR SELECT TO authenticated
  USING (is_active = true);
