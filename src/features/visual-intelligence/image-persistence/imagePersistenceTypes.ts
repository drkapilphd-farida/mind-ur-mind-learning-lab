// Sprint-3B — expanded from 3 to 4 premium observation-card values.
// `observation_response` has always been a plain nullable text column
// specifically to allow this kind of evolution without a migration.
export type ObservationResponse = 'clearly-saw' | 'noticed-details' | 'light-patterns' | 'nothing-yet'

export function isObservationResponse(value: string): value is ObservationResponse {
  return value === 'clearly-saw' || value === 'noticed-details' || value === 'light-patterns' || value === 'nothing-yet'
}
