import type { ExerciseLabelVariant } from './quantumJourneyLevels'

// Dynamic Zener Card Naming Variant™ — persistence layer. UTM/campaign
// params are normally only present on whichever single URL an ad
// actually links to (e.g. Day 1) — by the time a learner reaches Week 3
// (Days 15-21, the only week the Zener drill appears), that param is
// long gone from the URL on every ordinary internal navigation since
// then. Captured once into localStorage on any page load that happens
// to carry it, then read back for the rest of this browser's journey —
// same "capture once, persist client-side" pattern this feature already
// uses for progress/recent-content history (see curriculumProgress.ts /
// readingContent/index.ts).
const STORAGE_KEY = 'qsr-journey-exercise-label-variant'

// Real ad campaigns can tag with either a dedicated `variant` param or
// the platform's own utm_source — both are honored so this works
// regardless of which the actual ad campaign sets up.
const PRODUCTIVITY_UTM_SOURCES: ReadonlySet<string> = new Set(['google-ads', 'meta-ads', 'facebook-ads', 'instagram-ads', 'productivity', 'qsr-ads'])

function readVariantFromSearchParams(searchParams: URLSearchParams): ExerciseLabelVariant | null {
  const explicitVariant = searchParams.get('variant')
  if (explicitVariant === 'productivity' || explicitVariant === 'spiritual') return explicitVariant

  const utmSource = searchParams.get('utm_source')
  if (utmSource !== null && PRODUCTIVITY_UTM_SOURCES.has(utmSource.toLowerCase())) return 'productivity'

  return null
}

// Call on mount with the current page's real search params — a no-op
// (never overwrites an already-persisted variant with the default) when
// this specific page load carries no recognizable source signal.
export function captureExerciseLabelVariant(searchParams: URLSearchParams): void {
  if (typeof window === 'undefined') return
  const variant = readVariantFromSearchParams(searchParams)
  if (variant === null) return
  try {
    window.localStorage.setItem(STORAGE_KEY, variant)
  } catch {
    // localStorage full or blocked — this visit just falls back to the default label
  }
}

// 'spiritual' (the original label) is the honest default for a user
// with no captured signal — never assume productivity/ad intent absent
// real evidence of it.
export function getPersistedExerciseLabelVariant(): ExerciseLabelVariant {
  if (typeof window === 'undefined') return 'spiritual'
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'productivity' ? 'productivity' : 'spiritual'
  } catch {
    return 'spiritual'
  }
}
