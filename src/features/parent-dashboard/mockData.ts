import type { ChildProfile, WeeklySnapshot } from './types'

// Parents Dashboard™ — mock data only. There is no parent account/role
// or parent-child relationship table in this codebase yet (a real build
// would need its own auth model, DB schema, and RLS policies — a
// separate project, not something to bolt on silently here). This lets
// the UI ship and be reviewed today; swapping mockData.ts for a real
// Server Action reading a real `children`/`weekly_snapshots` table later
// is a drop-in change — no component below imports this file directly
// except ParentDashboard.tsx, which is the one seam to change.

// Kept in Latin script deliberately — a real `profiles.full_name` would
// be stored in whatever script the parent typed it in (almost always
// Latin, even for Hindi speakers), so the header composes it into a
// Hindi sentence rather than assuming a hand-transliterated Devanagari
// name always exists. See ParentDashboard.tsx's header for the exact
// composition.
export const PARENT_NAME = 'Kapil'

export const CHILDREN: readonly ChildProfile[] = [
  { id: 'rahul', name: 'Rahul', grade: 'Grade 6', avatarInitials: 'RA', avatarColorClass: 'bg-indigo-600', avatarRingClass: 'ring-indigo-200' },
  { id: 'riya', name: 'Riya', grade: 'Grade 4', avatarInitials: 'RI', avatarColorClass: 'bg-emerald-600', avatarRingClass: 'ring-emerald-200' },
]

const WEEKLY_SNAPSHOTS: Record<string, WeeklySnapshot> = {
  rahul: {
    childId: 'rahul',
    reportWeekLabel: 'Feb 3 – Feb 9',
    booksRead: 4,
    booksReadLastWeek: 3,
    readingSpeedBoostPercent: 32,
    comprehensionScorePercent: 87,
    productiveMinutes: 210,
    distractionMinutes: 45,
    strengths: ['Science Fiction comprehension', 'Fast recall on Science chapters', 'Consistent 6-day practice streak'],
    growthAreas: ['History date retention', 'Slower pace on dense non-fiction text'],
  },
  riya: {
    childId: 'riya',
    reportWeekLabel: 'Feb 3 – Feb 9',
    booksRead: 2,
    booksReadLastWeek: 3,
    readingSpeedBoostPercent: 18,
    comprehensionScorePercent: 74,
    productiveMinutes: 140,
    distractionMinutes: 80,
    strengths: ['Vocabulary growth', 'Strong picture-book comprehension'],
    growthAreas: ['Focus duration in a single session', 'Quiz accuracy on Math word problems'],
  },
}

export function getWeeklySnapshot(childId: string): WeeklySnapshot {
  const snapshot = WEEKLY_SNAPSHOTS[childId]
  if (!snapshot) {
    throw new Error(`No mock weekly snapshot for child "${childId}" — add one to mockData.ts.`)
  }
  return snapshot
}
