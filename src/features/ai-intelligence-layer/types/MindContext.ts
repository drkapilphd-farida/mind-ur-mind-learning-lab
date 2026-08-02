// The Mind Context Engine's™ output — every score defaults to `0`
// when not supplied, matching how the platform's own UI already
// represents "no score yet" (e.g. "Mind Score™ 0 · Activate Your
// Mind") — never an invented positive number ("No hallucinated
// scores" is a Safety Rules Engine concern this type supports by
// construction).
export type MindContext = {
  mindScore: number
  readingScore: number
  memoryScore: number
  focusScore: number
  visualIntelligenceScore: number
  consistency: number
  xp: number
  streak: number
  currentProgress: number
}
