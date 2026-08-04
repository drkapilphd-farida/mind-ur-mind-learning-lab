-- ─────────────────────────────────────────────────────────────────────────────
-- 20260804000001_create_quantum_document_analysis_cache
--
-- AI Cost Optimization™ — Global Document Deduplication. Every quantum
-- document upload today calls Claude fresh, even when a different student
-- uploaded the exact same book/chapter earlier. This table is a
-- content-addressed cache: `content_hash` is a SHA-256 of the exact text
-- sent to the model (the same text `generateQuantumDocumentIntelligence.ts`
-- hashes at call time — see documentAnalysisCache.ts), paired with
-- `target_language` since a Hindi-translated analysis and an English one
-- of the same document are genuinely different payloads. A cache hit on
-- (content_hash, target_language) means zero Claude tokens spent — the
-- stored payload is reused as-is.
--
-- Deliberately separate from `quantum_documents` (each user's own saved
-- upload) rather than reusing it directly: this table is a cross-user,
-- server-only lookup with no per-row owner, so it's read/written
-- exclusively via the service-role client (see documentAnalysisCache.ts),
-- the same access pattern `ai_cost_log` already uses — RLS enabled, zero
-- policies, so no anon/authenticated role can touch it at all regardless
-- of any future policy mistake elsewhere.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.quantum_document_analysis_cache (
  content_hash      text        NOT NULL,
  target_language   text        NOT NULL,
  model_id          text        NOT NULL,
  ai_summary        text        NOT NULL,
  spider_notes      jsonb       NOT NULL,
  keywords          text[]      NOT NULL,
  quiz_questions    jsonb       NOT NULL,
  feynman_challenge jsonb       NOT NULL,
  mnemonics         jsonb       NOT NULL,
  subject_lens      jsonb       NOT NULL,
  reading_text      text,
  hit_count         integer     NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  last_hit_at       timestamptz,
  PRIMARY KEY (content_hash, target_language)
);

ALTER TABLE public.quantum_document_analysis_cache ENABLE ROW LEVEL SECURITY;
