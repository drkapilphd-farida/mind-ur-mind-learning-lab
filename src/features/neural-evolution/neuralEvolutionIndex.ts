// Mind Ur Mind Learning Lab™ — Neural Evolution Index™.
// THIS IS NOT scoped to Visual Intelligence Lab — this is the global,
// cross-lab architecture for the future Mind Ur Mind Learning Lab™.
// Visual Intelligence is the first lab to contribute a real dimension;
// future labs (Reading, Memory, Focus, Meditation, Emotional Intelligence)
// will contribute their own dimensions later without needing this file to
// be redesigned — this is why every dimension already carries a
// 'coming-soon' state and the aggregate only ever averages active ones.

export type NeuralEvolutionDimensionId =
  | 'visual-intelligence'
  | 'brain-adaptation'
  | 'attention-stability'
  | 'learning-readiness'
  | 'cognitive-flexibility'

export type NeuralEvolutionDimension = {
  id: NeuralEvolutionDimensionId
  label: string
  status: 'active' | 'coming-soon'
  /** 0-100, null when status is 'coming-soon'. Never estimated for a
   * not-yet-built module — that would be exactly the fabrication this
   * architecture is designed to avoid. */
  score: number | null
}

export type NeuralEvolutionIndexResult = {
  dimensions: readonly NeuralEvolutionDimension[]
  /** Average of only the 'active' dimensions' scores — honestly discloses
   * how many of the 5 dimensions are actually contributing. */
  overallScore: number
  activeDimensionCount: number
}

export function computeNeuralEvolutionIndex(contributions: readonly NeuralEvolutionDimension[]): NeuralEvolutionIndexResult {
  const activeScores = contributions.filter((d) => d.status === 'active' && d.score !== null).map((d) => d.score as number)

  const overallScore = activeScores.length === 0 ? 0 : Math.round(activeScores.reduce((sum, score) => sum + score, 0) / activeScores.length)

  return {
    dimensions: contributions,
    overallScore,
    activeDimensionCount: activeScores.length,
  }
}
