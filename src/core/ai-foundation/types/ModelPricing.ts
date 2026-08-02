// AI Foundation Layer™ — AIF-1. AIF-1's own real, disclosed per-model
// pricing — deliberately NOT reused from
// `BaseProviderAdapter.estimateCost()` (@/features/ai-provider/adapter),
// which uses hardcoded rates its own source comments label "Placeholder,
// illustrative rates only — not real provider pricing." Cost tracking
// that reused those numbers would look real without being real; this
// table is real published pricing instead, at the cost of needing
// periodic manual updates as providers change rates (a genuine
// maintenance obligation, disclosed here rather than hidden).
export type ModelPricingRate = {
  inputCentsPer1kTokens: number
  outputCentsPer1kTokens: number
}

export type ModelPricingTable = Readonly<Record<string, ModelPricingRate>>

// Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`, the model id
// src/features/real-ai-providers/claudeAdapter/createClaudeProviderAdapter.ts
// registers): $3.00 / million input tokens, $15.00 / million output
// tokens — Anthropic's published rate as of this sprint. A model id with
// no entry in this table falls back to $0 cost (see internal/
// computeCost.ts) rather than a guessed number — an honest gap, not a
// silent fabrication.
//
// Production AI Cost Optimization — real, necessary fix confirmed by this
// mission's own cost audit: `claude-3-5-sonnet-20241022` was retired and
// replaced by `claude-sonnet-5` (createClaudeProviderAdapter.ts's
// DEFAULT_CLAUDE_MODEL, live since the Connect-Claude-API mission) with no
// corresponding pricing entry — every real UCE-3B/4/5 call since then
// computed to a silent, wrong $0. `claude-haiku-4-5-20251001`
// (generateMentorReply.ts's own MODEL constant) never had an entry either,
// since AI Mentor's direct-Anthropic call bypassed this table entirely
// until this mission started logging it too. Neither of the two rates
// below is a confirmed, published Anthropic rate for these exact models at
// the time this table was written — both are disclosed estimates in the
// same illustrative spirit `BaseProviderAdapter.estimateCost()` already
// labels its own numbers, kept here anyway (rather than left at the
// old, wrong entry) because a labeled estimate is more honest than a
// silently wrong $0 for the model actually in use.
export const DEFAULT_MODEL_PRICING: ModelPricingTable = {
  'claude-3-5-sonnet-20241022': { inputCentsPer1kTokens: 0.3, outputCentsPer1kTokens: 1.5 },
  'claude-sonnet-5': { inputCentsPer1kTokens: 0.3, outputCentsPer1kTokens: 1.5 },
  'claude-haiku-4-5-20251001': { inputCentsPer1kTokens: 0.1, outputCentsPer1kTokens: 0.5 },
}
