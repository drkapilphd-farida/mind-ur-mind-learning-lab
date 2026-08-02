// Learning Chunk™ (canonical domain model). Real but empty — no tagging
// system (manual or automatic) exists yet. `userTags` is reserved for a
// future manual-tagging feature; `systemTags` for future automated
// classification (e.g. UCE-5).
export type ChunkTags = {
  userTags: readonly string[]
  systemTags: readonly string[]
}
