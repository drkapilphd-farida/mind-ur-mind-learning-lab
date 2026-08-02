// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'

export type VisualDnaCoachInput = {
  studentName: string
  observationStyle: string
  focusStyle: string
  topStrengthLabel: string | null
  topGrowthOpportunityLabel: string | null
  visualIntelligenceScore: number
  growthPercent: number | null
}

// When the Anthropic API is unavailable (stub key, network error, rate
// limit), produce a deterministic message from the real progress data so
// the card never shows a blank or error state to the student.
function fallbackMessage(input: VisualDnaCoachInput): string {
  const { studentName, topStrengthLabel, topGrowthOpportunityLabel, visualIntelligenceScore, growthPercent, observationStyle } = input
  const first = studentName.split(' ')[0]

  if (visualIntelligenceScore === 0) {
    return `Welcome, ${first}. Your Visual DNA™ will take shape as you complete real training sessions — there isn't enough data yet to generate a personalized summary.`
  }

  const strengthPhrase = topStrengthLabel ? `You show real strength in ${topStrengthLabel}` : `Your ${observationStyle.toLowerCase()} tendencies are still forming a clear pattern`
  const growthPhrase = topGrowthOpportunityLabel
    ? `${topGrowthOpportunityLabel} is your best next area of focus`
    : 'continuing consistent practice will keep sharpening every dimension'
  const trendPhrase = growthPercent !== null && growthPercent > 0 ? ` Your Visual Intelligence Score has grown ${growthPercent}% recently.` : ''

  return `${strengthPhrase}, and ${growthPhrase}.${trendPhrase} Continue training consistently over the next few sessions to accelerate improvement.`
}

// Calls the Anthropic API to generate a short, personal coaching summary
// grounded only in real, already-computed Visual DNA results.
export async function generateVisualDnaCoachMessage(input: VisualDnaCoachInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return fallbackMessage(input)
  }

  try {
    const client = new Anthropic({ apiKey })

    const { studentName, observationStyle, focusStyle, topStrengthLabel, topGrowthOpportunityLabel, visualIntelligenceScore, growthPercent } = input
    const first = studentName.split(' ')[0]

    const prompt = `You are the AI Coach for Visual DNA™, the intelligence profile engine of Mind Ur Mind Learning Lab's Visual Intelligence Lab™. This is a deterministic system, not machine learning — you only comment on real numbers already computed.

Student: ${first}
Observation Style: ${observationStyle}
Focus Style: ${focusStyle}
Top strength: ${topStrengthLabel ?? 'not yet measurable'}
Top growth opportunity: ${topGrowthOpportunityLabel ?? 'not yet measurable'}
Visual Intelligence Score: ${visualIntelligenceScore}/1000
Recent growth: ${growthPercent === null ? 'not enough history yet' : `${growthPercent}%`}

Rules:
- Use ONLY the information given above. Never invent or estimate any measurement not listed here.
- Never claim machine learning or medical/clinical analysis is happening.
- Write exactly 2-3 sentences. Calm, personal, specific to the real data given.
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
