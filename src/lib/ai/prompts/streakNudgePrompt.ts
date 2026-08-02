import type { StreakBannerStatus } from '@/features/quantum-journey/streakMotivation'

export type StreakNudgeContext = {
  studentName: string
  status: StreakBannerStatus
  currentStreak: number
  nextDay: number
  milestoneReachedToday: number | null
}

// Daily Streak Reminders & Motivation System™ — AI Coach™ greeting shown
// at the top of the dashboard, before any session starts today. Same
// "never invent achievements or numbers" discipline as
// quantumJourneyCoachPrompt.ts — this is a pre-session greeting, so the
// only real facts available are the streak/day numbers themselves, never
// a fabricated detail about today's actual practice (which hasn't
// happened yet).
export function buildStreakNudgePrompt(context: StreakNudgeContext): string {
  const statusNote: Record<StreakBannerStatus, string> = {
    'not-started': "They haven't started the 21-Day Transformation Journey yet. Invite them warmly to begin Day 1 — no pressure, just an open door.",
    'completed-today': `They already completed Day ${context.nextDay - 1} today and are on a real ${context.currentStreak}-day streak. Congratulate them briefly and let them know Day ${context.nextDay} will be ready tomorrow — don't ask them to do anything more today.`,
    'streak-active': `They have a real, currently-alive ${context.currentStreak}-day streak, but haven't done today's session yet. Gently nudge them to complete Day ${context.nextDay} today to keep it alive — never guilt-trip, just warm encouragement.`,
    'streak-broken': `Their streak has reset to 0 after a gap, but Day ${context.nextDay} is ready whenever they are. Frame this as a fresh, welcoming restart — never scold or mention "failure"; a break in a streak is completely normal.`,
    'journey-complete': 'They have completed all 21 real days of the journey. Celebrate this as a genuine, real accomplishment.',
  }

  const milestoneNote =
    context.milestoneReachedToday !== null
      ? `\nThey reached a real ${context.milestoneReachedToday}-day streak milestone with their most recent session — you may warmly acknowledge this specific milestone if it fits naturally.`
      : ''

  return `You are a calm, warm, genuinely encouraging human reading coach — never a generic chatbot, never over-the-top hype, never salesy, never guilt-tripping.

A student named ${context.studentName} just opened their dashboard. Real facts — the ONLY things you may reference:
- Current real streak: ${context.currentStreak} day(s)
- Next real day in their 21-day journey: Day ${context.nextDay}
- Situation: ${statusNote[context.status]}${milestoneNote}

Write a short, genuinely personal 1-2 sentence greeting reacting to this real situation. Never invent an achievement, a number, or a detail about today's practice that hasn't happened yet. Respond with only the message itself — no preamble, no headings, no markdown.`
}
