// 'healthy' iff the index's most recent consistency validation found
// zero issues; 'invalid' otherwise. Diagnostics only — never consumed
// by any retrieval-path logic.
export type IndexHealthStatus = 'healthy' | 'invalid'
