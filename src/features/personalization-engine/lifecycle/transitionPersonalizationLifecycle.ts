import type { PersonalizationLifecycleState, PersonalizationProfile } from '../domain'
import { IllegalPersonalizationLifecycleTransitionError } from './IllegalPersonalizationLifecycleTransitionError'

// The legal transition graph: Created -> Active, Active <-> Suspended
// (pause/resume), and every non-terminal state -> Archived (terminal).
// Pure — never mutates the given PersonalizationProfile, always
// returns a new one with `updatedAt` set to the given `now`.
const ALLOWED_TRANSITIONS: Record<PersonalizationLifecycleState, readonly PersonalizationLifecycleState[]> = {
  created: ['active', 'archived'],
  active: ['suspended', 'archived'],
  suspended: ['active', 'archived'],
  archived: [],
}

export function transitionPersonalizationLifecycle(
  profile: PersonalizationProfile,
  to: PersonalizationLifecycleState,
  now: string,
): PersonalizationProfile {
  const allowed = ALLOWED_TRANSITIONS[profile.lifecycle]
  if (!allowed.includes(to)) throw new IllegalPersonalizationLifecycleTransitionError(profile.lifecycle, to)
  return { ...profile, lifecycle: to, updatedAt: now }
}

// Named helpers for the transitions the service actually drives —
// deliberately distinct names from the service's own method names
// (`activateProfile`, `suspendProfile`, `archiveProfile`) to keep every
// call site unambiguous about which one it means.
export function moveProfileToActive(profile: PersonalizationProfile, now: string): PersonalizationProfile {
  return transitionPersonalizationLifecycle(profile, 'active', now)
}

export function moveProfileToSuspended(profile: PersonalizationProfile, now: string): PersonalizationProfile {
  return transitionPersonalizationLifecycle(profile, 'suspended', now)
}

export function moveProfileToArchived(profile: PersonalizationProfile, now: string): PersonalizationProfile {
  return transitionPersonalizationLifecycle(profile, 'archived', now)
}
