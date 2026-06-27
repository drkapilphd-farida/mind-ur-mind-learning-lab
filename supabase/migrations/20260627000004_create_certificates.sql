CREATE TABLE public.certificates (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id  UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  token      UUID        NOT NULL DEFAULT gen_random_uuid(),
  issued_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT certificates_user_course_unique UNIQUE (user_id, course_id),
  CONSTRAINT certificates_token_unique       UNIQUE (token)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public SELECT so share links work without auth
CREATE POLICY "certificates_select_public"
  ON public.certificates FOR SELECT
  USING (true);

-- Users may only insert their own certificate
CREATE POLICY "certificates_insert_own"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);
