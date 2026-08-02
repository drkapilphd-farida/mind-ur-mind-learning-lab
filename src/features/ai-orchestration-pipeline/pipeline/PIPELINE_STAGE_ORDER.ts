import type { PipelineStage } from '../types'

// The fixed success path (excludes the terminal `failed` state) — used
// by `../validation/validatePipelineIntegrity.ts` to check
// `completedStages` ordering.
export const PIPELINE_STAGE_ORDER: readonly PipelineStage[] = [
  'initialized',
  'context-ready',
  'prompt-ready',
  'request-ready',
  'response-normalized',
  'completed',
]
