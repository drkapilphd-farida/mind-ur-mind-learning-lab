import type { ColorShapeCell, ColorShapePattern } from '../categories/colorShapeCategory'

function renderCellShape(cell: ColorShapeCell): React.JSX.Element {
  switch (cell.shape) {
    case 'circle':
      return <div className="size-full rounded-full" style={{ backgroundColor: cell.color }} />
    case 'diamond':
      return <div className="size-full rotate-45 rounded-sm" style={{ backgroundColor: cell.color }} />
    case 'triangle':
      return (
        <div
          className="size-0"
          style={{
            borderLeft: '18px solid transparent',
            borderRight: '18px solid transparent',
            borderBottom: `32px solid ${cell.color}`,
          }}
        />
      )
    case 'square':
    default:
      return <div className="size-full rounded-sm" style={{ backgroundColor: cell.color }} />
  }
}

type ColorShapeGridDisplayProps = {
  pattern: ColorShapePattern
  className?: string
}

// A small 3x2 grid of colored shapes — genuinely distinct from the
// mandala/icon-cluster categories' rendering, so each Photographic
// Memory™ category reads as a visually different challenge.
export function ColorShapeGridDisplay({ pattern, className }: ColorShapeGridDisplayProps): React.JSX.Element {
  return (
    <div className={`grid grid-cols-3 grid-rows-2 items-center justify-items-center gap-3 ${className ?? ''}`}>
      {pattern.cells.map((cell, index) => (
        <div key={index} className="flex size-8 items-center justify-center sm:size-10">
          {renderCellShape(cell)}
        </div>
      ))}
    </div>
  )
}
