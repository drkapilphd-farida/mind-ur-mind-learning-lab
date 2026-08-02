// Universal Learning Object™ (UCE-6). Real versioning envelope —
// identical pattern to every prior layer's version type (ChunkVersion,
// GraphVersion, AnalysisVersion). `schemaVersion` is the shape version
// of `UniversalLearningObject` itself; `revision` is this specific ULO's
// real edit count — 1 at first build, incremented only by a real
// `updateUniversalLearningObject()` call. Migration/backward-
// compatibility hook: only one schema version exists so far, so no
// concrete migrator is built this sprint — nothing real to migrate from
// yet (see docs/PRODUCTION_HANDOFF_UCE_6.md).
export type ULOVersion = {
  schemaVersion: string
  revision: number
}
