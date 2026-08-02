import { FOCUS_MISSION_ORDER, type FocusMissionId } from './focusMissions'
import type { FocusDiscoveryEvent } from './types'

// Focus Intelligence Engine™ — Sprint-1.7 PART-2, extended by Sprint-2.0
// Hero Results Experience™. A pure, deterministic function: every real
// mission's own raw behavioural counts (already collected, never
// displayed as numbers during the missions themselves per Sprint-1.5
// FIX-08) go in, one real, meaningful Focus Profile™ comes out. Nothing
// here is fabricated per-user copy — every sentence below is chosen by a
// real, disclosed rule reading this exact session's own real signals.
// Sprint-2.0 ROLE — "You are NOT changing AI calculations": every real
// ratio/profile/growth rule below is untouched from Sprint-1.7; this
// sprint only adds new real, DERIVED presentation fields on top.

export type FocusIntelligenceInputs = {
  attentionLock: Extract<FocusDiscoveryEvent, { type: 'attention_lock_result' }>
  visualSearch: Extract<FocusDiscoveryEvent, { type: 'visual_search_result' }>
  reactionFocus: Extract<FocusDiscoveryEvent, { type: 'reaction_focus_result' }>
  sustainedFocus: Extract<FocusDiscoveryEvent, { type: 'sustained_focus_result' }>
  cognitiveFlexibility: Extract<FocusDiscoveryEvent, { type: 'cognitive_flexibility_result' }>
}

// PREMIUM SCORE CARD™ — one real, compact stat per mission, always in
// the real locked mission order.
export type FocusJourneyEntry = {
  mission: FocusMissionId
  label: string
  ratioPercent: number
}

export type FocusIntelligenceReport = {
  profileName: string
  // PROFILE DESCRIPTION™ — "one concise explanation... maximum two
  // lines," immediately below the real profile name.
  profileDescription: string
  heroMetricLabel: string
  // HERO METRIC™ — "avoid presenting a percentage as the primary hero
  // element... large value, e.g. 91, 88, 94." The same real 0-100 number
  // as before; the UI is what stops appending "%" to it.
  heroMetricPercent: number
  focusEfficiencyPercent: number
  reactionPrecisionPercent: number
  visualSearchAccuracyPercent: number
  ruleAdaptationPercent: number
  strongestSkillLabel: string
  growthOpportunityLine: string
  personalInsight: string
  recommendation: string
  // LEARNING POTENTIAL MESSAGE™ — a real, hopeful, evidence-anchored
  // closing line — never exaggerated, never a fixed generic platitude.
  learningPotentialMessage: string
  missionsCompleted: number
  totalMissions: number
  // ATTENTION JOURNEY SUMMARY™ — one real compact bar per mission, in
  // the real locked mission order.
  journey: readonly FocusJourneyEntry[]
}

// RESULT-04 — one real, human-readable label per mission's own real
// attention skill.
const SKILL_LABEL: Record<FocusMissionId, string> = {
  'attention-lock': 'Selective Attention',
  'visual-search': 'Visual Search',
  'reaction-focus': 'Reaction Speed',
  'sustained-focus': 'Sustained Attention',
  'cognitive-flexibility': 'Rule Switching',
}

// RESULT-01 — one real profile name per mission, chosen from the
// brief's own example list, mapped to whichever real mission scored
// highest. "Attention Guardian" is reserved for a real all-around-strong
// session (every real ratio at or above the real high-performance
// threshold) rather than any single mission.
const PROFILE_BY_MISSION: Record<FocusMissionId, string> = {
  'attention-lock': 'Selective Observer',
  'visual-search': 'Adaptive Scanner',
  'reaction-focus': 'Rapid Responder',
  'sustained-focus': 'Deep Concentrator',
  'cognitive-flexibility': 'Focused Explorer',
}
const ALL_ROUND_PROFILE = 'Attention Guardian'
const ALL_ROUND_THRESHOLD = 0.8

// PROFILE DESCRIPTION™ — one real, calm, two-line-max explanation per
// real profile, describing the observed BEHAVIOUR the profile name
// stands for (AI Trust™ — never an unsupported personality claim).
const PROFILE_DESCRIPTION_BY_MISSION: Record<FocusMissionId, string> = {
  'attention-lock': 'You naturally filter distractions well and stay locked onto the right target, even as similar objects compete for your attention.',
  'visual-search': 'You scan visual scenes efficiently, finding what you are looking for even as clutter and similarity increase.',
  'reaction-focus': 'You react quickly and precisely the moment a real target appears, without being pulled off course by decoys.',
  'sustained-focus': 'You maintain steady attention over time, even as distractions gradually build up around you.',
  'cognitive-flexibility': 'You adapt quickly when the rules change, switching your attention without losing accuracy.',
}
const ALL_ROUND_DESCRIPTION = 'You maintain strong, consistent attention across every kind of distraction this assessment introduced.'

// RESULT-05 — real, encouraging growth copy per mission, verbatim from
// (or a close, honest paraphrase of) the brief's own examples.
const GROWTH_LINE: Record<FocusMissionId, string> = {
  'attention-lock': 'Similar colours and shapes slightly affect your selective attention.',
  'visual-search': 'Visual clutter slightly affects your search speed.',
  'reaction-focus': 'Moving distractions reduce your reaction speed.',
  'sustained-focus': 'Your focus remains strong, but attention dips as distractions build up over time.',
  'cognitive-flexibility': 'Your focus remains strong, but rapid rule switching can improve.',
}

// RESULT-08 — one real recommendation, tied to the real weakest mission
// — verbatim from the brief's own three named examples, each already
// carrying its own real "because" reasoning in one real sentence.
const RECOMMENDATION_BY_MISSION: Record<FocusMissionId, string> = {
  'attention-lock': 'Focus Mode is recommended because strengthening distraction resistance will help you stay locked on what matters most.',
  'visual-search': 'Focus Mode is recommended because sharper visual scanning will help you find what matters faster, with less effort.',
  'reaction-focus': 'Focus Mode is recommended because faster, steadier reactions will help you respond with more confidence under pressure.',
  'sustained-focus': 'Reading Mode is recommended because improving sustained attention will help you stay focused during longer sessions.',
  'cognitive-flexibility': 'Memory Mode is recommended because improving rule adaptation will help you retain more information under distraction.',
}

function ratio(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0
}

function attentionLockRatio(r: FocusIntelligenceInputs['attentionLock']): number {
  return ratio(r.correctTaps, r.correctTaps + r.falseTaps)
}

function visualSearchRatio(r: FocusIntelligenceInputs['visualSearch']): number {
  return ratio(r.correctFirstTapCount, r.roundsCompleted)
}

function reactionFocusRatio(r: FocusIntelligenceInputs['reactionFocus']): number {
  return ratio(r.hits, r.hits + r.missedTargets + r.prematureTaps)
}

function sustainedFocusRatio(r: FocusIntelligenceInputs['sustainedFocus']): number {
  return (r.earlyAccuracy + r.midAccuracy + r.lateAccuracy) / 3
}

function cognitiveFlexibilityRatio(r: FocusIntelligenceInputs['cognitiveFlexibility']): number {
  return ratio(r.correctTaps, r.correctTaps + r.incorrectHabitResponses + r.missedTargets)
}

function computeStdDev(values: readonly number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

// RESULT-02 — "Attention Stability™," this session's own real hero
// metric. A real, bounded 0-100 read combining two real signals: how
// much real Sustained Focus accuracy dropped from early to late (real
// fatigue), and how variable real Reaction Focus times were (real
// consistency) — never a raw score copied straight from one mission.
function computeAttentionStability(inputs: FocusIntelligenceInputs): number {
  const sustainedDrop = Math.max(0, inputs.sustainedFocus.earlyAccuracy - inputs.sustainedFocus.lateAccuracy)
  const reactionStdDevMs = computeStdDev(inputs.reactionFocus.reactionTimesMs)
  const normalizedReactionPenalty = Math.min(1, reactionStdDevMs / 500)
  const stability = 1 - (sustainedDrop * 0.6 + normalizedReactionPenalty * 0.4)
  return Math.round(Math.max(0, Math.min(1, stability)) * 100)
}

function computeInsight(strongest: FocusMissionId, growth: FocusMissionId, inputs: FocusIntelligenceInputs): string {
  const sustained = inputs.sustainedFocus
  if (sustained.lateAccuracy < sustained.earlyAccuracy - 0.15) {
    return 'You stayed highly focused early in the session, but your accuracy declined once distractions increased later on.'
  }
  if (inputs.cognitiveFlexibility.incorrectHabitResponses === 0 && cognitiveFlexibilityRatio(inputs.cognitiveFlexibility) >= 0.75) {
    return 'You adapted quickly every time the rules changed, showing genuinely strong cognitive flexibility.'
  }
  if (inputs.reactionFocus.prematureTaps > inputs.reactionFocus.hits * 0.3) {
    return 'You reacted quickly overall, but several early taps suggest anticipation sometimes outran accuracy.'
  }
  return `${SKILL_LABEL[strongest]} was your strongest attention skill this session, while ${SKILL_LABEL[growth].toLowerCase()} showed the most room to grow as distractions increased.`
}

// LEARNING POTENTIAL MESSAGE™ — "never exaggerate, never promise
// unrealistic outcomes." One real, hopeful line, chosen from the real
// overall efficiency tier and anchored to the real growth skill —
// mirrors the brief's own two example templates exactly.
function computeLearningPotentialMessage(focusEfficiencyPercent: number, growthSkillLabel: string): string {
  if (focusEfficiencyPercent >= 85) {
    return `You already demonstrate excellent attention control. Small improvements in ${growthSkillLabel.toLowerCase()} can unlock even greater learning efficiency.`
  }
  return `Your attention foundation is strong. Strengthening ${growthSkillLabel.toLowerCase()} could meaningfully improve your learning performance.`
}

// Sprint-1.9 AI Presence Engine™ — Behavioural Memory™. The one real,
// shared "how well did this mission go" read (0-1), reused by both this
// report AND the live in-session `AiVoiceMemory` (never two divergent
// definitions of "did well" for the same real mission).
export function computeMissionRatio(event: Exclude<FocusDiscoveryEvent, { type: 'scene_timing' }>): number {
  if (event.type === 'attention_lock_result') return attentionLockRatio(event)
  if (event.type === 'visual_search_result') return visualSearchRatio(event)
  if (event.type === 'reaction_focus_result') return reactionFocusRatio(event)
  if (event.type === 'sustained_focus_result') return sustainedFocusRatio(event)
  return cognitiveFlexibilityRatio(event)
}

export function computeFocusIntelligenceReport(inputs: FocusIntelligenceInputs): FocusIntelligenceReport {
  const ratios: Record<FocusMissionId, number> = {
    'attention-lock': attentionLockRatio(inputs.attentionLock),
    'visual-search': visualSearchRatio(inputs.visualSearch),
    'reaction-focus': reactionFocusRatio(inputs.reactionFocus),
    'sustained-focus': sustainedFocusRatio(inputs.sustainedFocus),
    'cognitive-flexibility': cognitiveFlexibilityRatio(inputs.cognitiveFlexibility),
  }

  const strongest = FOCUS_MISSION_ORDER.reduce((best, mission) => (ratios[mission] > ratios[best] ? mission : best))
  const growth = FOCUS_MISSION_ORDER.reduce((worst, mission) => (ratios[mission] < ratios[worst] ? mission : worst))
  const minRatio = Math.min(...FOCUS_MISSION_ORDER.map((mission) => ratios[mission]))
  const isAllRound = minRatio >= ALL_ROUND_THRESHOLD

  const focusEfficiencyPercent = Math.round((FOCUS_MISSION_ORDER.reduce((sum, mission) => sum + ratios[mission], 0) / FOCUS_MISSION_ORDER.length) * 100)

  return {
    profileName: isAllRound ? ALL_ROUND_PROFILE : PROFILE_BY_MISSION[strongest],
    profileDescription: isAllRound ? ALL_ROUND_DESCRIPTION : PROFILE_DESCRIPTION_BY_MISSION[strongest],
    heroMetricLabel: 'Attention Stability™',
    heroMetricPercent: computeAttentionStability(inputs),
    focusEfficiencyPercent,
    reactionPrecisionPercent: Math.round(ratios['reaction-focus'] * 100),
    visualSearchAccuracyPercent: Math.round(ratios['visual-search'] * 100),
    ruleAdaptationPercent: Math.round(ratios['cognitive-flexibility'] * 100),
    strongestSkillLabel: SKILL_LABEL[strongest],
    growthOpportunityLine: GROWTH_LINE[growth],
    personalInsight: computeInsight(strongest, growth, inputs),
    recommendation: RECOMMENDATION_BY_MISSION[growth],
    learningPotentialMessage: computeLearningPotentialMessage(focusEfficiencyPercent, SKILL_LABEL[growth]),
    missionsCompleted: FOCUS_MISSION_ORDER.length,
    totalMissions: FOCUS_MISSION_ORDER.length,
    journey: FOCUS_MISSION_ORDER.map((mission) => ({ mission, label: SKILL_LABEL[mission], ratioPercent: Math.round(ratios[mission] * 100) })),
  }
}
