-- ─────────────────────────────────────────────────────────────────────────────
-- 20260711000001_create_families_and_members
--
-- AI Learning Studio™ Sprint 0 — Platform Foundation™. Domain model: see
-- docs/adr/0001-ai-learning-studio-domain-model.md.
--
-- Family accounts foundation. `family_members` supports both real accounts
-- (user_id set) and child members with no login of their own (user_id
-- null, display_name instead) — no separate "child profile" table.
-- Purely additive: no existing table is altered.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.families (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  owner_id    uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX families_owner_idx ON public.families (owner_id);


CREATE TABLE public.family_members (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     uuid        NOT NULL REFERENCES public.families (id) ON DELETE CASCADE,
  -- Null for a child member with no account of their own.
  user_id       uuid        REFERENCES auth.users (id) ON DELETE CASCADE,
  member_type   text        NOT NULL DEFAULT 'adult' CHECK (member_type IN ('owner', 'adult', 'child')),
  -- Only meaningful when user_id is null (a child member has no profile to read a name from).
  display_name  text,
  status        text        NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'removed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT family_members_user_or_display_name CHECK (user_id IS NOT NULL OR display_name IS NOT NULL),
  CONSTRAINT family_members_family_user_unique UNIQUE (family_id, user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX family_members_family_idx ON public.family_members (family_id);
CREATE INDEX family_members_user_idx ON public.family_members (user_id);

-- A member may view the roster of any family they themselves belong to.
CREATE POLICY "family_members_select_same_family"
  ON public.family_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members AS self
      WHERE self.family_id = family_members.family_id
        AND self.user_id = auth.uid()
        AND self.status = 'active'
    )
  );

-- Only the family owner may add members.
CREATE POLICY "family_members_insert_owner"
  ON public.family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.families
      WHERE families.id = family_members.family_id
        AND families.owner_id = auth.uid()
    )
  );

-- The owner may update any member row; a member may update their own (e.g. accept an invite).
CREATE POLICY "family_members_update_owner_or_self"
  ON public.family_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.families
      WHERE families.id = family_members.family_id
        AND families.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.families
      WHERE families.id = family_members.family_id
        AND families.owner_id = auth.uid()
    )
  );

-- Only the family owner may remove a member.
CREATE POLICY "family_members_delete_owner"
  ON public.family_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.families
      WHERE families.id = family_members.family_id
        AND families.owner_id = auth.uid()
    )
  );

-- Families policies come after family_members so they can reference it.

-- A user may view a family if they own it or are an active member of it.
CREATE POLICY "families_select_member"
  ON public.families
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
        AND family_members.status = 'active'
    )
  );

-- Any authenticated user may create a family (becoming its owner).
CREATE POLICY "families_insert_own"
  ON public.families
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "families_update_owner"
  ON public.families
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "families_delete_owner"
  ON public.families
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());


-- Auto-provision the owner's own family_members row on creation — so
-- "list all members of a family" never needs to special-case the owner
-- via families.owner_id separately. Mirrors the existing
-- handle_new_user() → profiles auto-provisioning pattern.
CREATE OR REPLACE FUNCTION public.handle_new_family()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.family_members (family_id, user_id, member_type, status)
  VALUES (new.id, new.owner_id, 'owner', 'active');
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_family_created
  AFTER INSERT ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_family();
