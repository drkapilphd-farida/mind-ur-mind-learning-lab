// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'
import type { JourneyStatus } from '@/lib/exercises/mindScore'

export type MindScoreInsightsInput = {
  studentName: string
  mindScore: number
  readingScore: number
  weeklyTrend: number | null   // % change vs prior period; null = insufficient data
  currentStreak: number
  completedCount: number
  totalCount: number
  journeyStatus: JourneyStatus
}

// Deterministic insights generated from real data when the Anthropic API
// is unavailable. Uses the actual numbers so the card is never generic.
function fallbackInsights(input: MindScoreInsightsInput): string[] {
  const { mindScore, readingScore, weeklyTrend, currentStreak, completedCount, totalCount, journeyStatus } = input

  const insights: string[] = []

  // Mind Score insight
  if (mindScore === 0) {
    insights.push('Your Mind Score will activate after your first completed session.')
  } else {
    insights.push(`Your Mind Score is ${mindScore} — ${mindScore >= 600 ? 'you are performing at a high level' : 'every session adds to this score'}.`)
  }

  // Reading insight
  if (completedCount > 0) {
    const remaining = totalCount - completedCount
    if (remaining > 0) {
      insights.push(`Reading Intelligence: ${readingScore}/100. ${remaining} exercise${remaining !== 1 ? 's' : ''} remain in the Eye Foundation Module — completing them will raise your score.`)
    } else {
      insights.push(`Reading Intelligence: ${readingScore}/100. Eye Foundation Module complete — maintain your streak to keep the score growing.`)
    }
  }

  // Trend insight
  if (weeklyTrend !== null && weeklyTrend > 0) {
    insights.push(`Practice volume is up ${weeklyTrend}% versus earlier this week — that momentum is measurable.`)
  } else if (weeklyTrend !== null && weeklyTrend < 0) {
    insights.push(`Practice time is down ${Math.abs(weeklyTrend)}% versus earlier this week. A single session today will reverse the trend.`)
  }

  // Streak insight
  if (currentStreak >= 7) {
    insights.push(`${currentStreak}-day streak — this level of consistency is what separates students who transform from those who plateau.`)
  } else if (currentStreak >= 3) {
    insights.push(`${currentStreak}-day streak. Keep going — habits form at the 7-day mark.`)
  } else if (currentStreak === 0 && completedCount > 0) {
    insights.push('Start a new streak today. Your past practice is still in your memory — you will pick up faster than you think.')
  }

  // Journey status insight
  if (journeyStatus === 'Accelerating') {
    insights.push('Your progress is accelerating. This is the phase where real transformation happens.')
  } else if (journeyStatus === 'Recovering') {
    insights.push('Returning after a break? Your brain retains more than you feel. One session brings momentum back.')
  }

  return insights.slice(0, 3) // Show at most 3 focused insights
}

export async function generateMindScoreInsights(input: MindScoreInsightsInput): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return fallbackInsights(input)
  }

  try {
    const client = new Anthropic({ apiKey })
    const { studentName, mindScore, readingScore, weeklyTrend, currentStreak, completedCount, totalCount, journeyStatus } = input
    const first = studentName.split(' ').at(0) ?? studentName

    const prompt = `You are the AI Intelligence Analyst for Mind Ur Mind Learning Lab™ — a premium brain transformation platform.

Generate exactly 3 concise, specific intelligence insights for ${first}.

Data:
- Mind Score: ${mindScore}/1000
- Reading Intelligence: ${readingScore}/100
- Exercises completed: ${completedCount}/${totalCount}
- Streak: ${currentStreak} days
- Weekly trend: ${weeklyTrend !== null ? `${weeklyTrend > 0 ? '+' : ''}${weeklyTrend}% vs prior period` : 'insufficient data'}
- Journey status: ${journeyStatus}

Rules:
- Each insight is 1–2 sentences maximum
- Reference the actual numbers — not generic encouragement
- Focus on transformation and intelligence growth, not content completion
- Tone: calm, intelligent, data-driven mentor — never cheerleader
- Never use: course, lesson, chapter, curriculum, video, content, completion
- Use: practice, intelligence, score, session, growth, momentum, transformation
- Return each insight as a separate line, no bullets or numbering`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content.at(0)
    if (!text || text.type !== 'text') return fallbackInsights(input)

    const lines = text.text.trim().split('\n').filter((l) => l.trim().length > 0).slice(0, 3)
    return lines.length > 0 ? lines : fallbackInsights(input)
  } catch {
    return fallbackInsights(input)
  }
}
