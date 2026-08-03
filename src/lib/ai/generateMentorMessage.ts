// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'

export type MentorMessageInput = {
  studentName: string
  currentStreak: number
  bestStreak: number
  completedCount: number
  totalCount: number
  todaySessionCount: number
  totalCompletedSessions: number
}

// When the Anthropic API is unavailable (stub key, network error, rate limit),
// produce a deterministic message from the real progress data so the card
// never shows a blank or error state to the student.
function fallbackMessage(input: MentorMessageInput): string {
  const { studentName, currentStreak, completedCount, totalCount, todaySessionCount } = input
  const first = studentName.split(' ')[0]

  if (completedCount === 0) {
    return `Welcome to your transformation journey, ${first}. Your first Mind Session is ready — it takes less than 5 minutes and it's the most important step you'll take today. Every expert was once a beginner.`
  }

  if (todaySessionCount > 0) {
    if (currentStreak >= 7) {
      return `${first}, your ${currentStreak}-day streak shows real commitment to your mind. You've already practiced today — that consistency is what transforms potential into ability. Keep building on this momentum.`
    }
    return `You've already practiced today, ${first} — that single decision puts you ahead of where you were yesterday. Your mind is building new habits with every session. Keep going.`
  }

  if (currentStreak >= 3) {
    return `${first}, you're on a ${currentStreak}-day streak. That kind of consistency is how transformation actually happens — not in one big session, but in showing up every single day. Your mind is ready for today's practice.`
  }

  const remaining = totalCount - completedCount
  if (remaining === 1) {
    return `${first}, you're one exercise away from completing the Eye Foundation Module. This is the kind of moment that separates those who intend to grow from those who actually do. Today is the day.`
  }

  return `${first}, you've completed ${completedCount} of ${totalCount} exercises in your Reading Intelligence journey. Every practice session is rewiring how your mind processes information. Today's session matters.`
}

// Calls the Anthropic API to generate a personalized, transformation-focused
// mentor message. Falls back to a smart deterministic message on any failure —
// the UI should never show an error state for a missing AI response.
export async function generateMentorMessage(input: MentorMessageInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return fallbackMessage(input)
  }

  try {
    const client = new Anthropic({ apiKey })

    const { studentName, currentStreak, bestStreak, completedCount, totalCount, todaySessionCount, totalCompletedSessions } = input
    const first = studentName.split(' ')[0]

    const prompt = `You are the AI Mentor for Quantum Mind Learning Lab™ — a premium AI-powered brain transformation platform. Your voice is that of a calm, wise, personally invested mind coach. Not a tutor. Not a teacher. A transformation partner.

Student: ${first}
Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''}
Best streak: ${bestStreak} day${bestStreak !== 1 ? 's' : ''}
Reading exercises completed: ${completedCount} of ${totalCount}
Sessions today: ${todaySessionCount}
Total sessions ever: ${totalCompletedSessions}

Write exactly 2–3 sentences.
Be specific about their actual numbers — don't be generic.
Sound like someone who genuinely knows them and is rooting for them.
Focus on transformation, growth, momentum — never content or lessons.
Never use: course, lesson, chapter, curriculum, content, module completion, video.
Use: practice, session, mind, transformation, growth, momentum, journey, consistency.
No emojis. No exclamation marks. No corporate language. Calm and direct.`

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
