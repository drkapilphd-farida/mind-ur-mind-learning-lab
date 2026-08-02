export type CoachFeedbackContext = {
  day: number
  weekTheme: string
  trueWpm: number
  comprehensionAccuracyPercent: number
  streak: number
  step1Title: string
  step2Title: string
  isBaselineDay: boolean
  weakestDomainLabel: string | null
  // Daily Streak Reminders & Motivation System™ — set only when TODAY's
  // session is the exact one that crossed a real milestone (3/7/14/21
  // days), never a re-announcement of a milestone reached days ago (see
  // streakMotivation.ts's getMilestoneHitExactly).
  milestoneReachedToday: number | null
  // True when the user walked in with a broken streak (0) but this isn't
  // their very first session ever — a real restart worth acknowledging
  // warmly, never as a failure.
  isComebackDay: boolean
}

// AI Smart Coach™ — grounds the model in only the real numbers this exact
// session produced. "Never invent achievements or numbers" is the load-
// bearing instruction here: this is the one place in the whole 21-Day
// Journey where free-text AI output reaches the user, so it's the one
// place a hallucinated number or fabricated praise could slip in if not
// explicitly forbidden.
export function buildQuantumJourneyCoachPrompt(context: CoachFeedbackContext): string {
  const baselineNote = context.isBaselineDay
    ? '\nThis is their very first session ever — a real baseline, not yet a comparison to anything. Frame it as "day one, this is your starting line," never as an improvement or decline.'
    : ''
  const weaknessNote = context.weakestDomainLabel
    ? `\nToday's warm-up was deliberately chosen because they've recently been finding ${context.weakestDomainLabel} tough — this is targeted practice, not a random pick.`
    : ''
  const milestoneNote =
    context.milestoneReachedToday !== null
      ? `\nToday's session crossed a real ${context.milestoneReachedToday}-day streak milestone — genuinely worth celebrating, specifically.`
      : ''
  const comebackNote = context.isComebackDay
    ? '\nThey had a gap and their streak reset to 0, but they came back today anyway. Warmly acknowledge the restart — never mention "failure" or scold the gap; a break in a streak is completely normal and coming back is what matters.'
    : ''

  return `You are a calm, warm, genuinely encouraging human reading coach — never a generic chatbot, never over-the-top hype, never salesy.

A student just finished Day ${context.day} of their 21-day training journey (this week's focus: ${context.weekTheme}).

Real results from today — the ONLY facts you may reference:
- Warm-up / brain drill: ${context.step1Title}
- Second exercise: ${context.step2Title}
- True reading speed (already adjusted for comprehension): ${context.trueWpm} WPM
- Comprehension: ${context.comprehensionAccuracyPercent}%
- Current streak: ${context.streak} day(s)${baselineNote}${weaknessNote}${milestoneNote}${comebackNote}

Write a short, genuinely personal 2-3 sentence coaching message reacting to these real numbers. Never invent an achievement, a number, or a comparison not listed above. If comprehension is meaningfully lower than the reading pace would suggest, gently note that understanding matters as much as speed — don't just praise the WPM. Respond with only the message itself — no preamble like "Great job!", no headings, no markdown.`
}
