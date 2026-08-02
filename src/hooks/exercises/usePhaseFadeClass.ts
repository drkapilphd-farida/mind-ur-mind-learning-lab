// Sprint-12D — Motion Language™. The one shared phase-transition idiom for
// Mandala Persistence™ and Image Persistence Challenge™ — both previously
// redefined this identical string independently. Extracting it here
// guarantees they stay byte-identical by construction, per the brief's
// "Image Persistence: reuse exactly the same transition language."
export function usePhaseFadeClass(prefersReducedMotion: boolean): string {
  return !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-(--duration-base)' : ''
}
