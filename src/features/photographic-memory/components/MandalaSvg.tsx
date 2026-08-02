import type { MandalaPatternDefinition, MandalaPetalLayer } from '../categories/mandalaCategory'

type MandalaSvgProps = {
  pattern: MandalaPatternDefinition
  rotationOffsetDeg?: number
  className?: string
}

// Renders one shape instance of a layer at a given radial angle. Four
// shape families give genuine geometric variety (not just recoloring):
// petal (ellipse), diamond (rotated square), triangle (polygon), circle.
function renderLayerShape(layer: MandalaPetalLayer, angle: number): React.JSX.Element {
  const cx = 200
  const cy = 200 - layer.radius
  const radialTransform = `rotate(${angle} 200 200)`

  switch (layer.shape) {
    case 'diamond':
      return (
        <rect
          x={cx - layer.rx}
          y={cy - layer.rx}
          width={layer.rx * 2}
          height={layer.rx * 2}
          fill={layer.color}
          fillOpacity={0.85}
          transform={`${radialTransform} rotate(45 ${cx} ${cy})`}
        />
      )
    case 'triangle': {
      const s = layer.rx
      const points = `${cx},${cy - s} ${cx - s * 0.9},${cy + s * 0.7} ${cx + s * 0.9},${cy + s * 0.7}`
      return <polygon points={points} fill={layer.color} fillOpacity={0.85} transform={radialTransform} />
    }
    case 'circle':
      return <circle cx={cx} cy={cy} r={layer.rx} fill={layer.color} fillOpacity={0.85} transform={radialTransform} />
    case 'petal':
    default:
      return <ellipse cx={cx} cy={cy} rx={layer.rx} ry={layer.ry} fill={layer.color} fillOpacity={0.85} transform={radialTransform} />
  }
}

// Renders one of the MANDALA_PATTERNS definitions using the same
// radial-shape SVG technique src/features/tratak-intelligence's own
// MandalaIllustration.tsx already validates (rotated shapes in
// concentric rings around a center dot) — not imported from there (a
// different lab/feature, kept self-contained), just the same proven
// approach. `rotationOffsetDeg` rotates the entire pattern around its own
// center — used by the mandala category's near-clone distractors to make
// an otherwise-identical variant look subtly different; the center dot
// is unaffected since it sits exactly on the rotation axis. No fixed
// width/height attributes: the caller controls the rendered size
// entirely via `className` (h-48 w-48, h-full w-full, etc.), so the same
// component scales correctly whether it's the large flash-phase display
// or a small recall-grid thumbnail, on any viewport.
export function MandalaSvg({ pattern, rotationOffsetDeg = 0, className }: MandalaSvgProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="A symmetrical geometric mandala pattern">
      <circle cx={200} cy={200} r={190} fill="none" stroke="currentColor" strokeOpacity={0.06} strokeWidth={1} />
      <g transform={`rotate(${rotationOffsetDeg} 200 200)`}>
        {pattern.layers.map((layer, layerIndex) => (
          <g key={`layer-${layerIndex}`}>
            {Array.from({ length: layer.count }, (_, index) => {
              const angle = (360 / layer.count) * index
              return <g key={angle}>{renderLayerShape(layer, angle)}</g>
            })}
          </g>
        ))}
        <circle cx={200} cy={200} r={22} fill={pattern.centerColor} />
        <circle cx={200} cy={200} r={22} fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2} />
      </g>
    </svg>
  )
}
