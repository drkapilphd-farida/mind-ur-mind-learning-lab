// Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10A.
// Shared types for the Tratak missions, backed by one discriminated
// append-only table (tratak_mission_sessions) — mirrors fixationTypes.ts.
//
// Sprint 10F: the 5 originally-reserved placeholder mission ids (Color/
// Nature/Portrait/Sacred Symbol Persistence™, Candle Tratak™) were
// consolidated into one real mission, 'image-persistence-challenge'.
//
// Sprint 10F refinement: Mandala Persistence™ is retired from the visible
// roadmap (see tratakMissions.ts) in favor of Candle Tratak™ as Mission 1.
// 'mandala-persistence' stays in this union so /tratak/mandala and its real
// historical rows keep working untouched if visited directly — only the
// roadmap array (tratakMissions.ts) actually drives what's "in" the
// journey for progress/XP math.
export type TratakMissionId = 'mandala-persistence' | 'candle-tratak' | 'image-persistence-challenge'

export type TratakMissionSessionRecord = {
  missionId: TratakMissionId
  durationSeconds: number
  completed: boolean
  occurredAt: string
  /** Sprint 10C: set for missions with sub-levels (Mandala Tratak™'s 5
   * levels) or, since the Sprint-10F refinement, Image Persistence
   * Challenge™'s position (1-5) in that day's image sequence. null for
   * single-shot missions (Candle Tratak™). */
  levelNumber: number | null
  /** Sprint 10D: structured Intelligent Focus Analyzer™ answers + computed
   * Visual Analytics for sessions using the new analyzer flow. Shape is
   * intentionally opaque here (readers that need it parse/validate their
   * own expected shape) so future missions can use a different question
   * set without touching this shared type again. */
  analyzerData: unknown | null
  /** Sprint 10F refinement: the real flat XP award for this specific row —
   * read back (not recomputed) so a day's aggregate report can sum real
   * per-image awards. */
  xpEarned: number
}
