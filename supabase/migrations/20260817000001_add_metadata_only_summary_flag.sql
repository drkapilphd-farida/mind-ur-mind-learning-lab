-- ─────────────────────────────────────────────────────────────────────────────
-- 20260817000001_add_metadata_only_summary_flag
--
-- Honest YouTube Fallback™ — as of 2025, YouTube's caption/transcript
-- endpoint requires a Proof-of-Origin browser token that a server-side
-- fetch cannot produce, so most YouTube imports can no longer retrieve a
-- real transcript (see extractYouTubeTranscript.ts's own doc comment).
-- Rather than either failing outright or silently fabricating content,
-- that path now falls back to the video's own REAL title + description
-- (genuine YouTube metadata, never invented) when no transcript is
-- available — but that's meaningfully thinner, less-verified source
-- material than a real transcript/article/upload, so every row generated
-- this way is flagged here.
--
-- The document viewer (QuantumDocumentDetailView.tsx) uses this flag to
-- permanently disclose the thinner source and to hide anything that
-- tests factual recall (the Quiz, Recall Questions, Feynman Challenge)
-- against content the system never actually verified against a real
-- transcript — never presenting a guess as if it were a graded test of
-- real video content.
--
-- `NOT NULL DEFAULT false` — every existing row (file uploads, website
-- imports, real-transcript YouTube imports) is unambiguously "not
-- metadata-only," no backfill/null-handling needed at read time.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quantum_documents
  ADD COLUMN is_metadata_only_summary boolean NOT NULL DEFAULT false;
