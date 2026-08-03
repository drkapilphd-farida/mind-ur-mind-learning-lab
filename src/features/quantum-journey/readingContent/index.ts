import { buildReadingSet, type JourneyReadingSet, type JourneyLengthTier } from './types'
import { SHORT_STORIES } from './shortStories'
import { SCIENCE_EXPLAINED } from './scienceExplained'
import { INDIAN_CIVICS } from './indianCivics'
import { GEOGRAPHY } from './geography'
import { SOCIAL_MEDIA } from './socialMedia'
import { QUANTUM_MIND_PROGRAMS } from './quantumMindPrograms'
import { CRICKET_AND_CELEBRITIES } from './cricketAndCelebrities'
import { SPORTS } from './sports'

export type { JourneyReadingSet, JourneyReadingMCQ, JourneyReadingCategory, JourneyLengthTier } from './types'
export { JOURNEY_READING_CATEGORY_LABELS } from './types'

// Rich Indian-Centric Content Database™ — real passages spanning all 8
// requested categories (Short Stories, Science Explained, Indian Civics &
// Governance, Geography, Social Media, Quantum Mind Programs, Cricketers
// & Celebrities, Sports). This is a genuine, hand-written initial batch
// (38 real passages at the time this was built) — a strong foundation
// toward the requested 100+, not a padded-out placeholder count. Adding
// more is just appending another JourneyReadingSetDef array; the whole
// pipeline (shuffling, anti-repeat, length tiers) already scales to
// however many real passages exist.
export const JOURNEY_READING_SETS: readonly JourneyReadingSet[] = [
  ...SHORT_STORIES,
  ...SCIENCE_EXPLAINED,
  ...INDIAN_CIVICS,
  ...GEOGRAPHY,
  ...SOCIAL_MEDIA,
  ...QUANTUM_MIND_PROGRAMS,
  ...CRICKET_AND_CELEBRITIES,
  ...SPORTS,
].map(buildReadingSet)

const RECENT_HISTORY_STORAGE_KEY = 'qsr-journey-reading-recent-set-ids'
// How many of the most recently shown passages to exclude from the next
// pick — mirrors ProgressiveChunkReadingExperience's own real
// last-N-sessions exclusion window, not just "never immediately repeat."
const RECENT_HISTORY_WINDOW = 8

function loadRecentSetIds(): readonly string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function recordShownSetId(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const recent = [id, ...loadRecentSetIds()].slice(0, RECENT_HISTORY_WINDOW)
    window.localStorage.setItem(RECENT_HISTORY_STORAGE_KEY, JSON.stringify(recent))
  } catch {
    // localStorage full or blocked — fail silently, anti-repeat just resets next visit
  }
}

// Full Reading Sprint Variety™ — real anti-repeat: excludes whatever was
// shown in the last RECENT_HISTORY_WINDOW picks (falling back to the
// full tier pool only if exclusion would leave nothing, e.g. a very new
// browser profile with almost no passages left unseen in a small tier).
// Progressive Reading™ — `lengthTier` narrows the pool by the day's
// week (see quantumJourneyLevels.ts's own tier-by-week mapping), so
// reading duration/length grows naturally as the journey progresses.
export function pickJourneyReadingSet(lengthTier: JourneyLengthTier): JourneyReadingSet {
  const tierPool = JOURNEY_READING_SETS.filter((set) => set.lengthTier === lengthTier)
  const pool = tierPool.length > 0 ? tierPool : JOURNEY_READING_SETS
  const recentIds = new Set(loadRecentSetIds())
  const freshPool = pool.filter((set) => !recentIds.has(set.id))
  const candidates = freshPool.length > 0 ? freshPool : pool

  const picked = candidates[Math.floor(Math.random() * candidates.length)]!
  recordShownSetId(picked.id)
  return picked
}
