import { Badge } from '@/components/ui/badge'
import type { BlueprintDifficulty } from '@/types/learning/blueprint'

const DIFFICULTY_LABEL: Record<BlueprintDifficulty, string> = {
  beginner: 'Beginner Friendly',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

type DifficultyBadgeProps = {
  difficulty: BlueprintDifficulty
}

// One of the sprint's named reusable components — every place a
// Learning Blueprint™'s difficulty appears (today: the Blueprint page;
// later: Dashboard project cards, recommendation lists) renders this,
// never a hand-rolled badge.
export function DifficultyBadge({ difficulty }: DifficultyBadgeProps): React.JSX.Element {
  return <Badge variant="outline">{DIFFICULTY_LABEL[difficulty]}</Badge>
}
