-- ─────────────────────────────────────────────────────────────────────────────
-- 20260711000006_create_roles_and_permissions
--
-- AI Learning Studio™ Sprint 0 — Platform Foundation™. Domain model: see
-- docs/adr/0001-ai-learning-studio-domain-model.md.
--
-- Standard RBAC shape: roles and permissions are lookup tables (small,
-- mostly static, safe to read broadly — same posture as the public
-- `plans` catalog); user_roles and role_permissions are the join tables
-- that actually grant anything, and are service-role-written only (no
-- authenticated INSERT policy) so a client can never self-assign a role.
-- No seed data — this sprint ships the shape only.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.roles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text        NOT NULL,
  name        text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT roles_key_key UNIQUE (key)
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select_all"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);


CREATE TABLE public.permissions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT permissions_key_key UNIQUE (key)
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions_select_all"
  ON public.permissions
  FOR SELECT
  TO authenticated
  USING (true);


CREATE TABLE public.role_permissions (
  role_id       uuid NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions (id) ON DELETE CASCADE,

  PRIMARY KEY (role_id, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_select_all"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);


CREATE TABLE public.user_roles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role_id     uuid        NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
  -- Null = a global role assignment; set = the role only applies within that family (e.g. "family_admin").
  family_id   uuid        REFERENCES public.families (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX user_roles_user_idx ON public.user_roles (user_id);
CREATE INDEX user_roles_family_idx ON public.user_roles (family_id) WHERE family_id IS NOT NULL;

-- Two partial unique indexes rather than one UNIQUE(user_id, role_id,
-- family_id) constraint — Postgres treats every NULL as distinct for
-- uniqueness, so a plain 3-column UNIQUE would silently allow the same
-- *global* role (family_id null) to be assigned to a user more than once.
CREATE UNIQUE INDEX user_roles_global_unique ON public.user_roles (user_id, role_id) WHERE family_id IS NULL;
CREATE UNIQUE INDEX user_roles_family_unique ON public.user_roles (user_id, role_id, family_id) WHERE family_id IS NOT NULL;

-- A user may see their own role assignments. Assignment itself
-- (INSERT/UPDATE/DELETE) is service-role only.
CREATE POLICY "user_roles_select_own"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
