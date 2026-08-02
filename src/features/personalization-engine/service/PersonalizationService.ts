import type { PersonalizationDecision, PersonalizationProfile } from '../domain'
import type { EvaluationInputs } from '../integration'

// "Load profile, Evaluate rules, Produce immutable decisions, Persist
// updates. Business rules remain outside repositories." Lifecycle
// methods persist their own state change; `evaluate` never mutates the
// profile itself (evaluation is read-only — "Produce immutable
// decisions" is the only output).
export interface PersonalizationService {
  evaluate(profileId: string, inputs: EvaluationInputs): Promise<PersonalizationDecision>
  activateProfile(profileId: string): Promise<PersonalizationProfile>
  suspendProfile(profileId: string): Promise<PersonalizationProfile>
  archiveProfile(profileId: string): Promise<PersonalizationProfile>
}
