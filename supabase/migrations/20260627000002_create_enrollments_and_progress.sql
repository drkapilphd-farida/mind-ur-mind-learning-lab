-- ─────────────────────────────────────────────────────────────────────────────
-- 20260627000002_create_enrollments_and_progress
--
-- Creates lessons, enrollment records, and lesson completion tracking.
-- Lessons RLS references enrollments, so both tables are in this migration.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── Lessons ───────────────────────────────────────────────────────────────────
-- Ordered content within a course. Slug is unique per course, not globally.

CREATE TABLE public.lessons (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        uuid        NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title            text        NOT NULL,
  slug             text        NOT NULL,
  content_url      text,
  duration_seconds integer     NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  sort_order       integer     NOT NULL DEFAULT 0,
  is_published     boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT lessons_course_slug_key UNIQUE (course_id, slug)
);

-- lesson list ordered by position (most-hit query path)
CREATE INDEX lessons_course_sort_idx  ON public.lessons (course_id, sort_order);
-- slug-based lesson lookup within a course
CREATE INDEX lessons_course_slug_idx  ON public.lessons (course_id, slug);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Enrollments ───────────────────────────────────────────────────────────────
-- Records which users are enrolled in which courses.
-- A user may not enroll in the same course twice (UNIQUE constraint).

CREATE TABLE public.enrollments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id)    ON DELETE CASCADE,
  course_id   uuid        NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT enrollments_user_course_key UNIQUE (user_id, course_id)
);

-- all courses a user is enrolled in (dashboard, middleware auth checks)
CREATE INDEX enrollments_user_id_idx   ON public.enrollments (user_id);
-- enrollment count per course (analytics)
CREATE INDEX enrollments_course_id_idx ON public.enrollments (course_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;


-- ── Lesson Completions ────────────────────────────────────────────────────────
-- One row per (user, lesson) pair; inserted when a user finishes a lesson.

CREATE TABLE public.lesson_completions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id)    ON DELETE CASCADE,
  lesson_id    uuid        NOT NULL REFERENCES public.lessons (id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT lesson_completions_user_lesson_key UNIQUE (user_id, lesson_id)
);

-- all completions for a user (progress dashboard)
CREATE INDEX lesson_completions_user_id_idx    ON public.lesson_completions (user_id);
-- hot-path: check whether a specific lesson is done
CREATE INDEX lesson_completions_user_lesson_idx ON public.lesson_completions (user_id, lesson_id);

ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;


-- ── RLS: Lessons ─────────────────────────────────────────────────────────────
-- Enrolled, authenticated users may read published lessons in their courses.

CREATE POLICY "lessons_select_enrolled"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = lessons.course_id
        AND enrollments.user_id   = auth.uid()
    )
  );


-- ── RLS: Enrollments ─────────────────────────────────────────────────────────

-- Users see only their own enrollments
CREATE POLICY "enrollments_select_own"
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users may enroll themselves only
CREATE POLICY "enrollments_insert_own"
  ON public.enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users may unenroll themselves
CREATE POLICY "enrollments_delete_own"
  ON public.enrollments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ── RLS: Lesson Completions ───────────────────────────────────────────────────

-- Users see only their own completion records
CREATE POLICY "lesson_completions_select_own"
  ON public.lesson_completions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users may mark a lesson complete only if they are enrolled in its course
CREATE POLICY "lesson_completions_insert_own"
  ON public.lesson_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.lessons      l
      JOIN public.enrollments  e ON e.course_id = l.course_id
      WHERE l.id           = lesson_completions.lesson_id
        AND e.user_id      = auth.uid()
    )
  );

-- Users may un-complete a lesson (e.g. reset progress)
CREATE POLICY "lesson_completions_delete_own"
  ON public.lesson_completions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
