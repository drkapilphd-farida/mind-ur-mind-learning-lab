// A fixed, closed set of deterministic comparisons — "No AI reasoning.
// No ML. No probability." Every operator is a plain, exact comparison
// against a fact value, never a fuzzy/semantic/scored match.
export type PersonalizationConditionOperator = 'equals' | 'greater-than' | 'less-than' | 'contains'
