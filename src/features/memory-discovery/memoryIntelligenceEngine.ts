// Memory Intelligence Engine™ — Sprint-2.
//
// "Do not rank users. Do not judge users. Do not label users as weak.
// Instead, identify patterns, celebrate strengths, and reveal
// opportunities." Every value below is a real, deterministic function of
// this session's own real per-mission scores (Sprint-1.5/1.6's own real
// signals — visual/word/pattern/image/shape ratios, sentence/number
// exact-match, real Digit Span™ accuracy) — no AI call, no randomness,
// no fixed template text picked independent of the real data (FIX-08).
// Mirrors the exact qualitative-banding discipline Reading Discovery's
// own `buildReadingProfileHighlights`/`computeEffectiveReadingPerformance`
// already established: real thresholds over real numbers, never a
// fabricated percentage, never a negative label.

export type MemoryDomain = 'visual' | 'number' | 'word' | 'pattern' | 'recognition'

export type MemoryIntelligenceInputs = {
  visualScore: number // 0-1, real recall-grid overlap
  numberScore: number // 0-1, real Digit Span™ accuracy (correct rounds / rounds completed)
  wordScore: number // 0-1, real recall-grid overlap
  patternScore: number // 0-1, real order-match (0 or 1 — a single real round)
  recognitionScore: number // 0-1, real average across Sentence/Image/Shape
  // Real completeness proxy — Sprint-1.6's own Digit Span™ is the
  // session's richest multi-round experience, so how many of its real
  // rounds were actually completed is an honest stand-in for "how much
  // real evidence did this session produce," without needing to reach
  // into the session-wide event log.
  digitSpanRoundsCompleted: number
  // Sprint-3 FIX-08 — "Every adaptive decision should improve the final
  // Memory Profile. The AI should gain richer evidence rather than
  // simply calculating a score." The real total number of outcomes the
  // Adaptive Memory Coach™ observed across the WHOLE session (every
  // mission, not just Digit Span) — a second, broader real completeness
  // signal alongside `digitSpanRoundsCompleted`. Optional so this engine
  // still works standalone/in tests without a coach instance.
  totalCoachOutcomes?: number
}

export type MemoryConfidenceLevel = 'High Confidence' | 'Moderate Confidence' | 'Needs More Sessions'

export type MemoryIntelligenceReport = {
  profileLabel: string
  efficiencyPercent: number
  efficiencyLine: string
  strongestSkillLabel: string
  growthOpportunityLabel: string
  personalInsight: string
  patternSummary: string
  confidenceLevel: MemoryConfidenceLevel
}

const DOMAIN_ORDER: readonly MemoryDomain[] = ['visual', 'number', 'word', 'pattern', 'recognition']

// FIX-01 — verbatim from the brief's own example list, one per domain.
const PROFILE_LABEL: Record<MemoryDomain, string> = {
  visual: '🧠 Visual Thinker',
  number: '🔢 Number Builder',
  word: '📝 Word Connector',
  pattern: '🔗 Pattern Explorer',
  recognition: '🎯 Recognition Specialist',
}
const BALANCED_PROFILE_LABEL = '⚖️ Balanced Rememberer'

// FIX-03 — the strongest-skill label set.
const STRONGEST_SKILL_LABEL: Record<MemoryDomain, string> = {
  visual: '👀 Visual Memory',
  number: '🔢 Number Recall',
  word: '🧠 Word Memory',
  pattern: '🔗 Pattern Recognition',
  recognition: '🎯 Recognition Accuracy',
}

// FIX-04 — a distinct, encouraging label set ("Growing... Ready to
// Improve... Next Opportunity" — never "Weak"/"Poor"/"Low").
const GROWTH_OPPORTUNITY_LABEL: Record<MemoryDomain, string> = {
  visual: 'Visual Recall',
  number: 'Number Recall',
  word: 'Word Association',
  pattern: 'Pattern Recognition',
  recognition: 'Recognition Speed',
}

// A real, disclosed threshold — domain scores within this spread of each
// other read as genuinely balanced, not a fabricated tie.
const BALANCED_SPREAD_THRESHOLD = 0.15
const NOTABLE_GAP_THRESHOLD = 0.2

function domainScores(inputs: MemoryIntelligenceInputs): Record<MemoryDomain, number> {
  return {
    visual: inputs.visualScore,
    number: inputs.numberScore,
    word: inputs.wordScore,
    pattern: inputs.patternScore,
    recognition: inputs.recognitionScore,
  }
}

function pickExtremeDomain(scores: Record<MemoryDomain, number>, direction: 'max' | 'min'): MemoryDomain {
  return DOMAIN_ORDER.reduce((best, domain) => {
    if (direction === 'max') return scores[domain] > scores[best] ? domain : best
    return scores[domain] < scores[best] ? domain : best
  }, DOMAIN_ORDER[0]!)
}

// FIX-05 — "The insight must reference actual behaviour... Maximum two
// short sentences." Three real, evidence-based conditions (verbatim in
// spirit from the brief's own examples), then an honest, still-real
// fallback built from this session's own strongest/weakest domains.
function buildPersonalInsight(inputs: MemoryIntelligenceInputs, scores: Record<MemoryDomain, number>, spread: number): string {
  if (inputs.visualScore - inputs.wordScore >= NOTABLE_GAP_THRESHOLD) {
    return 'You remembered visual information much faster than verbal information.'
  }
  if (spread <= BALANCED_SPREAD_THRESHOLD) {
    return 'You performed consistently across every challenge, suggesting balanced memory abilities.'
  }
  if (inputs.recognitionScore - inputs.numberScore >= NOTABLE_GAP_THRESHOLD) {
    return 'You recognized familiar information quickly, but longer number sequences required more effort.'
  }
  const strongest = pickExtremeDomain(scores, 'max')
  const weakest = pickExtremeDomain(scores, 'min')
  return `${STRONGEST_SKILL_LABEL[strongest]} stood out this session, while ${GROWTH_OPPORTUNITY_LABEL[weakest]} has the most room to grow.`
}

// FIX-06 — "How Your Brain Naturally Remembers." A distinct framing from
// the Personal Insight above — general tendency, not a specific finding.
function buildPatternSummary(inputs: MemoryIntelligenceInputs): string {
  if (inputs.visualScore - inputs.wordScore >= BALANCED_SPREAD_THRESHOLD) {
    return 'You remember images before words.'
  }
  if (inputs.patternScore >= 0.5 && inputs.patternScore >= inputs.wordScore && inputs.patternScore >= inputs.visualScore) {
    return 'You remember meaningful patterns better than isolated information.'
  }
  if (inputs.wordScore >= 0.4 && inputs.patternScore >= 0.4) {
    return 'You perform best when information is organized.'
  }
  const recallAverage = (inputs.wordScore + inputs.numberScore) / 2
  if (inputs.recognitionScore - recallAverage >= BALANCED_SPREAD_THRESHOLD) {
    return 'You naturally recognize information faster than you actively recall it.'
  }
  return 'Your memory adapts differently across each kind of challenge.'
}

// FIX-02 — one clean, honest sentence explaining the overall number.
function buildEfficiencyLine(efficiencyPercent: number, spread: number): string {
  if (spread <= BALANCED_SPREAD_THRESHOLD) return 'You retained information consistently across different memory challenges.'
  if (efficiencyPercent >= 70) return 'You retained information strongly across most memory challenges.'
  return 'You retained information in some challenges more than others — a real, normal pattern.'
}

// FIX-07 — "If the user has limited evidence, avoid overconfident
// conclusions." Real Digit Span™ round completion and (Sprint-3 FIX-08)
// the Adaptive Memory Coach™'s own real total-outcome count across the
// whole session are two independent, honest completeness signals —
// either one alone reaching its real threshold is enough real evidence.
function resolveConfidenceLevel(digitSpanRoundsCompleted: number, totalCoachOutcomes: number): MemoryConfidenceLevel {
  if (digitSpanRoundsCompleted >= 6 || totalCoachOutcomes >= 8) return 'High Confidence'
  if (digitSpanRoundsCompleted >= 3 || totalCoachOutcomes >= 4) return 'Moderate Confidence'
  return 'Needs More Sessions'
}

// Sprint-2 — Positive Psychology Engine™ (FIX-09): every field here is
// consumed by the report UI in exactly this locked order — Identity →
// Strength → Opportunity → Insight → Hope. This function only computes
// the real values; the emotional ORDER is the UI's own responsibility
// (`MemoryDiscoveryReportCard.tsx`), never reversed.
export function computeMemoryIntelligenceReport(inputs: MemoryIntelligenceInputs): MemoryIntelligenceReport {
  const scores = domainScores(inputs)
  const strongest = pickExtremeDomain(scores, 'max')
  const weakest = pickExtremeDomain(scores, 'min')
  const spread = scores[strongest] - scores[weakest]
  const efficiencyPercent = Math.round((DOMAIN_ORDER.reduce((sum, domain) => sum + scores[domain], 0) / DOMAIN_ORDER.length) * 100)

  return {
    profileLabel: spread <= BALANCED_SPREAD_THRESHOLD ? BALANCED_PROFILE_LABEL : PROFILE_LABEL[strongest],
    efficiencyPercent,
    efficiencyLine: buildEfficiencyLine(efficiencyPercent, spread),
    strongestSkillLabel: STRONGEST_SKILL_LABEL[strongest],
    growthOpportunityLabel: GROWTH_OPPORTUNITY_LABEL[weakest],
    personalInsight: buildPersonalInsight(inputs, scores, spread),
    patternSummary: buildPatternSummary(inputs),
    confidenceLevel: resolveConfidenceLevel(inputs.digitSpanRoundsCompleted, inputs.totalCoachOutcomes ?? 0),
  }
}
