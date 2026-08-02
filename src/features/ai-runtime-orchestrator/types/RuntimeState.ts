// One of the brief's own 10 named responsibilities. One value per
// "## Execution Flow" (§ brief) item, plus `pending`/`failed`.
// `personalization-ready`/`recommendation-ready` both advance off the
// *same* real `ai-mentor-personalization-bridge` call (see
// `../coordination/DefaultRuntimeCoordinator.ts`); `mentor-ready`
// advances off two real calls (response-composer + prompt-assembler)
// collapsing into the brief's one "AI Mentor" item.
export type RuntimeState =
  | 'pending'
  | 'personalization-ready'
  | 'recommendation-ready'
  | 'mentor-ready'
  | 'provider-selected'
  | 'model-selected'
  | 'request-ready'
  | 'adapter-processed'
  | 'response-ready'
  | 'completed'
  | 'failed'
