// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'

export type FixationCoachInput = {
  studentName: string
  completedSessionCount: number
  currentStreak: number
  focusScore: number // 0-100, from computeFocusScore
  mostPracticedExerciseLabel: string | null // null if fewer than 1 session
  lastSessionExerciseLabel: string | null // the exercise just completed
}

// When the Anthropic API is unavailable (stub key, network error, rate
// limit), produce a deterministic message from the real progress data so
// the card never shows a blank or error state to the student.
function fallbackMessage(input: FixationCoachInput): string {
  const { studentName, completedSessionCount, currentStreak, focusScore, mostPracticedExerciseLabel, lastSessionExerciseLabel } = input
  const first = studentName.split(' ')[0]

  if (completedSessionCount === 0) {
    return `Welcome to Visual Fixation Engine™, ${first}. Your first fixation session is the start of building real visual attention control — a few minutes today is all it takes to begin.`
  }

  if (currentStreak >= 7) {
    return `${first}, your ${currentStreak}-day streak on ${lastSessionExerciseLabel ?? 'Visual Fixation Engine™'} shows real consistency. Your Visual Focus Score is ${focusScore}/100 — steady practice like this is exactly how attention control builds over time.`
  }

  if (focusScore >= 70) {
    return `Strong session, ${first}. Your Visual Focus Score of ${focusScore}/100 reflects real, consistent practice with ${mostPracticedExerciseLabel ?? 'this engine'}. Keep showing up — that's what's driving the progress.`
  }

  return `${first}, you've completed ${completedSessionCount} fixation session${completedSessionCount === 1 ? '' : 's'} so far${mostPracticedExerciseLabel ? `, most often with ${mostPracticedExerciseLabel}` : ''}. Every session builds on the last — keep practicing to grow your Visual Focus Score.`
}

// Calls the Anthropic API to generate a short, motivational coach message
// grounded only in real completed performance. Falls back to a smart
// deterministic message on any failure — the UI should never show an error
// state for a missing AI response.
export async function generateFixationCoachMessage(input: FixationCoachInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return fallbackMessage(input)
  }

  try {
    const client = new Anthropic({ apiKey })

    const { studentName, completedSessionCount, currentStreak, focusScore, mostPracticedExerciseLabel, lastSessionExerciseLabel } = input
    const first = studentName.split(' ')[0]

    const prompt = `You are the AI Coach for Visual Fixation Engine™, part of Mind Ur Mind Learning Lab's Visual Intelligence Lab™.

Student: ${first}
Completed fixation sessions: ${completedSessionCount}
Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''}
Visual Focus Score: ${focusScore}/100
Most practiced exercise: ${mostPracticedExerciseLabel ?? 'none yet'}
Just completed: ${lastSessionExerciseLabel ?? 'a fixation session'}

Rules:
- Use ONLY the numbers given above. Never invent or estimate any measurement, eye-tracking data, accuracy percentage, or number not listed here.
- Never claim to have measured eye movement, gaze, blink rate, or attention directly — this app has no camera or eye tracking. Only completion, duration, streak, and self-reported session data are real.
- Never make medical or clinical claims (no diagnosis, no therapeutic claims).
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
