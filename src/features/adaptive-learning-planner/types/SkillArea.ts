// The 3 trainable skill areas this planner reasons about, plus
// 'general' for a goal that doesn't map cleanly to one of them.
// Independently declared here — not imported from any other feature —
// this planner stays fully self-contained ("Provider Agnostic").
export type SkillArea = 'reading' | 'memory' | 'focus' | 'general'
