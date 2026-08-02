// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'

const REFLECTION_LABEL: Record<string, string> = {
  'bright-image': 'a brighter afterimage',
  'dim-image': 'a dimmer afterimage',
  'colours-changed': 'the colours shifting',
  'nothing-noticeable': 'nothing noticeable yet',
}

export type PersistenceChallengeCoachInput = {
  studentName: string
  completedSessionCount: number
  currentStreak: number
  persistenceScore: number
  reflectionResponse: string
  challengeLabel: string
}

// When the Anthropic API is unavailable (stub key, network error, rate
// limit), produce a deterministic message from the real progress data so
// the card never shows a blank or error state to the student.
function fallbackMessage(input: PersistenceChallengeCoachInput): string {
  const { studentName, completedSessionCount, currentStreak, persistenceScore, reflectionResponse } = input
  const first = studentName.split(' ')[0]
  const noticed = REFLECTION_LABEL[reflectionResponse] ?? 'your own observation'

  if (completedSessionCount === 0) {
    return `Excellent first observation, ${first}. You noticed ${noticed} — every person notices something different, and there's no right answer here. Daily practice like this is how visual attention builds over time.`
  }

  if (currentStreak >= 7) {
    return `${first}, your ${currentStreak}-day streak shows real consistency with this practice. Noticing ${noticed} today is simply your own honest observation — keep showing up daily.`
  }

  if (persistenceScore >= 70) {
    return `Strong practice, ${first}. Your Visual Persistence Score of ${persistenceScore}/100 reflects real, consistent observation sessions. Noticing ${noticed} is exactly the kind of honest self-awareness this practice builds.`
  }

  return `${first}, you've completed ${completedSessionCount} observation session${completedSessionCount === 1 ? '' : 's'} so far. Noticing ${noticed} is a valid, personal observation — everyone experiences this practice differently. Keep practicing daily.`
}

// Calls the Anthropic API to generate short, supportive feedback grounded
// only in real completed performance and the student's own reflection.
export async function generatePersistenceChallengeCoachMessage(input: PersistenceChallengeCoachInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return fallbackMessage(input)
  }

  try {
    const client = new Anthropic({ apiKey })

    const { studentName, completedSessionCount, currentStreak, persistenceScore, reflectionResponse, challengeLabel } = input
    const first = studentName.split(' ')[0]
    const noticed = REFLECTION_LABEL[reflectionResponse] ?? 'their own observation'

    const prompt = `You are the AI Coach for Image Persistence Challenge™, part of Mind Ur Mind Learning Lab's Visual Intelligence Lab™.

Student: ${first}
Just completed: ${challengeLabel} observation challenge
What they noticed: ${noticed}
Completed challenges: ${completedSessionCount}
Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''}
Visual Persistence Score: ${persistenceScore}/100

Rules:
- Use ONLY the numbers and observation given above. Never invent or estimate any measurement not listed here.
- Never fabricate neuroscience claims or mechanisms. Never promise supernatural abilities. Never claim medical or clinical benefits.
- Acknowledge that different people notice different things — there is no "right" observation.
- Write exactly 2-3 sentences. Calm, supportive, specific to the real numbers and their actual observation.
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
