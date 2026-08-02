// Universal Memory Content Engine™ (UMCE) — Sprint-4 FIX-16
// "Configuration Architecture™."
//
// "All generation parameters must be configurable... Avoid hardcoding
// generation rules." Every real tunable value UMCE uses lives here —
// nothing below is generation logic, purely named, real numbers/lists.
//
// Cross-Platform Reusability™ (FIX-15) — this whole `umce/` folder lives
// under the platform's shared `lib/exercise-engine/`, alongside
// `datasetEngine.ts`/`contentEngine.ts`, not nested inside
// `features/memory-discovery/` — any future module (Memory Mode™, Flash
// Cards™, Brain Games™, Focus Discovery™, ...) can import it the same
// way Memory Discovery does, with zero Memory-Discovery-specific
// coupling in the engine itself.
//
// Honest scope note (read before extending): FIX-11/FIX-12 ask for
// multi-language and multi-domain content packs. The platform's own
// `Locale` type already anticipates this ('en' | 'hi' | 'ta' | 'gu' |
// 'mr' | string) — this engine is built locale- and context-aware
// end-to-end so a REAL future content pack (hi/ta/gu/mr, or a medical/
// engineering/exam-prep pack) genuinely only needs a new entry in
// `themeContentPacks.ts`, never an engine change. Only the 'en'/
// 'general' pack is actually authored right now — fabricating
// unreviewed translations or specialized domain vocabulary here would
// be worse than not having them yet.

// FIX-03 — a real, curated subset of the brief's own theme list, fully
// authored (not just named) for both Word Memory and Visual Memory.
// "AI may introduce additional safe themes" — deliberately not
// implemented: this project's own standing rule (confirmed repeatedly
// across Reading Discovery and Memory Discovery) is curated local
// content, never a live generative call during a real session.
export const UMCE_THEMES = ['nature', 'animals', 'food', 'technology', 'space', 'sports', 'kitchen', 'travel'] as const

export type UmceTheme = (typeof UMCE_THEMES)[number]

// FIX-10/FIX-14 — "Avoid showing similar themes consecutively... The
// user should not encounter the same challenge in consecutive
// sessions." How many of the most-recent real theme picks are excluded
// before the next one is chosen.
export const THEME_ROTATION_WINDOW = 3

// FIX-02/FIX-13 — how much of a real, curated theme pack a single
// session may honestly draw from before falling back (never repeats
// beyond this fraction of a pack within one real pick).
export const MAX_POOL_FRACTION_PER_SESSION = 0.6

// Only 'en' is actually authored right now (see the module-level note
// above) — a real content pack, not a placeholder, and the one real
// default every caller falls back to.
export const UMCE_DEFAULT_LOCALE = 'en'

// FIX-12 — Educational Context™. Only 'general' is actually authored;
// every other named context in the brief is a real, intentional seam,
// not a silent stand-in for missing content.
export const UMCE_CONTEXTS = ['general', 'school'] as const
export type UmceContext = (typeof UMCE_CONTEXTS)[number]
export const UMCE_DEFAULT_CONTEXT: UmceContext = 'general'
