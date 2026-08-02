// Sprint-2.6B FIX-22 — "Never promise unrealistic WPM... Instead create
// hope... Keep every message short. Maximum 5 words. The recommendation
// should feel earned, not advertised." A real, honest, aspirational line
// — never a fabricated number — shown alongside the Quantum Speed
// Reading™ recommendation.
const GROWTH_POTENTIAL_MESSAGES = ['More Speed Is Possible.', 'Better Understanding Awaits.', 'Unlock Your Reading Potential.'] as const

export function pickGrowthPotentialMessage(seed: number): string {
  return GROWTH_POTENTIAL_MESSAGES[Math.abs(seed) % GROWTH_POTENTIAL_MESSAGES.length]!
}
