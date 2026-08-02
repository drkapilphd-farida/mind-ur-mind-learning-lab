// Sprint-2.7 FIX-32 — "AI Personal Insight™... one memorable AI insight.
// One sentence only. Friendly. Encouraging. Evidence-based. Never
// exaggerated." Real, evidence-based: keyed directly off this session's
// own real `biggestImprovement` (`buildReadingProfileHighlights`,
// FIX-27's single highest-impact real recommendation) — a real strength
// clause paired with that exact real next step, never a generic pitch.
const AI_INSIGHT_BY_IMPROVEMENT: Record<string, string> = {
  'Read Bigger Chunks': 'You recognize words quickly. Your next breakthrough is reading bigger chunks.',
  'Improve Reading Rhythm': 'You stay accurate even under speed. Now build reading rhythm.',
  'Reduce Eye Stops': 'You read with real care. Training fewer eye stops will help you flow.',
  'Read Longer Comfortably': 'You start every reading strong. Building comfort over longer stretches comes next.',
  'Increase Understanding Speed': 'Your understanding is strong. Increasing your speed is your next step.',
}

const DEFAULT_AI_INSIGHT = 'You are building real reading skill. Keep going.'

export function buildAiPersonalInsight(biggestImprovement: string): string {
  return AI_INSIGHT_BY_IMPROVEMENT[biggestImprovement] ?? DEFAULT_AI_INSIGHT
}
