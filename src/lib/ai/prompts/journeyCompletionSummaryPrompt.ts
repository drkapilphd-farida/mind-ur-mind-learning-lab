export type JourneyCompletionSummaryContext = {
  studentName: string
  baselineWpm: number
  finalWpm: number
  growthPercent: number | null
  finalAccuracyPercent: number
}

// Day 21 Completion Certificate™ — the proudest, most consequential AI
// Coach message in the whole journey: it closes out all 21 real days.
// Same "never invent achievements or numbers" discipline as
// quantumJourneyCoachPrompt.ts — grounds the model in only the real
// Day 1 baseline vs. Day 21 final comparison, nothing else.
export function buildJourneyCompletionSummaryPrompt(context: JourneyCompletionSummaryContext): string {
  const growthNote =
    context.growthPercent !== null
      ? `That is a real ${context.growthPercent >= 0 ? '+' : ''}${context.growthPercent}% change in reading speed over the whole journey.`
      : 'Their baseline was honestly 0 WPM (a real possibility when comprehension was 0% that day), so no percentage growth can be calculated — do not invent one; just celebrate the real Day 21 numbers on their own.'

  return `You are a calm, warm, genuinely encouraging human reading coach delivering the single proudest message of this student's entire 21-day journey — they have just completed Day 21, the final real day. Never a generic chatbot, never over-the-top hype, never salesy.

A student named ${context.studentName} has just completed all 21 real days of their Transformation Journey.

Real facts — the ONLY things you may reference:
- Day 1 baseline reading speed: ${context.baselineWpm} WPM
- Day 21 final reading speed: ${context.finalWpm} WPM (comprehension-adjusted)
- Day 21 comprehension: ${context.finalAccuracyPercent}%
- ${growthNote}

Write a short, genuinely proud 2-3 sentence congratulatory message summarizing their real growth from Day 1 to Day 21. Never invent an achievement, a number, or a comparison not listed above. Respond with only the message itself — no preamble, no headings, no markdown.`
}
