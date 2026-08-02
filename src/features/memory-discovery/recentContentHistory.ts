// Memory Discovery™ Recent Content History — mirrors Word Flash's own
// getRecentlyShownStimuli pattern (wordFlashHistory.ts) exactly: a small,
// localStorage-backed record of which content ids were shown in the last
// few sessions, so the next session can deprioritize them via the
// dataset engine's existing excludeIds mechanism (getContentForExercise
// already supports this — avoidRecentRepeats in datasetEngine.ts). Not a
// general analytics history, just enough to make "no two replays feel
// identical" real across page loads, not only within one.
//
// Pure localStorage I/O, called from the orchestrator (a client
// component) — loadContent.ts itself stays a pure function, same
// separation of concerns already used for reading the difficulty tier.

const HISTORY_KEY = 'memory-discovery-recent-content'
const MAX_SESSIONS = 5
// Small window (not the full history) so a tier's pool cycles back into
// use after a couple of replays rather than shrinking forever.
const SESSION_WINDOW = 2

type RecentContentEntry = { timestamp: number; ids: string[] }

function loadHistory(): RecentContentEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RecentContentEntry[]) : []
  } catch {
    return []
  }
}

export function getRecentlyShownContentIds(): string[] {
  const history = loadHistory()
  return history.slice(-SESSION_WINDOW).flatMap((entry) => entry.ids)
}

export function recordShownContentIds(ids: readonly string[]): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadHistory()
    history.push({ timestamp: Date.now(), ids: [...ids] })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_SESSIONS)))
  } catch {
    // storage full or blocked — fail silently, content just won't be deprioritized
  }
}
