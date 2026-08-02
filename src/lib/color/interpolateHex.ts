// Plain RGB linear interpolation between two hex colors. Used by Brand
// Logo Warmth™ (AppSidebar.tsx) to gradually shift the logo's glow from
// brand colors toward a warning red as missedDays grows — hue-rotate()
// alone can't do this cleanly, since the two brand stops (blue ~225°,
// green ~160°) would rotate by the same offset and land on different
// target hues, not both converge on red.
function hexToRgb(hex: string): readonly [number, number, number] {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return [r, g, b]
}

function toHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, '0')
}

export function interpolateHexColor(from: string, to: string, t: number): string {
  const clampedT = Math.min(1, Math.max(0, t))
  const [fromR, fromG, fromB] = hexToRgb(from)
  const [toR, toG, toB] = hexToRgb(to)
  const r = fromR + (toR - fromR) * clampedT
  const g = fromG + (toG - fromG) * clampedT
  const b = fromB + (toB - fromB) * clampedT
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
