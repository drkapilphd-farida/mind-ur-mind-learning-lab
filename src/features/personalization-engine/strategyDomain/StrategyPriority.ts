// A plain, non-negative integer. Lower numbers win — "Selection must
// preserve rule priority": among eligible strategies of the same
// `StrategyType`, the one with the lowest `priority` value is
// selected (see `strategySelection/selectStrategies.ts`).
export type StrategyPriority = number
