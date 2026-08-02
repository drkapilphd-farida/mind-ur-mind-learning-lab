type PetalLayer = {
  count: number
  radius: number
  rx: number
  ry: number
  color: string
}

// Outer to inner rings — a hand-authored, fully static SVG mandala (no
// external image asset exists anywhere in this codebase). Deliberately
// colourful (the brief calls for "colourful mandalas") since good colour
// saturation and contrast is what makes an after-image effect work during
// the eyes-closed phase. Never animated, zoomed, or rotated at runtime —
// every petal's position is baked into the static markup below.
const PETAL_LAYERS: readonly PetalLayer[] = [
  { count: 16, radius: 150, rx: 42, ry: 15, color: '#f97316' },
  { count: 12, radius: 112, rx: 32, ry: 13, color: '#ec4899' },
  { count: 8, radius: 74, rx: 24, ry: 11, color: '#8b5cf6' },
  { count: 6, radius: 42, rx: 15, ry: 7, color: '#06b6d4' },
]

const GUIDE_RING_RADII = [170, 130, 92, 56] as const

type MandalaIllustrationProps = {
  size?: number
  className?: string
}

export function MandalaIllustration({ size = 320, className }: MandalaIllustrationProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="A symmetrical, colourful mandala for visual fixation"
    >
      <circle cx={200} cy={200} r={190} fill="none" stroke="#ffffff" strokeOpacity={0.06} strokeWidth={1} />
      {GUIDE_RING_RADII.map((radius) => (
        <circle key={radius} cx={200} cy={200} r={radius} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={1} />
      ))}

      {PETAL_LAYERS.map((layer) => (
        <g key={layer.radius}>
          {Array.from({ length: layer.count }, (_, index) => {
            const angle = (360 / layer.count) * index
            return (
              <ellipse
                key={angle}
                cx={200}
                cy={200 - layer.radius}
                rx={layer.rx}
                ry={layer.ry}
                fill={layer.color}
                fillOpacity={0.85}
                transform={`rotate(${angle} 200 200)`}
              />
            )
          })}
        </g>
      ))}

      <circle cx={200} cy={200} r={22} fill="#fde047" />
      <circle cx={200} cy={200} r={22} fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2} />
    </svg>
  )
}
