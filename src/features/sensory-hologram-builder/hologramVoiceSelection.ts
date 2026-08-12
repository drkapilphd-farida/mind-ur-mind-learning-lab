// Sensory Hologram Builder™ — pure voice-selection logic for
// `window.speechSynthesis`. Kept free of the Web Speech API itself (which
// can't be constructed outside a browser) so the actual matching logic is
// unit-testable with plain object literals shaped like SpeechSynthesisVoice,
// per this app's established "extract the pure decision logic" discipline.
//
// There is no existing speechSynthesis precedent anywhere else in this
// codebase — this is the first voice-narration exercise built, so this
// selection heuristic (and the fallback-when-nothing-matches behavior) is
// established here for the first time, not reused from a sibling.
export type NarrationLanguage = 'en' | 'hi'

export const NARRATION_LANGUAGE_TAGS: Record<NarrationLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
}

// The minimal shape this module actually needs from a real
// SpeechSynthesisVoice — narrower on purpose so tests can pass plain
// object literals instead of constructing (unconstructable) real
// SpeechSynthesisVoice instances.
export type VoiceLike = { name: string; lang: string }

// Browsers vary wildly in which voices they expose and how they name
// them — there's no standardized "gender" field on SpeechSynthesisVoice,
// so this is a name-heuristic best effort, not a guarantee. Covers common
// male voice names across Chrome/Edge/Safari's built-in English and Hindi
// voice sets. Falls back gracefully (see pickVoiceForLanguage) when no
// heuristic match exists in the current browser/OS — never throws, never
// leaves narration silently broken.
const MALE_VOICE_NAME_HINTS: readonly string[] = [
  'male',
  'hemant',
  'ravi',
  'madhur',
  'prabhat',
  'daniel',
  'david',
  'george',
  'guy',
  'james',
  'mark',
  'rishi',
  'aaron',
  'fred',
  'oliver',
  'thomas',
]

// Word-boundary matching, not a plain substring check — "Samantha
// (Female)" contains the literal substring "male" (fe-MALE-), so a naive
// `.includes('male')` would misclassify a female voice as male. `\b`
// requires an actual word boundary on both sides of the hint, which
// "Female" doesn't have before its embedded "male".
function isLikelyMaleVoice(voice: VoiceLike): boolean {
  return MALE_VOICE_NAME_HINTS.some((hint) => new RegExp(`\\b${hint}\\b`, 'i').test(voice.name))
}

// Picks the best available voice for a language: prefers an exact BCP-47
// match (e.g. "hi-IN") over a bare-language match (e.g. any "hi-*"), and
// within whichever match tier is available, prefers a name-heuristic male
// voice. Returns null (never throws) when the browser has no voice at all
// for the requested language — the caller is expected to fall back to a
// silent, timer-paced session rather than crash.
export function pickVoiceForLanguage<T extends VoiceLike>(voices: readonly T[], language: NarrationLanguage): T | null {
  const langPrefix = language === 'hi' ? 'hi' : 'en'
  const exactTag = NARRATION_LANGUAGE_TAGS[language].toLowerCase()

  const exactMatches = voices.filter((voice) => voice.lang.toLowerCase() === exactTag)
  const prefixMatches = voices.filter((voice) => voice.lang.toLowerCase().startsWith(langPrefix))
  const candidates = exactMatches.length > 0 ? exactMatches : prefixMatches
  if (candidates.length === 0) return null

  const maleMatch = candidates.find((voice) => isLikelyMaleVoice(voice))
  return maleMatch ?? candidates[0]!
}
