// Universal Learning Object™ (UCE-6) — the "References" line item under
// Knowledge Intelligence. Real traceability back through every layer
// this ULO was assembled from — every id here is genuinely present in
// the real inputs (see internal/computeProvenance.ts), never a
// placeholder. Lets a consumer verify/cite exactly which document,
// source file, chunk set, graph revision, and analysis revision
// produced this ULO without re-deriving anything.
export type ULOProvenance = {
  documentId: string
  sourceId: string
  chunkIds: readonly string[]
  graphId: string
  analysisId: string
}
