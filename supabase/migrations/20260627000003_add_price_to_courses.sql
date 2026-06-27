-- Add price_cents to courses; 0 means the course is free.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS price_cents int4 NOT NULL DEFAULT 0
  CONSTRAINT courses_price_cents_non_negative CHECK (price_cents >= 0);
