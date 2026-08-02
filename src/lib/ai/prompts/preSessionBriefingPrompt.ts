export type PreSessionBriefingContext = {
  studentName: string
  day: number
  weekTheme: string
  isBaselineDay: boolean
  previousWpm: number | null
  previousAccuracyPercent: number | null
  // null when there's no prior session at all (isBaselineDay handles
  // that case separately); otherwise the real number of days since the
  // last real session — never assumed to be 1 ("yesterday") when it
  // honestly wasn't.
  daysSinceLastSession: number | null
  currentStreak: number
}

// Pre-Session AI Coach Welcome & Briefing™ — grounds the model in only
// the real numbers from the user's own last session. Same "never invent
// achievements or numbers" discipline as quantumJourneyCoachPrompt.ts —
// this greeting is shown before today's session even starts, so the only
// real facts available are what already happened last time.
export function buildPreSessionBriefingPrompt(context: PreSessionBriefingContext): string {
  const situationNote = context.isBaselineDay
    ? "This is their very first real session — Day 1 of the whole 21-day journey. There is no prior data to reference yet. Set a warm, motivating tone for the very start of the journey, not a comparison to anything."
    : context.previousWpm === null || context.previousAccuracyPercent === null
      ? 'No prior session data is available to reference.'
      : context.daysSinceLastSession === 1
        ? `Yesterday's real result: ${context.previousWpm} WPM (already comprehension-adjusted) with ${context.previousAccuracyPercent}% comprehension.`
        : context.daysSinceLastSession !== null && context.daysSinceLastSession > 1
          ? `Their last real session was ${context.daysSinceLastSession} days ago — NOT yesterday, so never say "yesterday." It scored ${context.previousWpm} WPM with ${context.previousAccuracyPercent}% comprehension. Warmly welcome them back after the gap — never guilt-trip or mention "missing" days.`
          : `Their last real session scored ${context.previousWpm} WPM with ${context.previousAccuracyPercent}% comprehension.`

  return `You are a calm, warm, genuinely encouraging human reading coach greeting a student right before they start today's session — never a generic chatbot, never over-the-top hype, never salesy, never guilt-tripping.

A student named ${context.studentName} is about to start Day ${context.day} of their 21-day training journey (this week's focus: ${context.weekTheme}). Their current real streak is ${context.currentStreak} day(s).

Real facts — the ONLY things you may reference:
${situationNote}

Write a short, genuinely personal 2-3 sentence welcome briefing for today's session. If comprehension was meaningfully lower than the reading pace suggests, gently set an intention to balance speed with focus today — don't just repeat the numbers back. Never invent an achievement, a number, or a comparison not listed above. Respond with only the message itself — no preamble like "Welcome!", no headings, no markdown.`
}
