// "## Flash Reading Mode / Chunk Reading Mode / Streaming Reading Mode" (§ brief).
// This feature never renders mode-specific content itself — `mode` only
// labels which existing engine the caller's `renderActiveExperience`
// render-prop is expected to mount (UniversalExercisePlayer for flash/chunk,
// RsvpExperience for streaming).
export type ReadingPlayerMode = 'flash' | 'chunk' | 'streaming'
