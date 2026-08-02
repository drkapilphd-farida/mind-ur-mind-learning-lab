// Visual Intelligence Lab™ — Mandala Tratak™, Sprint 10B.
// After-image reflection type, shared by the image-based Tratak missions
// (Mandala/Color/Nature/Portrait/Sacred Symbol Persistence) — a self-report,
// never scored, mirrors Image Persistence Challenge™'s ReflectionResponse
// convention as a new, decoupled type.

export type TratakReflectionResponse = 'clear-afterimage' | 'brief-afterimage' | 'colors-only' | 'no-afterimage'

export const TRATAK_REFLECTION_LABEL: Record<TratakReflectionResponse, string> = {
  'clear-afterimage': 'I clearly saw the after-image',
  'brief-afterimage': 'I saw it briefly',
  'colors-only': 'I saw colors only',
  'no-afterimage': 'I did not notice an after-image',
}
