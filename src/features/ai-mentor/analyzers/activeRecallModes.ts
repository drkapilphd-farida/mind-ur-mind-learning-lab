// Shared between mockWeaknessDetector and mockStrengthDetector — one
// definition of "which study modes count as active recall" so the two
// analyzers can never silently disagree ("no duplicated logic").
export const ACTIVE_RECALL_MODES: ReadonlySet<string> = new Set(['quiz', 'flashcard', 'practice'])
