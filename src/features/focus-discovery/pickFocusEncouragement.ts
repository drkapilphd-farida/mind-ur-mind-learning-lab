import type { AiVoiceMemory } from './aiVoiceMemory'
import type { FocusDiscoveryEvent } from './types'

// Micro AI Feedback™ / AI Trust™ — Sprint-1.9 AI Presence Engine™. "The
// AI should not constantly speak. The AI should constantly understand."
// A real, short, calm line — a cognitive coach's observation, never a
// game narrator's exclamation — computed from that exact mission's own
// real result and this real session's own real memory (`AiVoiceMemory`):
// never repeats a line already said this session, and returns real
// silence (`null`) once every real candidate for this exact context has
// already been used. "Only comment on observed behaviour."
type MissionResultEvent = Exclude<FocusDiscoveryEvent, { type: 'scene_timing' }>

function attentionLockCandidates(result: Extract<MissionResultEvent, { type: 'attention_lock_result' }>): string[] {
  if (result.falseTaps === 0) return ['Excellent filtering.', 'Selective attention looks strong.', 'Strong attention.']
  if (result.falseTaps <= 2) return ["You're filtering distractions well.", 'Good discrimination under distraction.']
  return ['Nice recovery.', 'Take your time.', 'Stay with the target.']
}

function visualSearchCandidates(result: Extract<MissionResultEvent, { type: 'visual_search_result' }>): string[] {
  if (result.wrongTapsTotal === 0) return ['Your visual search was sharp.', 'Excellent filtering.', 'Strong scanning.']
  return ['Nice recovery.', 'Take your time.']
}

function reactionFocusCandidates(result: Extract<MissionResultEvent, { type: 'reaction_focus_result' }>): string[] {
  if (result.prematureTaps === 0 && result.missedTargets === 0) return ['Your reactions were precise.', 'Strong attention.']
  if (result.prematureTaps > result.hits) return ['Take your time.', 'Stay with the target.']
  return ['Nice recovery.', "You're adapting quickly."]
}

function sustainedFocusCandidates(result: Extract<MissionResultEvent, { type: 'sustained_focus_result' }>): string[] {
  if (result.lateAccuracy >= result.earlyAccuracy) return ['You maintained attention well.', 'Strong attention under distraction.']
  return ['Distractions increased later in the session.', 'Take your time.']
}

function cognitiveFlexibilityCandidates(result: Extract<MissionResultEvent, { type: 'cognitive_flexibility_result' }>): string[] {
  if (result.incorrectHabitResponses === 0) return ["You're adapting quickly.", 'Strong rule adaptation.']
  return ['Nice recovery — switching rules takes practice.', 'Take your time.']
}

function missionCandidates(result: MissionResultEvent): string[] {
  if (result.type === 'attention_lock_result') return attentionLockCandidates(result)
  if (result.type === 'visual_search_result') return visualSearchCandidates(result)
  if (result.type === 'reaction_focus_result') return reactionFocusCandidates(result)
  if (result.type === 'sustained_focus_result') return sustainedFocusCandidates(result)
  return cognitiveFlexibilityCandidates(result)
}

// Behavioural Memory™ — a real, cross-mission trend (`AiVoiceMemory`'s
// own `getTrend()`) earns one real, generic line at the FRONT of this
// mission's own candidates — "Recovery Intelligence™: if the user
// struggles, encourage rather than punish."
export function pickFocusEncouragement(result: MissionResultEvent, memory: AiVoiceMemory): string | null {
  const trend = memory.getTrend()
  const candidates = missionCandidates(result)
  if (trend === 'improving') candidates.unshift("You're adapting quickly.")
  else if (trend === 'declining') candidates.unshift('Take your time.')
  return memory.pickLine(candidates)
}
