// Discover Your Learning Potential™ — Sprint-1 Foundation. "Who are you
// learning with today?" real client state only — deliberately not
// persisted to the dormant `families`/`family_members` tables in
// Sprint-1 (real family-member creation needs a name-capture form, which
// this sprint's own locked spec explicitly forbids: "No additional
// onboarding. No forms."). A future sprint wires those tables for real
// once that constraint is revisited.
export type LearnerType = 'myself' | 'child'

export type LearnerContext = {
  learnerType: LearnerType
}
