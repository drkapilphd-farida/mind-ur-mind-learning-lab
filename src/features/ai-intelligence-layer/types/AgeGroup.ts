// Coarse age banding for tone/persona selection — never an exact age or
// birthdate (this layer takes no PII). 'child' is what routes toward
// Parent Guide™ in the Mentor Persona Engine's default selection logic.
export type AgeGroup = 'child' | 'teen' | 'adult'
