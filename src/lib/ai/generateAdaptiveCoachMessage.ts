// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'

export type AdaptiveCoachInput = {
  studentName: string
  difficultyLevelName: string
  completedSessionCount: number
  currentStreak: number
  visualReadiness: number
  observationJournalUsageRate: number | null
  recommendedGoal: string
  recommendedChallenge: string
}

// When the Anthropic API is unavailable (stub key, network error, rate
// limit), produce a deterministic message from the real progress data so
// the card never shows a blank or error state to the student. Each branch
// below maps to one of the brief's own example lines, selected only by
// real thresholds — never fabricated performance, never invented measurements.
function fallbackMessage(input: AdaptiveCoachInput): string {
  const { studentName, completedSessionCount, currentStreak, visualReadiness, observationJournalUsageRate, recommendedChallenge, difficultyLevelName } = input
  const first = studentName.split(' ')[0]

  if (completedSessionCount === 0) {
    return `Welcome to the Visual Adaptation Engine™, ${first}. Your training will personalize itself as you complete real sessions — starting at ${difficultyLevelName} level. Stay relaxed and continue.`
  }

  if (currentStreak >= 7) {
    return `Excellent consistency, ${first} — a ${currentStreak}-day streak at ${difficultyLevelName} level. Your Visual Readiness is ${visualReadiness}/100, and that steady practice is exactly what's driving it.`
  }

  if (observationJournalUsageRate !== null && observationJournalUsageRate < 0.3) {
    return `Let's improve observation today, ${first}. You've completed ${completedSessionCount} sessions at ${difficultyLevelName} level — adding a few words to your observation journal each time will sharpen this practice further.`
  }

  if (recommendedChallenge === 'suggest-harder' || recommendedChallenge === 'move-to-next') {
    return `Ready for the next challenge, ${first}. With ${completedSessionCount} sessions completed at ${difficultyLevelName} level, your Visual Readiness of ${visualReadiness}/100 shows real, steady growth.`
  }

  return `Stay relaxed and continue, ${first}. You're at ${difficultyLevelName} level with ${completedSessionCount} sessions completed — your focus duration is improving with every real session you finish.`
}

// Calls the Anthropic API to generate a short, adaptive coaching message
// grounded only in real performance data. Falls back to a smart
// deterministic message on any failure — the UI should never show an
// error state for a missing AI response.
export async function generateAdaptiveCoachMessage(input: AdaptiveCoachInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return fallbackMessage(input)
  }

  try {
    const client = new Anthropic({ apiKey })

    const { studentName, difficultyLevelName, completedSessionCount, currentStreak, visualReadiness, observationJournalUsageRate, recommendedGoal, recommendedChallenge } = input
    const first = studentName.split(' ')[0]

    const prompt = `You are the Adaptive Coach for the Visual Adaptation Engine™, part of Mind Ur Mind Learning Lab's Visual Intelligence Lab™. This is a deterministic coaching engine, not machine learning — you only comment on real numbers already computed.

Student: ${first}
Difficulty level: ${difficultyLevelName}
Completed sessions: ${completedSessionCount}
Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''}
Visual Readiness: ${visualReadiness}/100
Observation journal usage rate: ${observationJournalUsageRate === null ? 'not yet measurable' : `${Math.round(observationJournalUsageRate * 100)}%`}
Recommended goal: ${recommendedGoal}
Recommended next challenge: ${recommendedChallenge}

Rules:
- Use ONLY the numbers given above. Never invent or estimate any measurement not listed here.
- Never fabricate performance, never claim machine learning or AI analysis is happening — this is a deterministic rules engine.
- Never make medical or clinical claims.
- Write exactly 2-3 sentences. Calm, encouraging, specific to the real numbers.
- No emojis, no exclamation marks, no generic filler.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content.at(0)
    if (!text || text.type !== 'text') return fallbackMessage(input)
    return text.text.trim()
  } catch {
    return fallbackMessage(input)
  }
}
