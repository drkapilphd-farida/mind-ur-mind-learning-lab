// Memory Discovery™ Micro Feedback System™ — Sprint-1.6 FIX-08/FIX-10.
//
// "Feedback should be immediate, positive, and brief... Maximum one short
// sentence." Real, varied reinforcement after a correctly-recalled real
// round, honest encouragement (never "wrong") after a missed one, and —
// woven in on alternating real rounds — a short real AI presence nudge
// that doubles as a genuine heads-up that the next round is real harder
// (digit spans grow every round), tying FIX-06's "feel increasing
// challenge" directly to FIX-10's "AI should feel present."
const REINFORCEMENT_MESSAGES = ['✨ Nice Recall!', '⚡ Great Memory!', '🧠 Excellent Focus!', '🎯 Perfect Recognition!'] as const
const ENCOURAGEMENT_MESSAGES = ['🚀 Ready for the next one?', 'Nice — let’s keep going.'] as const
const PRESENCE_MESSAGES = ['Let’s increase the challenge.', 'You’re adapting quickly.', 'Ready for something harder?'] as const

function pickOne(items: readonly string[], seed: number): string {
  return items[Math.abs(seed) % items.length]!
}

export function pickRoundFeedback(wasCorrect: boolean, roundIndex: number, seed: number): string {
  if (!wasCorrect) return pickOne(ENCOURAGEMENT_MESSAGES, seed)
  if (roundIndex % 2 === 1) return pickOne(PRESENCE_MESSAGES, seed)
  return pickOne(REINFORCEMENT_MESSAGES, seed)
}
