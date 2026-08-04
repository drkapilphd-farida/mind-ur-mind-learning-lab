// Parents Dashboard™ — shared types. Kept independent of any other
// feature's types (own-copy convention already used throughout this
// codebase) since a real parent-child relationship model doesn't exist
// yet — see mockData.ts for why this whole feature currently runs on
// mock data rather than real Supabase tables.

export type ChildProfile = {
  id: string
  name: string
  grade: string
  /** Two-letter fallback shown in the avatar until a real photo exists. */
  avatarInitials: string
  /** Tailwind background class for the avatar fallback, one per child so multiple children stay visually distinct. */
  avatarColorClass: string
  /** Soft matching ring color (Tailwind `ring-*` class) around the avatar — a lighter tint of avatarColorClass, not the same shade. */
  avatarRingClass: string
}

export type WeeklySnapshot = {
  childId: string
  reportWeekLabel: string
  booksRead: number
  booksReadLastWeek: number
  readingSpeedBoostPercent: number
  comprehensionScorePercent: number
  productiveMinutes: number
  distractionMinutes: number
  strengths: readonly string[]
  growthAreas: readonly string[]
}
