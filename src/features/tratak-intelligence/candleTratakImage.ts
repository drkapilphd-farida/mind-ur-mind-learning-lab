// Visual Intelligence Lab™ — Candle Tratak™, Sprint 10F. One real, self-
// generated image (SVG rasterized to JPG, same technique as the other 12
// Image Persistence Challenge™ images) — a candle flame with 3 distinct
// colour layers. No baked-in fixation dot (matches the other 12 images'
// convention) — the visible golden anchor comes entirely from the dynamic
// FixationTargetOverlay, positioned below.
//
// Sprint 10F enhancement: the SVG was regenerated with a more organic
// bezier flame silhouette and a warmer core gradient — the best a self-
// generated vector image can achieve. This is disclosed as still vector
// art, not photorealistic; the anchor was moved INSIDE the brightest
// inner core, just above the wick — the correct Tratak observation point,
// not floating above or outside the flame.

export type CandleTratakImage = {
  id: string
  src: string
  alt: string
  anchorXPercent: number
  anchorYPercent: number
}

export const CANDLE_TRATAK_IMAGE: CandleTratakImage = {
  id: 'candle-flame',
  src: '/images/candle-tratak/flame.jpg',
  alt: 'A glowing candle flame with three colour layers',
  anchorXPercent: 50,
  anchorYPercent: 48,
}
